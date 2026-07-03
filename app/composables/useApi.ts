import { useAuthStore } from '~/stores/auth'
import { validateApiResponse, ValidationError } from '~/utils/validation'
import { useLogger } from '~/composables/useLogger'
import { API_CACHE_TTL } from '~/constants/api'

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>()

// Response cache for GET requests
const responseCache = new Map<string, { data: any; timestamp: number }>()

/**
 * Invalidate cached response for a specific URL
 */
export const invalidateCache = (url: string) => {
  // Delete exact match and any URLs that start with the given path
  for (const key of responseCache.keys()) {
    if (key === url || key.startsWith(url)) {
      responseCache.delete(key)
    }
  }
}

/**
 * Clear all cached responses
 */
export const clearCache = () => {
  responseCache.clear()
}

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

      // Cache successful GET responses
      if (method === 'GET' && response._data && response.status >= 200 && response.status < 300) {
        const key = url
        responseCache.set(key, { data: response._data, timestamp: Date.now() })
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

  // Wrapper with request deduplication and caching
  return new Proxy(fetcher, {
    apply(target, thisArg, args: any[]) {
      // Ensure we have at least the URL argument
      if (args.length === 0) {
        throw new Error('URL is required for API calls')
      }
      
      const [url, options = {}] = args as [string, any]
      const method = (options.method?.toUpperCase() || 'GET')
      const useCache = options.cache !== false // Cache enabled by default for GET
      const useDedup = options.deduplicate !== false // Dedup enabled by default for GET
      const cacheTtl = options.cacheTtl || API_CACHE_TTL
      
      // Only apply deduplication and caching for GET requests
      if (method === 'GET') {
        const key = `${method}-${url}`

        // Check response cache first
        if (useCache) {
          const cached = responseCache.get(url as string)
          if (cached && (Date.now() - cached.timestamp) < cacheTtl) {
            logger.api.request(method, url as string, { cached: true, source: 'cache' })
            return Promise.resolve(cached.data)
          }
          // Remove stale cache entry
          if (cached) {
            responseCache.delete(url as string)
          }
        }

        // Check for in-flight deduplication
        if (useDedup) {
          const pending = pendingRequests.get(key)
          if (pending) {
            logger.api.request(method, url as string, { cached: true, source: 'dedup' })
            return pending
          }
        }
        
        // Store the promise for deduplication
        const promise = Reflect.apply(target, thisArg, args)
        if (useDedup) {
          pendingRequests.set(key, promise)
          // Clean up on completion (success or error)
          promise
            .finally(() => {
              pendingRequests.delete(key)
            })
        }
        
        return promise
      }
      
      // For non-GET requests, invalidate related cache and call through
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        invalidateCache(url as string)
      }
      return Reflect.apply(target, thisArg, args) as ReturnType<typeof fetcher>
    }
  }) as unknown as typeof fetcher
}
