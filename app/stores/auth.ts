import { defineStore } from 'pinia'

interface User {
  name: string
  email: string
  role: string
  avatar: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isLoggedIn: false as boolean,
  }),
  actions: {
    login(email: string, _password: string) {
      this.user = {
        name: 'Mike Nielsen',
        email,
        role: 'Admin',
        avatar: 'https://i.pravatar.cc/150?img=11',
      }
      this.isLoggedIn = true
    },
    logout() {
      this.isLoggedIn = false
      navigateTo('/login')
    },
    setUser(user: User) {
      this.user = user
      this.isLoggedIn = true
    },
  },
})