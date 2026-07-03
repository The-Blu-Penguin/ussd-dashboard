import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useLoggerStore } from '~/stores/logger'
import { createPinia, setActivePinia } from 'pinia'

// Mock the useLogger composable dependencies
vi.mock('#imports', async () => {
  const actual = await vi.importActual<typeof import('../setup')>('../setup')
  return {
    ...actual,
  }
})

// We need to test the useLogger composable, but it depends on the store
// So we test it indirectly through the store + direct composable invocation
describe('useLogger composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.stubEnv('VITE_LOG_LEVEL', 'debug')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  // Since useLogger uses auto-imports, we test its behavior through the store
  // The composable wraps store.addLog with structured logging
  describe('log levels', () => {
    it('supports debug, info, warn, error levels', () => {
      const store = useLoggerStore()
      
      // Simulate what useLogger does internally
      const levels = ['debug', 'info', 'warn', 'error'] as const
      for (const level of levels) {
        store.addLog({
          id: `test-${level}`,
          timestamp: Date.now(),
          level,
          category: 'app',
          message: `Test ${level} message`,
        })
      }
      
      expect(store.logs).toHaveLength(4)
      expect(store.logs[0]?.level).toBe('error') // newest first
      expect(store.logs[3]?.level).toBe('debug')
    })

    it('filters logs by level correctly', () => {
      const store = useLoggerStore()
      
      store.addLog({ id: '1', timestamp: Date.now(), level: 'debug', category: 'app', message: 'debug' })
      store.addLog({ id: '2', timestamp: Date.now(), level: 'info', category: 'app', message: 'info' })
      store.addLog({ id: '3', timestamp: Date.now(), level: 'warn', category: 'app', message: 'warn' })
      store.addLog({ id: '4', timestamp: Date.now(), level: 'error', category: 'app', message: 'error' })
      
      // Filter at 'warn' level should include warn + error
      store.setFilterLevel('warn')
      expect(store.filteredLogs).toHaveLength(2)
      expect(store.filteredLogs.every((l: any) => ['warn', 'error'].includes(l.level))).toBe(true)
    })
  })

  describe('categories', () => {
    it('logs with different categories', () => {
      const store = useLoggerStore()
      
      store.addLog({ id: '1', timestamp: Date.now(), level: 'info', category: 'api', message: 'API call' })
      store.addLog({ id: '2', timestamp: Date.now(), level: 'info', category: 'auth', message: 'Login' })
      store.addLog({ id: '3', timestamp: Date.now(), level: 'info', category: 'builder', message: 'Node added' })
      store.addLog({ id: '4', timestamp: Date.now(), level: 'info', category: 'sse', message: 'SSE connected' })
      
      expect(store.categories).toContain('api')
      expect(store.categories).toContain('auth')
      expect(store.categories).toContain('builder')
      expect(store.categories).toContain('sse')
    })

    it('filters by category', () => {
      const store = useLoggerStore()
      
      store.addLog({ id: '1', timestamp: Date.now(), level: 'info', category: 'api', message: 'API call' })
      store.addLog({ id: '2', timestamp: Date.now(), level: 'info', category: 'auth', message: 'Login' })
      store.addLog({ id: '3', timestamp: Date.now(), level: 'info', category: 'api', message: 'Another API call' })
      
      store.setFilterCategory('api')
      expect(store.filteredLogs).toHaveLength(2)
      expect(store.filteredLogs.every((l: any) => l.category === 'api')).toBe(true)
    })
  })

  describe('metadata', () => {
    it('stores metadata in log entries', () => {
      const store = useLoggerStore()
      
      store.addLog({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        category: 'api',
        message: 'GET /users',
        metadata: { method: 'GET', url: '/users', status: 200 },
      })
      
      expect(store.logs[0]?.metadata).toEqual({ method: 'GET', url: '/users', status: 200 })
    })

    it('searches in metadata', () => {
      const store = useLoggerStore()
      
      store.addLog({
        id: '1',
        timestamp: Date.now(),
        level: 'info',
        category: 'api',
        message: 'Request',
        metadata: { url: '/auth/login' },
      })
      store.addLog({
        id: '2',
        timestamp: Date.now(),
        level: 'info',
        category: 'api',
        message: 'Request',
        metadata: { url: '/users' },
      })
      
      store.setSearchQuery('login')
      expect(store.filteredLogs).toHaveLength(1)
    })
  })

  describe('store integration', () => {
    it('respects maxLogs limit', () => {
      const store = useLoggerStore()
      store.maxLogs = 3
      
      for (let i = 0; i < 10; i++) {
        store.addLog({
          id: `log-${i}`,
          timestamp: Date.now(),
          level: 'info',
          category: 'app',
          message: `Message ${i}`,
        })
      }
      
      expect(store.logs.length).toBe(3)
      // Should keep the newest 3
      expect(store.logs[0]?.message).toBe('Message 9')
    })

    it('exports logs with metadata', () => {
      const store = useLoggerStore()
      
      store.addLog({
        id: '1',
        timestamp: 1700000000000,
        level: 'error',
        category: 'api',
        message: 'Request failed',
        metadata: { url: '/users', status: 500 },
        error: new Error('Server error'),
      })
      
      const exported = store.exportLogs()
      const parsed = JSON.parse(exported)
      
      expect(parsed).toHaveLength(1)
      expect(parsed[0].message).toBe('Request failed')
      expect(parsed[0].level).toBe('error')
      expect(parsed[0].metadata).toEqual({ url: '/users', status: 500 })
      expect(parsed[0].error).toContain('Server error')
    })

    it('stats count logs per level', () => {
      const store = useLoggerStore()
      
      store.addLog({ id: '1', timestamp: Date.now(), level: 'debug', category: 'app', message: 'a' })
      store.addLog({ id: '2', timestamp: Date.now(), level: 'debug', category: 'app', message: 'b' })
      store.addLog({ id: '3', timestamp: Date.now(), level: 'info', category: 'app', message: 'c' })
      store.addLog({ id: '4', timestamp: Date.now(), level: 'warn', category: 'app', message: 'd' })
      store.addLog({ id: '5', timestamp: Date.now(), level: 'error', category: 'app', message: 'e' })
      store.addLog({ id: '6', timestamp: Date.now(), level: 'error', category: 'app', message: 'f' })
      
      expect(store.stats).toEqual({ debug: 2, info: 1, warn: 1, error: 2 })
    })
  })
})
