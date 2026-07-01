import { useAuthStore } from '~/stores/auth'
import { validateApiResponse, ValidationError } from '~/utils/validation'
import { useLogger } from '~/composables/useLogger'

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>()

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const logger = useLogger()
  const nuxtApp = useNuxtApp()

  const fetcher = $fetch.create({
    baseURL: config.public.apiBaseUrl as string,
    
    // Add retry logic for failed requests
    retry: 2,
    retryDelay: 1000,
    
    onRequest({ options, request }) {
      const method = options.method?.toUpperCase() || 'GET'
      const url = typeof request === 'string' ? request : request.toString()

      // Add auth token
      if (authStore.accessToken) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }
      
      // Add CSRF token for state-changing requests
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const csrfToken = useCookie('XSRF-TOKEN')
        if (csrfToken.value) {
          options.headers = new Headers(options.headers)
          options.headers.set('X-XSRF-TOKEN', csrfToken.value)
        }
      }
      
      // Log API request
      logger.api.request(method, url, { body: options.body })
    },
    
    onResponse({ request, options, response }) {
      const method = options.method?.toUpperCase() || 'GET'
      const url = typeof request === 'string' ? request : request.toString()

      // Clean up pending request
      if (method === 'GET') {
        const key = `${method}-${url}`
        pendingRequests.delete(key)
      }
      
      // Log API response
      const durationMs = response.headers?.get?.('x-response-time')
        ? parseInt(response.headers.get('x-response-time') as string)
        : undefined
      logger.api.response(method, url, response.status, durationMs, { dataSize: JSON.stringify(response._data)?.length })
      
      // Validate API response structure
      try {
        if (response._data) {
          // Skip validation for known non-standard endpoints
          const skipValidation = [
            '/merchants/',           // Uses status: "success" instead of success: true
            '/directory/available-codes'  // Non-standard response format
          ].some(pattern => url.includes(pattern))
          
          if (!skipValidation) {
            validateApiResponse(response._data)
          }
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          logger.warn(`API validation warning: ${error.message}`, { category: 'api', metadata: { url } })
          // Log but don't throw - allow response to continue
        }
      }
    },
    
    onResponseError({ response, request, options, error }) {
      const method = options.method?.toUpperCase() || 'GET'
      const url = typeof request === 'string' ? request : request.toString()

      // Clean up pending request
      if (method === 'GET') {
        const key = `${method}-${url}`
        pendingRequests.delete(key)
      }
      
      // Log API error
      logger.api.error(method, url, error || new Error(`HTTP ${response.status}`), { status: response.status })
      
      // Handle authentication errors - but NOT for login/logout endpoints to avoid loops
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/logout')
      
      if ((response.status === 401 || response.status === 403) && !isAuthEndpoint) {
        logger.warn('Authentication token expired or invalid. Logging out...', { category: 'auth' })
        if (import.meta.client) {
          nuxtApp.runWithContext(() => {
            authStore.logout(true)
          })
        }
      }
    }
  })

  // Wrapper with request deduplication for GET requests
  return new Proxy(fetcher, {
    apply(target, thisArg, args: any[]) {
      // Ensure we have at least the URL argument
      if (args.length === 0) {
        throw new Error('URL is required for API calls')
      }
      
      const [url, options = {}] = args as [string, any]
      const method = (options.method?.toUpperCase() || 'GET')
      
      // Only deduplicate GET requests
      if (method === 'GET') {
        const key = `${method}-${url}`
        const pending = pendingRequests.get(key)
        
        if (pending) {
          logger.api.request(method, url as string, { cached: true })
          return pending
        }
        
        // Store the promise for deduplication
        const promise = Reflect.apply(target, thisArg, args)
        pendingRequests.set(key, promise)
        
        // Clean up on completion (success or error)
        promise
          .finally(() => {
            pendingRequests.delete(key)
          })
        
        return promise
      }
      
      // For non-GET requests, just call through
      return Reflect.apply(target, thisArg, args)
    }
  }) as typeof fetcher
}
