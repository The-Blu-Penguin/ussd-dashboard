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
  /** Streams that were active when live mode was toggled off */
  pausedStreams: Array<'sessions' | 'logs' | 'transactions'>
  _disconnectSessions: (() => void) | null
  _disconnectLogs: (() => void) | null
  _disconnectTransactions: (() => void) | null
}

// Module-level event buffers — intentionally non-reactive so high-frequency
// SSE events don't trigger a Vue re-render per event. They are flushed into
// reactive store state in batches (see _flushBuffers).
const eventBuffers = {
  sessions: [] as SessionEvent[],
  logs: [] as LogEvent[],
  transactions: [] as TransactionEvent[],
}
let flushTimer: ReturnType<typeof setTimeout> | null = null
const FLUSH_INTERVAL_MS = 300

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
    pausedStreams: [],
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
      eventBuffers.sessions.push(event)
      this._scheduleFlush()
    },

    _addLogEvent(event: LogEvent) {
      eventBuffers.logs.push(event)
      this._scheduleFlush()
    },

    _addTransactionEvent(event: TransactionEvent) {
      eventBuffers.transactions.push(event)
      this._scheduleFlush()
    },

    /** Debounced flush: one reactive update per interval, not per event */
    _scheduleFlush() {
      if (flushTimer) return
      flushTimer = setTimeout(() => {
        flushTimer = null
        useMonitoringStore()._flushBuffers()
      }, FLUSH_INTERVAL_MS)
    },

    _flushBuffers() {
      if (eventBuffers.sessions.length > 0) {
        // Reverse the batch so newest event lands at index 0 in a single unshift
        this.sessionEvents.unshift(...eventBuffers.sessions.reverse())
        if (this.sessionEvents.length > this.maxEvents) {
          this.sessionEvents.splice(this.maxEvents)
        }
        eventBuffers.sessions = []
      }
      if (eventBuffers.logs.length > 0) {
        this.logEvents.unshift(...eventBuffers.logs.reverse())
        if (this.logEvents.length > this.maxEvents) {
          this.logEvents.splice(this.maxEvents)
        }
        eventBuffers.logs = []
      }
      if (eventBuffers.transactions.length > 0) {
        this.transactionEvents.unshift(...eventBuffers.transactions.reverse())
        if (this.transactionEvents.length > this.maxEvents) {
          this.transactionEvents.splice(this.maxEvents)
        }
        eventBuffers.transactions = []
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

    disconnectSessions() {
      this._disconnectSessions?.()
      this._disconnectSessions = null
      this.connectionStatus.sessions = 'disconnected'
    },

    disconnectLogs() {
      this._disconnectLogs?.()
      this._disconnectLogs = null
      this.connectionStatus.logs = 'disconnected'
    },

    disconnectTransactions() {
      this._disconnectTransactions?.()
      this._disconnectTransactions = null
      this.connectionStatus.transactions = 'disconnected'
    },

    disconnectAll() {
      // Flush any buffered events before tearing down so nothing is lost
      this._flushBuffers()
      this.disconnectSessions()
      this.disconnectLogs()
      this.disconnectTransactions()
    },

    toggleLive() {
      this.isLive = !this.isLive
      if (!this.isLive) {
        // Pause: remember which streams were active, then disconnect them
        this.pausedStreams = []
        if (this._disconnectSessions) this.pausedStreams.push('sessions')
        if (this._disconnectLogs) this.pausedStreams.push('logs')
        if (this._disconnectTransactions) this.pausedStreams.push('transactions')
        this.disconnectAll()
      } else {
        // Resume: reconnect the streams that were active before pausing
        for (const stream of this.pausedStreams) {
          if (stream === 'sessions') this.connectSessions()
          if (stream === 'logs') this.connectLogs()
          if (stream === 'transactions') this.connectTransactions()
        }
        this.pausedStreams = []
      }
    },

    clearEvents(type: 'sessions' | 'logs' | 'transactions') {
      if (type === 'sessions') {
        eventBuffers.sessions = []
        this.sessionEvents = []
      }
      if (type === 'logs') {
        eventBuffers.logs = []
        this.logEvents = []
      }
      if (type === 'transactions') {
        eventBuffers.transactions = []
        this.transactionEvents = []
      }
    },
  },
})
