import { defineStore } from 'pinia'
import type { User, ApiResponse, LoginResponseData, ChangePasswordRequest } from '~/types/api'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  accessToken: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // Check local storage first on client, fallback to cookies, then null
    let initialUser = null
    let initialToken = null

    if (import.meta.client) {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) initialUser = JSON.parse(userStr)
        initialToken = localStorage.getItem('accessToken')
      } catch (e) {
        console.error('Error parsing user from localStorage:', e)
      }
    }

    const accessTokenCookie = useCookie<string | null>('accessToken')
    const userCookie = useCookie<User | null>('user')
    
    return {
      user: initialUser || userCookie.value || null,
      isLoggedIn: !!(initialToken || accessTokenCookie.value),
      accessToken: initialToken || accessTokenCookie.value || null,
      isLoading: false,
    }
  },
  actions: {
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string

        console.log(`[Auth Store] Attempting login for ${email} at ${baseUrl}/auth/login`)

        const response = await $fetch<ApiResponse<LoginResponseData>>(`${baseUrl}/auth/login`, {
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
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string

        await $fetch(`${baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
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
    initAuth() {
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

        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string

        const response = await $fetch<ApiResponse>(`${baseUrl}/auth/${this.user.id}/change-password`, {
          method: 'POST',
          body: data,
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
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
