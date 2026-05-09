import { defineStore } from 'pinia'
import { useSse } from '~/composables/useSse'

export interface SessionStats {
  activeSessions: number
  stalledSessions: number
  avgDurationSeconds: number
  topNetwork: string
  totalToday: number
}

export interface SessionEvent {
  eventType: string
  sessionId: string
  msisdn: string
  ussdCode: string
  network: string
  currentStep: string | null
  message: string | null
  userInput: string | null
  timestamp: number
}

export interface LogStats {
  totalRequests: number
  errorRatePercent: number
  avgLatencyMs: number
  uptimePercent: number
}

export interface LogEvent {
  service: string
  level: string
  statusCode: number
  message: string
  durationMs: number
  timestamp: number
  dateTime: string
}

export interface TransactionStats {
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  totalVolume: number
}

export interface TransactionEvent {
  eventType: string
  transactionId: string
  transactionReference: string
  merchantName: string
  msisdn: string
  network: string
  amount: string
  type: string
  status: string
  errorMessage: string | null
  timestamp: number
  dateTime: string
}

interface MonitoringState {
  sessionStats: SessionStats | null
  sessionEvents: SessionEvent[]
  logStats: LogStats | null
  logEvents: LogEvent[]
  transactionStats: TransactionStats | null
  transactionEvents: TransactionEvent[]
  isLive: boolean
  connectionStatus: {
    sessions: 'connecting' | 'connected' | 'disconnected' | 'error'
    logs: 'connecting' | 'connected' | 'disconnected' | 'error'
    transactions: 'connecting' | 'connected' | 'disconnected' | 'error'
  }
  maxEvents: number
  _disconnectSessions: (() => void) | null
  _disconnectLogs: (() => void) | null
  _disconnectTransactions: (() => void) | null
}

export const useMonitoringStore = defineStore('monitoring', {
  state: (): MonitoringState => ({
    sessionStats: null,
    sessionEvents: [],
    logStats: null,
    logEvents: [],
    transactionStats: null,
    transactionEvents: [],
    isLive: true,
    connectionStatus: {
      sessions: 'disconnected',
      logs: 'disconnected',
      transactions: 'disconnected',
    },
    maxEvents: 1000,
    _disconnectSessions: null,
    _disconnectLogs: null,
    _disconnectTransactions: null,
  }),

  getters: {
    activeSessionCount: (state) => state.sessionStats?.activeSessions ?? 0,
    stalledSessionCount: (state) => state.sessionStats?.stalledSessions ?? 0,
    avgSessionDuration: (state) => state.sessionStats?.avgDurationSeconds ?? 0,
    topNetwork: (state) => state.sessionStats?.topNetwork ?? '-',
    totalSessionsToday: (state) => state.sessionStats?.totalToday ?? 0,

    totalRequests: (state) => state.logStats?.totalRequests ?? 0,
    errorRate: (state) => state.logStats?.errorRatePercent ?? 0,
    avgLatency: (state) => state.logStats?.avgLatencyMs ?? 0,
    uptime: (state) => state.logStats?.uptimePercent ?? 0,

    totalTransactions: (state) => state.transactionStats?.totalTransactions ?? 0,
    successfulTransactions: (state) => state.transactionStats?.successfulTransactions ?? 0,
    failedTransactions: (state) => state.transactionStats?.failedTransactions ?? 0,
    totalVolume: (state) => state.transactionStats?.totalVolume ?? 0,
  },

  actions: {
    _addSessionEvent(event: SessionEvent) {
      this.sessionEvents.unshift(event)
      if (this.sessionEvents.length > this.maxEvents) {
        this.sessionEvents.pop()
      }
    },

    _addLogEvent(event: LogEvent) {
      this.logEvents.unshift(event)
      if (this.logEvents.length > this.maxEvents) {
        this.logEvents.pop()
      }
    },

    _addTransactionEvent(event: TransactionEvent) {
      this.transactionEvents.unshift(event)
      if (this.transactionEvents.length > this.maxEvents) {
        this.transactionEvents.pop()
      }
    },

    connectSessions() {
      if (!this.isLive || this._disconnectSessions) return
      this.connectionStatus.sessions = 'connecting'
      const { connect } = useSse()

      this._disconnectSessions = connect('/sse/sessions', {
        onOpen: () => {
          this.connectionStatus.sessions = 'connected'
        },
        onMessage: (event, data) => {
          if (event === 'stats') {
            this.sessionStats = data as SessionStats
          } else if (event === 'session_event') {
            this._addSessionEvent(data as SessionEvent)
          }
        },
        onError: () => {
          this.connectionStatus.sessions = 'error'
        },
      })
    },

    connectLogs() {
      if (!this.isLive || this._disconnectLogs) return
      this.connectionStatus.logs = 'connecting'
      const { connect } = useSse()

      this._disconnectLogs = connect('/sse/logs', {
        onOpen: () => {
          this.connectionStatus.logs = 'connected'
        },
        onMessage: (event, data) => {
          if (event === 'service_log_stats') {
            this.logStats = data as LogStats
          } else if (event === 'service_log') {
            this._addLogEvent(data as LogEvent)
          }
        },
        onError: () => {
          this.connectionStatus.logs = 'error'
        },
      })
    },

    connectTransactions() {
      if (!this.isLive || this._disconnectTransactions) return
      this.connectionStatus.transactions = 'connecting'
      const { connect } = useSse()

      this._disconnectTransactions = connect('/sse/transactions', {
        onOpen: () => {
          this.connectionStatus.transactions = 'connected'
        },
        onMessage: (event, data) => {
          if (event === 'transaction_stats') {
            this.transactionStats = data as TransactionStats
          } else if (event === 'transaction_event') {
            this._addTransactionEvent(data as TransactionEvent)
          }
        },
        onError: () => {
          this.connectionStatus.transactions = 'error'
        },
      })
    },

    disconnectAll() {
      this._disconnectSessions?.()
      this._disconnectLogs?.()
      this._disconnectTransactions?.()
      this._disconnectSessions = null
      this._disconnectLogs = null
      this._disconnectTransactions = null
      this.connectionStatus = {
        sessions: 'disconnected',
        logs: 'disconnected',
        transactions: 'disconnected',
      }
    },

    toggleLive() {
      this.isLive = !this.isLive
    },

    clearEvents(type: 'sessions' | 'logs' | 'transactions') {
      if (type === 'sessions') this.sessionEvents = []
      if (type === 'logs') this.logEvents = []
      if (type === 'transactions') this.transactionEvents = []
    },
  },
})
