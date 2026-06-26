export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const publicRoutes = ['/login', '/forgot-password']

  // Check if token is expired
  if (authStore.isLoggedIn && authStore.isTokenExpired) {
    console.warn('[Auth Middleware] Token expired, logging out...')
    await authStore.logout()
    return navigateTo('/login')
  }

  if (!authStore.isLoggedIn && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  if (authStore.isLoggedIn && publicRoutes.includes(to.path)) {
    return navigateTo('/live-sessions')
  }
})
