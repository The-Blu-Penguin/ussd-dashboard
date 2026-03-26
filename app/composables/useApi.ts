import { useAuthStore } from '~/stores/auth'
import { validateApiResponse, ValidationError } from '~/utils/validation'

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>()

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  return $fetch.create({
    baseURL: config.public.apiBaseUrl as string,
    
    // Add retry logic for failed requests
    retry: 2,
    retryDelay: 1000,
    
    onRequest({ options, request }) {
      // Add auth token
      if (authStore.accessToken) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }
      
      // Add CSRF token for state-changing requests
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase() || 'GET')) {
        const csrfToken = useCookie('XSRF-TOKEN')
        if (csrfToken.value) {
          options.headers = new Headers(options.headers)
          options.headers.set('X-XSRF-TOKEN', csrfToken.value)
        }
      }
      
      // Request deduplication for GET requests
      if (options.method?.toUpperCase() === 'GET' || !options.method) {
        const key = `${options.method || 'GET'}-${request}`
        const pending = pendingRequests.get(key)
        
        if (pending) {
          // Return existing promise instead of making new request
          return pending
        }
      }
    },
    
    onResponse({ request, options, response }) {
      // Clean up pending request
      if (options.method?.toUpperCase() === 'GET' || !options.method) {
        const key = `${options.method || 'GET'}-${request}`
        pendingRequests.delete(key)
      }
      
      // Validate API response structure
      try {
        if (response._data) {
          validateApiResponse(response._data)
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          console.error('[API Validation Error]', error.message)
          // Log but don't throw - allow response to continue
        }
      }
    },
    
    onResponseError({ response, request, options }) {
      // Clean up pending request
      if (options.method?.toUpperCase() === 'GET' || !options.method) {
        const key = `${options.method || 'GET'}-${request}`
        pendingRequests.delete(key)
      }
      
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.warn('Authentication token expired or invalid. Logging out...')
        if (import.meta.client) {
          authStore.logout()
        }
      }
    }
  })
}
