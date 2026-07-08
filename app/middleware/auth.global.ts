import { PUBLIC_ROUTES, DEFAULT_LOGIN_REDIRECT } from '~/constants/userRoles'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // CSRF protection: validate Origin header on state-changing requests (SSR only)
  if (import.meta.server) {
    const event = useRequestEvent()
    const method = event?.method?.toUpperCase() || 'GET'
    
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const origin = event?.headers?.get('origin')
      const referer = event?.headers?.get('referer')
      const host = event?.headers?.get('host')
      
      // If Origin or Referer is present, validate it matches the host
      if (origin && host) {
        try {
          const originHost = new URL(origin).host
          if (originHost !== host) {
            console.warn('[Auth Middleware] CSRF check failed: Origin mismatch')
            return navigateTo('/login')
          }
        } catch {
          // Invalid Origin header format
        }
      } else if (referer && host) {
        try {
          const refererHost = new URL(referer).host
          if (refererHost !== host) {
            console.warn('[Auth Middleware] CSRF check failed: Referer mismatch')
            return navigateTo('/login')
          }
        } catch {
          // Invalid Referer header format
        }
      }
    }
  }

  // Check if token is expired
  if (authStore.isLoggedIn && authStore.isTokenExpired) {
    console.warn('[Auth Middleware] Token expired, logging out...')
    await authStore.logout()
    return navigateTo('/login')
  }

  if (!authStore.isLoggedIn && !(PUBLIC_ROUTES as readonly string[]).includes(to.path)) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && (PUBLIC_ROUTES as readonly string[]).includes(to.path)) {
    return navigateTo(DEFAULT_LOGIN_REDIRECT)
  }
})
