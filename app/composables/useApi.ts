import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  return $fetch.create({
    baseURL: config.public.apiBaseUrl as string,
    onRequest({ options }) {
      if (authStore.accessToken) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }
    },
    onResponseError({ response }) {
      if (response.status === 401 || response.status === 403) {
        console.warn('Authentication token expired or invalid. Logging out...')
        if (import.meta.client) {
          authStore.logout()
        }
      }
    }
  })
}