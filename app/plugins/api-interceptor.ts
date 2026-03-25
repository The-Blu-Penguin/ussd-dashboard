import { useAuthStore } from '~/stores/auth'
import { ofetch } from 'ofetch'

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()

  // Create a globally intercepted fetch instance
  globalThis.$fetch = ofetch.create({
    async onResponseError({ response }) {
      if (response.status === 401 || response.status === 403) {
        console.warn('Authentication token expired or invalid. Logging out...')
        // Only run logout on client side to trigger proper navigation
        if (import.meta.client) {
          authStore.logout()
        }
      }
    }
  })
})