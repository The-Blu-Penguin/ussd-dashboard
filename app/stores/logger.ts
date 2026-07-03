import { defineStore } from 'pinia'
import type { LogEntry, LogLevel } from '~/composables/useLogger'
import { PAGINATION } from '~/constants/ui'

export type LogCategory =
  | 'app'
  | 'api'
  | 'auth'
  | 'builder'
  | 'sse'
  | 'monitoring'
  | 'system'

interface LoggerState {
  logs: LogEntry[]
  maxLogs: number
  filterLevel: LogLevel | 'all'
  filterCategory: LogCategory | 'all'
  searchQuery: string
  isAutoScroll: boolean
  currentPage: number
  pageSize: number
}

export const useLoggerStore = defineStore('logger', {
  state: (): LoggerState => ({
    logs: [],
    maxLogs: PAGINATION.MAX_LOGS_IN_MEMORY,
    filterLevel: 'all',
    filterCategory: 'all',
    searchQuery: '',
    isAutoScroll: true,
    currentPage: 1,
    pageSize: PAGINATION.LOG_PAGE_SIZE,
  }),

  getters: {
    filteredLogs: (state): LogEntry[] => {
      let result = state.logs

      if (state.filterLevel !== 'all') {
        const levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error']
        const minIndex = levelOrder.indexOf(state.filterLevel)
        result = result.filter(l => levelOrder.indexOf(l.level) >= minIndex)
      }

      if (state.filterCategory !== 'all') {
        result = result.filter(l => l.category === state.filterCategory)
      }

      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase()
        result = result.filter(l =>
          l.message.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          JSON.stringify(l.metadata || {}).toLowerCase().includes(q)
        )
      }

      return result
    },

    paginatedLogs(state): LogEntry[] {
      const filtered = (this as any).filteredLogs as LogEntry[]
      const start = (state.currentPage - 1) * state.pageSize
      const end = start + state.pageSize
      return filtered.slice(start, end)
    },

    totalPages(): number {
      const filtered = (this as any).filteredLogs as LogEntry[]
      return Math.ceil(filtered.length / (this as any).pageSize)
    },

    stats: (state) => {
      const counts = { debug: 0, info: 0, warn: 0, error: 0 }
      for (const l of state.logs) {
        counts[l.level]++
      }
      return counts
    },

    categories: (state): LogCategory[] => {
      const set = new Set<LogCategory>()
      for (const l of state.logs) {
        set.add(l.category)
      }
      return Array.from(set)
    },
  },

  actions: {
    addLog(entry: LogEntry) {
      this.logs.unshift(entry)
      if (this.logs.length > this.maxLogs) {
        this.logs.pop()
      }
    },

    clearLogs() {
      this.logs = []
      this.currentPage = 1
    },

    setFilterLevel(level: LogLevel | 'all') {
      this.filterLevel = level
      this.currentPage = 1 // Reset to first page on filter change
    },

    setFilterCategory(category: LogCategory | 'all') {
      this.filterCategory = category
      this.currentPage = 1
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
      this.currentPage = 1
    },

    toggleAutoScroll() {
      this.isAutoScroll = !this.isAutoScroll
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    setPageSize(size: number) {
      this.pageSize = size
      this.currentPage = 1
    },

    exportLogs(): string {
      return JSON.stringify(
        this.filteredLogs.map(l => ({
          timestamp: new Date(l.timestamp).toISOString(),
          level: l.level,
          category: l.category,
          message: l.message,
          metadata: l.metadata,
          error: l.error?.stack || l.error?.message,
        })),
        null,
        2
      )
    },
  },
})
