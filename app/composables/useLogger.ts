import { useLoggerStore, type LogCategory } from '~/stores/logger'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  id: string
  timestamp: number
  level: LogLevel
  category: LogCategory
  message: string
  metadata?: Record<string, any>
  error?: Error
}

interface LogOptions {
  category?: LogCategory
  metadata?: Record<string, any>
  error?: Error
  silent?: boolean // if true, don't show toast
}

let seq = 0
function generateId(): string {
  return `${Date.now()}-${++seq}-${Math.random().toString(36).substring(2, 7)}`
}

function shouldLog(level: LogLevel): boolean {
  const configLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'debug'
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
  return levels.indexOf(level) >= levels.indexOf(configLevel)
}

/**
 * Structured logger with categories, metadata, and Pinia store integration.
 *
 * Usage:
 *   const logger = useLogger()
 *   logger.info('Flow saved', { category: 'builder', metadata: { flowId: '123' } })
 *   logger.error('Save failed', { category: 'api', error: err })
 */
export const useLogger = () => {
  const store = useLoggerStore()

  const log = (level: LogLevel, message: string, options: LogOptions = {}) => {
    if (!shouldLog(level)) return

    const entry: LogEntry = {
      id: generateId(),
      timestamp: Date.now(),
      level,
      category: options.category || 'app',
      message,
      metadata: options.metadata,
      error: options.error,
    }

    store.addLog(entry)

    // Also mirror to console in dev
    if (import.meta.dev) {
      const consoleFn = level === 'error'
        ? console.error
        : level === 'warn'
          ? console.warn
          : level === 'debug'
            ? console.debug
            : console.log

      const prefix = `[${entry.category.toUpperCase()}] [${level.toUpperCase()}]`
      if (options.metadata || options.error) {
        consoleFn(prefix, message, {
          ...(options.metadata || {}),
          ...(options.error ? { error: options.error } : {}),
        })
      } else {
        consoleFn(prefix, message)
      }
    }

    // Toasts are NOT shown by the logger.
    // All user-facing error toasts are centralized in useErrorHandler.
  }

  return {
    debug: (message: string, options?: LogOptions) => log('debug', message, options),
    info: (message: string, options?: LogOptions) => log('info', message, options),
    warn: (message: string, options?: LogOptions) => log('warn', message, options),
    error: (message: string, options?: LogOptions) => log('error', message, options),

    // API helper: logs request/response as a pair
    api: {
      request: (method: string, url: string, metadata?: Record<string, any>) => {
        log('debug', `${method} ${url}`, { category: 'api', metadata: { ...metadata, direction: 'request' } })
      },
      response: (method: string, url: string, status: number, durationMs?: number, metadata?: Record<string, any>) => {
        const level = status >= 400 ? 'warn' : 'debug'
        log(level, `${method} ${url} → ${status}${durationMs ? ` (${durationMs}ms)` : ''}`, {
          category: 'api',
          metadata: { ...metadata, direction: 'response', status, durationMs },
        })
      },
      error: (method: string, url: string, err: any, metadata?: Record<string, any>) => {
        const message = err?.message || `${method} ${url} failed`
        log('error', message, {
          category: 'api',
          error: err instanceof Error ? err : new Error(String(err)),
          metadata: { ...metadata, direction: 'error', url, method },
        })
      },
    },

    // Builder helper
    builder: {
      nodeAdded: (type: string, nodeId: string) => log('debug', `Node added: ${type} (${nodeId})`, { category: 'builder' }),
      nodeRemoved: (nodeId: string) => log('debug', `Node removed: ${nodeId}`, { category: 'builder' }),
      edgeConnected: (source: string, target: string) => log('debug', `Edge connected: ${source} → ${target}`, { category: 'builder' }),
      flowSaved: (name: string, configId?: string) => log('info', `Flow "${name}" saved${configId ? ` (${configId})` : ''}`, { category: 'builder' }),
      flowLoaded: (name: string, configId?: string) => log('info', `Flow "${name}" loaded${configId ? ` (${configId})` : ''}`, { category: 'builder' }),
      validationFailed: (reason: string) => log('warn', `Flow validation failed: ${reason}`, { category: 'builder' }),
    },

    // SSE helper
    sse: {
      connected: (url: string) => log('info', `SSE connected: ${url}`, { category: 'sse' }),
      disconnected: (url: string) => log('info', `SSE disconnected: ${url}`, { category: 'sse' }),
      message: (url: string, event: string) => log('debug', `SSE message [${event}] from ${url}`, { category: 'sse' }),
      error: (url: string, err: any) => log('error', `SSE error on ${url}`, { category: 'sse', error: err instanceof Error ? err : new Error(String(err)) }),
    },
  }
}
