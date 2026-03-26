import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { User, ApiResponse, LoginResponseData, ChangePasswordRequest } from '~/types/api'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  accessToken: string | null
  isLoading: boolean
  tokenExpiry: number | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // Use cookies as single source of truth (SSR-safe)
    const accessTokenCookie = useCookie<string | null>('accessToken')
    const userCookie = useCookie<User | null>('user')
    const tokenExpiryCookie = useCookie<number | null>('tokenExpiry')
    
    return {
      user: userCookie.value || null,
      isLoggedIn: !!accessTokenCookie.value,
      accessToken: accessTokenCookie.value || null,
      isLoading: false,
      tokenExpiry: tokenExpiryCookie.value || null,
    }
  },
  getters: {
    isTokenExpired: (state) => {
      if (!state.tokenExpiry) return false
      return Date.now() > state.tokenExpiry
    },
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

          // Calculate token expiry (expiresIn is in seconds)
          const expiryTime = Date.now() + (response.data.expiresIn * 1000)
          this.tokenExpiry = expiryTime

          // Persist state in cookies only (single source of truth)
          const maxAge = 60 * 60 * 24 * 7 // 7 days
          const accessTokenCookie = useCookie<string | null>('accessToken', { maxAge })
          const userCookie = useCookie<User | null>('user', { maxAge })
          const tokenExpiryCookie = useCookie<number | null>('tokenExpiry', { maxAge })
          
          accessTokenCookie.value = response.data.accessToken
          userCookie.value = response.data.user
          tokenExpiryCookie.value = expiryTime

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
        this.tokenExpiry = null

        // Clear cookies
        const accessTokenCookie = useCookie<string | null>('accessToken')
        const userCookie = useCookie<User | null>('user')
        const tokenExpiryCookie = useCookie<number | null>('tokenExpiry')
        
        accessTokenCookie.value = null
        userCookie.value = null
        tokenExpiryCookie.value = null

        navigateTo('/login')
      }
    },
    setUser(user: User) {
      this.user = user
      this.isLoggedIn = true
    },
    async initAuth() {
      // Cookies are already loaded in state initialization
      // Check if token is expired and logout if needed
      if (this.isTokenExpired && this.accessToken) {
        console.warn('Token expired, logging out...')
        await this.logout()
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
