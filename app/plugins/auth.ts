import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  
  // Ensure we wait for the auth store to initialize properly
  await authStore.initAuth()

  // Client-side watchdog: catch token expiry mid-session (e.g. long-lived
  // monitoring pages) instead of only on the next route navigation.
  if (import.meta.client) {
    setInterval(() => {
      if (authStore.isLoggedIn && authStore.isTokenExpired) {
        authStore.logout(true)
      }
    }, 60_000)
  }
})