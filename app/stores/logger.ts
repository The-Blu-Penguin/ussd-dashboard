import { defineStore } from 'pinia'
import type { LogEntry, LogLevel } from '~/composables/useLogger'

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
}

export const useLoggerStore = defineStore('logger', {
  state: (): LoggerState => ({
    logs: [],
    maxLogs: 2000,
    filterLevel: 'all',
    filterCategory: 'all',
    searchQuery: '',
    isAutoScroll: true,
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
    },

    setFilterLevel(level: LogLevel | 'all') {
      this.filterLevel = level
    },

    setFilterCategory(category: LogCategory | 'all') {
      this.filterCategory = category
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    toggleAutoScroll() {
      this.isAutoScroll = !this.isAutoScroll
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
