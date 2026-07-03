import { describe, it, expect, beforeEach } from 'vitest'
import { useLoggerStore } from '~/stores/logger'
import { createPinia, setActivePinia } from 'pinia'
import type { LogEntry } from '~/composables/useLogger'

describe('useLoggerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const createLogEntry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
    id: `test-${Date.now()}-${Math.random()}`,
    timestamp: Date.now(),
    level: 'info',
    category: 'app',
    message: 'Test log message',
    ...overrides,
  })

  describe('addLog', () => {
    it('adds a log entry', () => {
      const store = useLoggerStore()
      const entry = createLogEntry()
      
      store.addLog(entry)
      expect(store.logs).toHaveLength(1)
      expect(store.logs[0]?.message).toBe('Test log message')
    })

    it('prepends new entries (newest first)', () => {
      const store = useLoggerStore()
      
      store.addLog(createLogEntry({ message: 'First' }))
      store.addLog(createLogEntry({ message: 'Second' }))
      store.addLog(createLogEntry({ message: 'Third' }))
      
      expect(store.logs).toHaveLength(3)
      expect(store.logs[0]?.message).toBe('Third')
      expect(store.logs[2]?.message).toBe('First')
    })

    it('respects maxLogs limit', () => {
      const store = useLoggerStore()
      store.maxLogs = 5
      
      for (let i = 0; i < 10; i++) {
        store.addLog(createLogEntry({ message: `Log ${i}` }))
      }
      
      expect(store.logs.length).toBe(5)
    })
  })

  describe('clearLogs', () => {
    it('clears all logs', () => {
      const store = useLoggerStore()
      store.addLog(createLogEntry())
      store.addLog(createLogEntry())
      
      expect(store.logs).toHaveLength(2)
      store.clearLogs()
      expect(store.logs).toHaveLength(0)
    })
  })

  describe('filteredLogs', () => {
    it('returns all logs when filter is "all"', () => {
      const store = useLoggerStore()
      store.addLog(createLogEntry({ level: 'debug' }))
      store.addLog(createLogEntry({ level: 'error' }))
      
      expect(store.filteredLogs).toHaveLength(2)
    })

    it('filters by log level', () => {
      const store = useLoggerStore()
      store.addLog(createLogEntry({ level: 'debug' }))
      store.addLog(createLogEntry({ level: 'info' }))
      store.addLog(createLogEntry({ level: 'warn' }))
      store.addLog(createLogEntry({ level: 'error' }))
      
      store.setFilterLevel('warn')
      expect(store.filteredLogs).toHaveLength(2) // warn + error
    })

    it('filters by category', () => {
      const store = useLoggerStore()
      store.addLog(createLogEntry({ category: 'api' }))
      store.addLog(createLogEntry({ category: 'auth' }))
      store.addLog(createLogEntry({ category: 'api' }))
      
      store.setFilterCategory('api')
      expect(store.filteredLogs).toHaveLength(2)
    })

    it('filters by search query', () => {
      const store = useLoggerStore()
      store.addLog(createLogEntry({ message: 'Login successful' }))
      store.addLog(createLogEntry({ message: 'API request failed' }))
      store.addLog(createLogEntry({ message: 'User logged out' }))
      
      store.setSearchQuery('login')
      expect(store.filteredLogs).toHaveLength(1) // "Login successful" contains "login"
    })
  })

  describe('stats', () => {
    it('returns correct counts per level', () => {
      const store = useLoggerStore()
      store.addLog(createLogEntry({ level: 'debug' }))
      store.addLog(createLogEntry({ level: 'info' }))
      store.addLog(createLogEntry({ level: 'info' }))
      store.addLog(createLogEntry({ level: 'error' }))
      
      expect(store.stats).toEqual({ debug: 1, info: 2, warn: 0, error: 1 })
    })
  })

  describe('categories', () => {
    it('returns unique categories', () => {
      const store = useLoggerStore()
      store.addLog(createLogEntry({ category: 'api' }))
      store.addLog(createLogEntry({ category: 'auth' }))
      store.addLog(createLogEntry({ category: 'api' }))
      
      expect(store.categories).toContain('api')
      expect(store.categories).toContain('auth')
      expect(store.categories).toHaveLength(2)
    })
  })

  describe('actions', () => {
    it('sets filter level', () => {
      const store = useLoggerStore()
      store.setFilterLevel('error')
      expect(store.filterLevel).toBe('error')
    })

    it('sets filter category', () => {
      const store = useLoggerStore()
      store.setFilterCategory('api')
      expect(store.filterCategory).toBe('api')
    })

    it('sets search query', () => {
      const store = useLoggerStore()
      store.setSearchQuery('test')
      expect(store.searchQuery).toBe('test')
    })

    it('toggles auto scroll', () => {
      const store = useLoggerStore()
      expect(store.isAutoScroll).toBe(true)
      store.toggleAutoScroll()
      expect(store.isAutoScroll).toBe(false)
    })

    it('exports logs as JSON', () => {
      const store = useLoggerStore()
      store.addLog(createLogEntry({ message: 'Test export', level: 'info', category: 'app' }))
      
      const exported = store.exportLogs()
      const parsed = JSON.parse(exported)
      
      expect(parsed).toHaveLength(1)
      expect(parsed[0].message).toBe('Test export')
      expect(parsed[0].level).toBe('info')
    })
  })

  describe('pagination', () => {
    it('has default pagination state', () => {
      const store = useLoggerStore()
      expect(store.currentPage).toBe(1)
      expect(store.pageSize).toBe(100) // PAGINATION.LOG_PAGE_SIZE
    })

    it('returns paginated logs', () => {
      const store = useLoggerStore()
      store.pageSize = 3
      for (let i = 0; i < 10; i++) {
        store.addLog(createLogEntry({ message: `Log ${i}` }))
      }
      expect(store.paginatedLogs).toHaveLength(3)
    })

    it('navigates pages', () => {
      const store = useLoggerStore()
      store.pageSize = 3
      for (let i = 0; i < 10; i++) {
        store.addLog(createLogEntry({ message: `Log ${i}` }))
      }
      expect(store.totalPages).toBe(4)
      store.nextPage()
      expect(store.currentPage).toBe(2)
      store.previousPage()
      expect(store.currentPage).toBe(1)
      // Should not go below 1
      store.previousPage()
      expect(store.currentPage).toBe(1)
    })

    it('resets page on filter change', () => {
      const store = useLoggerStore()
      store.currentPage = 3
      store.setFilterLevel('error')
      expect(store.currentPage).toBe(1)
    })

    it('resets page on search change', () => {
      const store = useLoggerStore()
      store.currentPage = 3
      store.setSearchQuery('test')
      expect(store.currentPage).toBe(1)
    })

    it('sets page size', () => {
      const store = useLoggerStore()
      store.setPageSize(50)
      expect(store.pageSize).toBe(50)
      expect(store.currentPage).toBe(1)
    })

    it('resets page on clearLogs', () => {
      const store = useLoggerStore()
      store.currentPage = 5
      store.clearLogs()
      expect(store.currentPage).toBe(1)
    })
  })
})
