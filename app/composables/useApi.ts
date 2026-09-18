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

/** Field names whose values must never reach the logger (credentials, tokens, secrets). */
const SENSITIVE_KEY_PATTERN = /pass(word)?|pwd|token|secret|authorization|auth|apikey|api_key|otp|pin|credential|cvv/i

/**
 * Recursively mask sensitive values in a request body before it is logged.
 * Handles plain objects, arrays, and already-serialized JSON strings. Anything
 * non-serializable (FormData, Blob, streams) is replaced with a placeholder so
 * we never leak raw credential material.
 */
const redactSensitive = (value: any, depth = 0): any => {
  if (value == null || depth > 4) return value

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return redactSensitive(JSON.parse(trimmed), depth + 1)
      } catch {
        return '[unparseable body]'
      }
    }
    return value
  }

  if (Array.isArray(value)) {
    return value.map(item => redactSensitive(item, depth + 1))
  }

  if (typeof value === 'object') {
    // FormData / Blob / File and other non-plain objects: don't attempt to expose fields
    if (typeof FormData !== 'undefined' && value instanceof FormData) return '[form-data]'
    if (typeof Blob !== 'undefined' && value instanceof Blob) return '[binary]'

    const output: Record<string, any> = {}
    for (const [key, val] of Object.entries(value)) {
      output[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : redactSensitive(val, depth + 1)
    }
    return output
  }

  return value
}

/** Safely redact a request body for logging, never throwing. */
const safeRedactBody = (body: any): any => {
  if (body == null) return body
  try {
    return redactSensitive(body)
  } catch {
    return '[unserializable body]'
  }
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
      
      // Log API request (credentials/tokens are redacted from the body)
      logger.api.request(method, url, { body: safeRedactBody(options.body) })
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

      if (response.status === 401 && !isAuthEndpoint) {
        // 401 = the session is no longer valid → force logout
        logger.warn('Authentication token expired or invalid. Logging out...', { category: 'auth' })
        if (import.meta.client) {
          nuxtApp.runWithContext(() => {
            authStore.logout(true)
          })
        }
      } else if (response.status === 403 && !isAuthEndpoint) {
        // 403 = authenticated but not permitted for this action. Keep the session
        // alive and let the caller's error handler surface the permission error.
        logger.warn('Access denied for this resource (403). Session kept active.', { category: 'auth', metadata: { url } })
      }
    }
  })

  // Wrapper with request deduplication and caching
  //
  // `fetcher` is Nuxt's `$Fetch` type, whose call signatures embed Nitro's recursive
  // route-matching types (`MatchedRoutes` / `MaxTuple`). If the Proxy infers that as
  // its target type, `target` inside the `apply` trap becomes `$Fetch`, and the
  // `Reflect.apply(target, ...)` calls below force TypeScript to relate `$Fetch` to
  // `Function`. Expanding those recursive route types overflows the type-comparison
  // stack (ts2321 "Excessive stack depth"). Casting the target to a plain callable
  // keeps the trap shallow; the public `$Fetch` type is restored on the way out by
  // the `as unknown as typeof fetcher` cast below.
  return new Proxy(fetcher as unknown as (...args: any[]) => any, {
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
