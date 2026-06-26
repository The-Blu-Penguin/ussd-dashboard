<script setup lang="ts">
import { ref } from 'vue'
import { Play, RotateCcw, Terminal, Code, Send, RefreshCw } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

interface LogEntry {
  type: string
  message: string
  time: string
}

const code = ref('{\n  "type": "menu",\n  "message": "Welcome to Sandbox",\n  "options": [\n    "Option 1",\n    "Option 2"\n  ]\n}')
const output = ref<LogEntry[]>([])
const isRunning = ref(false)
const sessionId = ref<string | null>(null)
const userInput = ref('')

const authStore = useAuthStore()
const toast = useToast()

const log = (type: string, message: string) => {
  output.value.push({ type, message, time: new Date().toLocaleTimeString() })
}

const sandboxFetch = async <T = any>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: any } = {}
): Promise<T> => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  if (authStore.accessToken) {
    headers['Authorization'] = `Bearer ${authStore.accessToken}`
  }
  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const url = `/ussd/sandbox${path}`
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  }
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, fetchOptions)
  const text = await response.text()
  let parsed: any = null
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
  }

  if (!response.ok) {
    const message =
      (parsed && typeof parsed === 'object' && (parsed.message || parsed.error)) ||
      `HTTP ${response.status}`
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return parsed as T
}

const extractSessionId = (payload: any): string | null => {
  if (!payload) return null
  return payload.sessionId || payload.session_id || payload.id || null
}

const extractMessage = (payload: any): string | null => {
  if (!payload) return null
  return payload.message || payload.text || payload.response || null
}

const extractOptions = (payload: any): string[] | null => {
  if (!payload) return null
  if (Array.isArray(payload.options)) return payload.options
  if (Array.isArray(payload.choices)) return payload.choices
  return null
}

const renderResponse = (payload: any, fallbackMsg: string) => {
  const message = extractMessage(payload)
  const options = extractOptions(payload)
  if (message) log('output', message)
  else if (fallbackMsg) log('output', fallbackMsg)
  if (options?.length) log('output', 'Options: ' + options.join(' | '))
}

const startSession = async () => {
  isRunning.value = true
  log('system', 'Starting sandbox session...')
  try {
    const payload = await sandboxFetch<any>('/start', { method: 'POST' })

    const newSessionId = extractSessionId(payload)
    if (newSessionId) {
      sessionId.value = newSessionId
      log('success', `Session started: ${newSessionId}`)
      renderResponse(payload, 'No message in response')
    } else {
      const message = 'Failed to start session (no sessionId returned)'
      log('error', message)
      toast.error(message)
    }
  } catch (error: any) {
    const message = error.message || 'Failed to start session'
    log('error', message)
    toast.error(message)
  } finally {
    isRunning.value = false
  }
}

const sendInput = async () => {
  const trimmed = userInput.value.trim()
  if (!sessionId.value || !trimmed) return

  log('sent', `> ${trimmed}`)
  const sent = userInput.value
  userInput.value = ''
  isRunning.value = true

  try {
    const payload = await sandboxFetch<any>('/input', {
      method: 'POST',
      body: { sessionId: sessionId.value, input: trimmed },
    })

    if (payload && (extractMessage(payload) || extractOptions(payload) || extractSessionId(payload))) {
      renderResponse(payload, 'OK')
    } else {
      const message = 'No response from server'
      log('error', message)
      // Restore the user's input so they can retry
      userInput.value = sent
    }
  } catch (error: any) {
    const message = error.message || 'Failed to send input'
    log('error', message)
    userInput.value = sent
    toast.error(message)
  } finally {
    isRunning.value = false
  }
}

const getSession = async () => {
  if (!sessionId.value) return

  log('system', `Fetching session ${sessionId.value}...`)
  isRunning.value = true
  try {
    const payload = await sandboxFetch<any>(`/${sessionId.value}`, { method: 'GET' })

    if (payload) {
      log('success', 'Session state:')
      try {
        log('output', JSON.stringify(payload, null, 2))
      } catch {
        log('output', String(payload))
      }
    } else {
      log('error', 'Empty response')
    }
  } catch (error: any) {
    const message = error.message || 'Failed to fetch session'
    log('error', message)
  } finally {
    isRunning.value = false
  }
}

const clearConsole = () => {
  output.value = []
  sessionId.value = null
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">USSD Sandbox</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Test and debug your USSD logic in isolation</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      <!-- Code Editor -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
        <div class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between">
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
            <Code class="w-4 h-4 text-vibes-500 dark:text-vibes-400" />
            <span>logic.json</span>
            <span v-if="sessionId" class="ml-2 text-[10px] text-gray-400 font-mono">session: {{ sessionId }}</span>
          </div>
        </div>
        <div class="flex-1 relative">
          <textarea
            v-model="code"
            class="w-full h-full p-4 font-mono text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none focus:outline-none"
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <!-- Console / Output -->
      <div class="bg-gray-900 rounded-2xl shadow-lg flex flex-col overflow-hidden text-gray-300">
        <div class="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
          <div class="flex items-center space-x-2 text-sm font-medium text-gray-200">
            <Terminal class="w-4 h-4 text-green-400" />
            <span>Console</span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="sessionId"
              @click="getSession"
              class="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 transition-colors"
              title="Fetch session state"
              :disabled="isRunning"
            >
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isRunning }" />
            </button>
            <button
              @click="clearConsole"
              class="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 transition-colors"
              title="Clear Console"
            >
              <RotateCcw class="w-4 h-4" />
            </button>
            <button
              @click="startSession"
              class="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isRunning"
            >
              <Play class="w-3 h-3 fill-current" />
              <span>{{ sessionId ? 'Restart' : 'Start Session' }}</span>
            </button>
          </div>
        </div>

        <div class="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2">
          <div v-if="output.length === 0" class="text-gray-600 italic mt-10 text-center">
            Click "Start Session" to begin...
          </div>
          <div v-for="(logEntry, idx) in output" :key="idx" class="border-l-2 pl-2"
            :class="{
              'border-gray-600 text-gray-400': logEntry.type === 'system',
              'border-green-500 text-green-400': logEntry.type === 'success',
              'border-vibes-500 text-vibes-300': logEntry.type === 'output',
              'border-blue-500 text-blue-400': logEntry.type === 'sent',
              'border-red-500 text-red-400': logEntry.type === 'error'
            }"
          >
            <div class="flex justify-between opacity-50 mb-0.5">
               <span class="uppercase tracking-wider text-[10px]">{{ logEntry.type }}</span>
               <span class="text-[10px]">{{ logEntry.time }}</span>
            </div>
            <div class="whitespace-pre-wrap">{{ logEntry.message }}</div>
          </div>
        </div>

        <!-- Input bar -->
        <div class="border-t border-gray-700 p-2 flex items-center space-x-2">
          <input
            v-model="userInput"
            type="text"
            :disabled="!sessionId || isRunning"
            :placeholder="sessionId ? 'Send input to session...' : 'Start a session first'"
            class="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 text-xs font-mono px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-vibes-500 disabled:opacity-50"
            @keydown.enter="sendInput"
          >
          <button
            @click="sendInput"
            :disabled="!sessionId || !userInput.trim() || isRunning"
            class="flex items-center space-x-1 bg-vibes-600 hover:bg-vibes-700 text-white px-3 py-2 rounded text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send class="w-3 h-3" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 20px;
}
</style>
