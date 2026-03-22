import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  const login = async (email: string, password: string) => {
    const result = await authStore.login(email, password)
    return result
  }

  const logout = () => {
    authStore.logout()
  }

  return {
    user: computed(() => authStore.user),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    isLoading: computed(() => authStore.isLoading),
    login,
    logout,
  }
}