import { defineStore } from 'pinia'
import { useApi, clearCache } from '~/composables/useApi'
import { useErrorHandler } from '~/composables/useErrorHandler'
import type { User, ApiResponse, LoginResponseData, ChangePasswordRequest } from '~/types/api'
import { validatePassword } from '~/utils/passwordValidation'
import { COOKIE_CONFIG } from '~/constants/userRoles'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  accessToken: string | null
  isLoading: boolean
  tokenExpiry: number | null
}

/** Cookie security options */
const cookieOptions = (maxAge: number) => ({
  maxAge,
  secure: import.meta.env.PROD,
  sameSite: 'strict' as const,
})

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    // Use cookies as single source of truth (SSR-safe)
    const accessTokenCookie = useCookie<string | null>(COOKIE_CONFIG.ACCESS_TOKEN_NAME)
    const userCookie = useCookie<User | null>(COOKIE_CONFIG.USER_NAME)
    const tokenExpiryCookie = useCookie<number | null>(COOKIE_CONFIG.TOKEN_EXPIRY_NAME)
    
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
      const errorHandler = useErrorHandler()
      
      try {
        const api = useApi()

        const response = await api<ApiResponse<LoginResponseData>>('/auth/login', {
          method: 'POST',
          body: { email, password },
        })

        if (response.success && response.data) {
          this.user = response.data.user
          this.accessToken = response.data.accessToken
          this.isLoggedIn = true

          // Calculate token expiry (expiresIn is in seconds)
          const expiryTime = Date.now() + (response.data.expiresIn * 1000)
          this.tokenExpiry = expiryTime

          // Persist state in cookies only (single source of truth)
          const maxAge = COOKIE_CONFIG.MAX_AGE // 7 days
          const accessTokenCookie = useCookie<string | null>(COOKIE_CONFIG.ACCESS_TOKEN_NAME, cookieOptions(maxAge))
          const userCookie = useCookie<User | null>(COOKIE_CONFIG.USER_NAME, cookieOptions(maxAge))
          const tokenExpiryCookie = useCookie<number | null>(COOKIE_CONFIG.TOKEN_EXPIRY_NAME, cookieOptions(maxAge))
          
          accessTokenCookie.value = response.data.accessToken
          userCookie.value = response.data.user
          tokenExpiryCookie.value = expiryTime

          return { success: true, message: response.message }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error: any) {
        const standardError = errorHandler.handleError(error, { showToast: false })
        return {
          success: false,
          message: standardError.message,
        }
      } finally {
        this.isLoading = false
      }
    },
    async logout(skipApiCall = false) {
      try {
        if (!skipApiCall) {
          const api = useApi()

          await api('/auth/logout', {
            method: 'POST',
          })
        }
      } catch (error) {
        // Continue with logout even if API call fails
      } finally {
        this.user = null
        this.accessToken = null
        this.isLoggedIn = false
        this.tokenExpiry = null

        // Clear cookies
        const accessTokenCookie = useCookie<string | null>(COOKIE_CONFIG.ACCESS_TOKEN_NAME)
        const userCookie = useCookie<User | null>(COOKIE_CONFIG.USER_NAME)
        const tokenExpiryCookie = useCookie<number | null>(COOKIE_CONFIG.TOKEN_EXPIRY_NAME)
        
        accessTokenCookie.value = null
        userCookie.value = null
        tokenExpiryCookie.value = null

        // Purge session-owned client state so nothing leaks to the next user:
        // 1) drop all cached API responses, and 2) $reset every Pinia store
        // except auth (cleared above) and theme (a device preference, not
        // session data). Monitoring SSE streams are disconnected first.
        clearCache()
        try {
          const pinia = useNuxtApp().$pinia as any
          pinia?._s?.forEach((store: any) => {
            if (store.$id === 'auth' || store.$id === 'theme') return
            if (store.$id === 'monitoring' && typeof store.disconnectAll === 'function') {
              store.disconnectAll()
            }
            if (typeof store.$reset === 'function') store.$reset()
          })
        } catch {
          // Best-effort cleanup — never block logout on a reset failure
        }

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
        await this.logout(true)
      }
    },
    async changePassword(data: ChangePasswordRequest) {
      this.isLoading = true
      const errorHandler = useErrorHandler()
      
      try {
        if (!this.user?.id) {
          return { success: false, message: 'User ID not found. Please log in again.' }
        }

        // Validate new password
        const validation = validatePassword(data.newPassword)
        if (!validation.isValid) {
          return {
            success: false,
            message: 'Password does not meet requirements',
            errors: validation.errors,
          }
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
        const standardError = errorHandler.handleError(error, { showToast: false })
        return {
          success: false,
          message: standardError.message,
        }
      } finally {
        this.isLoading = false
      }
    },
  },
})
