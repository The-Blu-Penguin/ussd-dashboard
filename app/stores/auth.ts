import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { User, ApiResponse, LoginResponseData, ChangePasswordRequest } from '~/types/api'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  accessToken: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // Priority 1: Check cookies (reliable for SSR)
    const accessTokenCookie = useCookie<string | null>('accessToken')
    const userCookie = useCookie<User | null>('user')
    
    let initialUser = userCookie.value || null
    let initialToken = accessTokenCookie.value || null

    // Priority 2: Fallback to localStorage immediately on client creation
    if (import.meta.client) {
      try {
        if (!initialUser) {
          const userStr = localStorage.getItem('user')
          if (userStr) initialUser = JSON.parse(userStr)
        }
        if (!initialToken) {
          initialToken = localStorage.getItem('accessToken') || null
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e)
      }
    }
    
    return {
      user: initialUser,
      isLoggedIn: !!initialToken,
      accessToken: initialToken,
      isLoading: false,
    }
  },
  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const api = useApi()

        console.log(`[Auth Store] Attempting login for ${email}`)

        const response = await api<ApiResponse<LoginResponseData>>('/auth/login', {
          method: 'POST',
          body: { email, password },
        })

        console.log(`[Auth Store] Login response:`, response)

        if (response.success && response.data) {
          this.user = response.data.user
          this.accessToken = response.data.accessToken
          this.isLoggedIn = true

          // Persist state in cookies so it's available on refresh across SSR and client
          const accessTokenCookie = useCookie<string | null>('accessToken', { maxAge: 60 * 60 * 24 * 7 })
          const userCookie = useCookie<User | null>('user', { maxAge: 60 * 60 * 24 * 7 })
          
          accessTokenCookie.value = response.data.accessToken
          userCookie.value = response.data.user

          if (import.meta.client) {
            localStorage.setItem('accessToken', response.data.accessToken)
            localStorage.setItem('user', JSON.stringify(response.data.user))
          }

          return { success: true, message: response.message }
        } else {
          console.warn(`[Auth Store] Login returned false success flag`, response)
          return { success: false, message: response.message }
        }
      } catch (error: any) {
        console.error(`[Auth Store] Login error:`, error)
        let message = 'Login failed. Please try again.'

        if (error.response) {
          const status = error.response.status
          switch (status) {
            case 401:
              message = 'Invalid email or password.'
              break
            case 403:
              message = 'Access forbidden. Please contact administrator.'
              break
            case 422:
              message = error.response._data?.message || 'Validation error. Please check your inputs.'
              break
            case 500:
              message = 'Server error. Please try again later.'
              break
            case 502:
            case 503:
              message = 'Service temporarily unavailable. Please try again later.'
              break
            default:
              message = error.response._data?.message || error.message || 'Login failed. Please try again.'
          }
        } else if (error.message) {
          message = 'Unable to connect. Please check your internet connection.'
        }

        return {
          success: false,
          message,
        }
      } finally {
        this.isLoading = false
      }
    },
    async logout() {
      try {
        const api = useApi()

        await api('/auth/logout', {
          method: 'POST',
        })
      } catch (error) {
        // Continue with logout even if API call fails
      } finally {
        this.user = null
        this.accessToken = null
        this.isLoggedIn = false

        // Clear cookies
        const accessTokenCookie = useCookie<string | null>('accessToken')
        const userCookie = useCookie<User | null>('user')
        accessTokenCookie.value = null
        userCookie.value = null

        if (import.meta.client) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
        }

        navigateTo('/login')
      }
    },
    setUser(user: User) {
      this.user = user
      this.isLoggedIn = true
    },
    async initAuth() {
      // Priority 1: Check cookies first (most reliable for SSR and cross-tab)
      const accessTokenCookie = useCookie<string | null>('accessToken')
      const userCookie = useCookie<User | null>('user')
      
      if (accessTokenCookie.value) {
        this.accessToken = accessTokenCookie.value
        this.isLoggedIn = true
      }
      
      if (userCookie.value) {
        this.user = userCookie.value
      }

      // Priority 2: Fallback to localStorage on client-side
      if (import.meta.client) {
        // Wait a tiny bit to ensure localStorage is accessible in all browsers
        await new Promise(resolve => setTimeout(resolve, 0))
        
        if (!this.accessToken) {
          const token = localStorage.getItem('accessToken')
          if (token) {
            this.accessToken = token
            this.isLoggedIn = true
            accessTokenCookie.value = token
          }
        }
        if (!this.user) {
          const userStr = localStorage.getItem('user')
          if (userStr) {
            try {
              this.user = JSON.parse(userStr)
              userCookie.value = this.user
            } catch (e) {
              console.error('Failed to parse user from localStorage', e)
            }
          }
        }
      }
    },
    async changePassword(data: ChangePasswordRequest) {
      this.isLoading = true
      try {
        if (!this.user?.id) {
          return { success: false, message: 'User ID not found. Please log in again.' }
        }

        const api = useApi()

        const response = await api<ApiResponse>(`/auth/${this.user.id}/change-password`, {
          method: 'POST',
          body: data,
        })

        if (response.success) {
          return { success: true, message: response.message || 'Password changed successfully' }
        } else {
          return { success: false, message: response.message || 'Failed to change password' }
        }
      } catch (error: any) {
        let message = 'Failed to change password. Please try again.'

        if (error.response) {
          const status = error.response.status
          switch (status) {
            case 400:
            case 422:
              message = error.response._data?.message || 'Validation error. Please check your inputs.'
              break
            case 401:
              message = 'Unauthorized. Please log in again.'
              break
            case 403:
              message = 'Current password is incorrect.'
              break
            case 500:
              message = 'Server error. Please try again later.'
              break
            default:
              message = error.response._data?.message || error.message || 'Failed to change password.'
          }
        } else if (error.message) {
          message = 'Unable to connect. Please check your internet connection.'
        }

        return {
          success: false,
          message,
        }
      } finally {
        this.isLoading = false
      }
    },
  },
})
