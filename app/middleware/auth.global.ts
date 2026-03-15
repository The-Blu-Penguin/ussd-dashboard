export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth()
  const publicRoutes = ['/login', '/forgot-password']

  if (!isLoggedIn.value && !publicRoutes.includes(to.path)) {
    return navigateTo('/login')
  }

  if (isLoggedIn.value && publicRoutes.includes(to.path)) {
    return navigateTo('/')
  }
})
