import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  
  // Ensure we wait for the auth store to initialize properly
  await authStore.initAuth()
})