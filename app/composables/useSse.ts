import { useAuthStore } from '~/stores/auth'
import { useLogger } from '~/composables/useLogger'

export interface SseOptions {
  onMessage?: (event: string, data: any) => void
  onError?: (error: Error) => void
  onOpen?: () => void
}

export const useSse = () => {
  const authStore = useAuthStore()
  const logger = useLogger()

  const connect = (url: string, options: SseOptions) => {
    let abortController: AbortController | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
    let isStopped = false

    const doConnect = async () => {
      if (isStopped || !import.meta.client) return
      abortController = new AbortController()

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            ...(authStore.accessToken ? { 'Authorization': `Bearer ${authStore.accessToken}` } : {}),
          },
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`SSE HTTP ${response.status}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        logger.sse.connected(url)
        options.onOpen?.()

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (isStopped) break

          buffer += decoder.decode(value, { stream: true })

          // Normalize line endings for SSE parsing
          buffer = buffer.replace(/\r\n/g, '\n')

          // Process complete events (separated by blank lines)
          let boundary = buffer.indexOf('\n\n')
          while (boundary !== -1) {
            const block = buffer.substring(0, boundary)
            buffer = buffer.substring(boundary + 2)

            const lines = block.split('\n')
            let eventName = 'message'
            let data = ''

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim()
              } else if (line.startsWith('data:')) {
                data = line.slice(5).trim()
              }
            }

            if (data) {
              try {
                const parsed = JSON.parse(data)
                logger.sse.message(url, eventName)
                options.onMessage?.(eventName, parsed)
              } catch {
                logger.sse.message(url, eventName)
                options.onMessage?.(eventName, data)
              }
            }

            boundary = buffer.indexOf('\n\n')
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          logger.sse.disconnected(url)
          return
        }
        logger.sse.error(url, error)
        options.onError?.(error)
      }

      // Reconnect after delay if not stopped
      if (!isStopped) {
        reconnectTimeout = setTimeout(doConnect, 3000)
      }
    }

    doConnect()

    return () => {
      isStopped = true
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
        reconnectTimeout = null
      }
      abortController?.abort()
      logger.sse.disconnected(url)
    }
  }

  return { connect }
}
