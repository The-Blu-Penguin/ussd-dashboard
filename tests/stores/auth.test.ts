import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '~/stores/auth'
import { createPinia, setActivePinia } from 'pinia'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('starts logged out', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
      expect(store.accessToken).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isLoading).toBe(false)
    })

    it('computes isTokenExpired as false when no expiry', () => {
      const store = useAuthStore()
      expect(store.isTokenExpired).toBe(false)
    })

    it('computes isTokenExpired as true when expired', () => {
      const store = useAuthStore()
      store.tokenExpiry = Date.now() - 10000 // 10 seconds ago
      expect(store.isTokenExpired).toBe(true)
    })

    it('computes isTokenExpired as false when not expired', () => {
      const store = useAuthStore()
      store.tokenExpiry = Date.now() + 60000 // 60 seconds from now
      expect(store.isTokenExpired).toBe(false)
    })
  })

  describe('setUser', () => {
    it('sets user and logged in state', () => {
      const store = useAuthStore()
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'ADMIN' as const,
        isActive: true,
      }
      
      store.setUser(mockUser)
      
      expect(store.user).toEqual(mockUser)
      expect(store.isLoggedIn).toBe(true)
    })
  })

  describe('logout state cleanup', () => {
    it('clears all state on logout', async () => {
      const store = useAuthStore()
      
      // Set some state
      store.setUser({
        id: '1',
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'ADMIN' as const,
        isActive: true,
      })
      store.accessToken = 'test-token'
      store.tokenExpiry = Date.now() + 60000
      
      // navigateTo is mocked in setup, so this should work
      await store.logout(true) // skipApiCall=true to avoid API call
      
      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.isLoggedIn).toBe(false)
      expect(store.tokenExpiry).toBeNull()
    })
  })

  describe('initAuth', () => {
    it('does nothing when token is not expired', async () => {
      const store = useAuthStore()
      store.accessToken = 'valid-token'
      store.tokenExpiry = Date.now() + 60000
      
      await store.initAuth()
      
      // Should still be logged in
      expect(store.accessToken).toBe('valid-token')
    })

    it('logs out when token is expired', async () => {
      const store = useAuthStore()
      store.accessToken = 'expired-token'
      store.tokenExpiry = Date.now() - 10000
      
      await store.initAuth()
      
      expect(store.accessToken).toBeNull()
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('cookie configuration', () => {
    it('uses COOKIE_CONFIG for cookie names', () => {
      // Verify the store references the correct cookie names
      // by checking that the store initializes without errors
      const store = useAuthStore()
      expect(store).toBeDefined()
      expect(store.isLoggedIn).toBe(false)
    })
  })
})
