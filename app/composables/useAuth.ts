import { useAuthStore } from '~/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  const login = (email: string, password: string) => {
    authStore.login(email, password)
  }

  const logout = () => {
    authStore.logout()
  }

  return {
    user: computed(() => authStore.user),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    login,
    logout,
  }
}