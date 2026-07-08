<script setup lang="ts">
import { ref, computed } from 'vue'
import { Play, RotateCcw, Terminal, Code, Send, StopCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useSandboxErrorHandler } from '~/composables/useSandboxErrorHandler'
import type { SandboxResponse } from '~/types/api'

interface LogEntry {
  type: string
  message: string
  time: string
}

const defaultConfig = {
  entry: 'enter_amount',
  steps: [
    {
      id: 'enter_amount',
      next: 'enter_description',
      type: 'INPUT',
      input: {
        variable: 'amount',
        validation: {
          type: 'AMOUNT',
          minValue: 0.01,
          errorMessage: 'Invalid amount. Enter numbers only',
        },
      },
      prompt: 'Welcome to merchantName\nEnter amount:',
    },
    {
      id: 'enter_description',
      next: 'process_payment',
      type: 'INPUT',
      input: {
        variable: 'description',
        validation: { type: 'ALPHANUMERIC' },
      },
      prompt: 'Enter reference:',
    },
    {
      id: 'process_payment',
      type: 'ACTION',
      onFailure: 'payment_failed',
      onSuccess: 'payment_success',
      actionName: 'processPaymentToMerchant',
    },
    {
      id: 'payment_success',
      type: 'END',
      prompt:
        'Request submitted successfully. You will receive a payment prompt shortly. If prompt delays, dial *170# to approve transaction. Ref: transactionReference.',
    },
    {
      id: 'payment_failed',
      type: 'END',
      prompt: 'Transfer failed. Please try again later.',
    },
  ],
  version: 1,
  configId: 'config_v1',
  metadata: {
    name: 'MENU CONFIG',
    description: 'BLU PAY USSD MENU FLOW',
  },
}

// Form state
const code = ref(JSON.stringify(defaultConfig, null, 2))
const msisdn = ref('23385264217')
const network = ref('mtn')
const ussdCode = ref('820*1*170')
const simulateFailure = ref(false)

// Session state
const output = ref<LogEntry[]>([])
const isRunning = ref(false)
const sessionId = ref<string | null>(null)
const currentScreen = ref<string | null>(null)
const currentStep = ref<string | null>(null)
const userInput = ref('')

const authStore = useAuthStore()
const sandboxHandler = useSandboxErrorHandler()

const isSessionEnded = computed(() => {
  return sessionId.value !== null && output.value.some(e => e.type === 'ended')
})

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

const renderSandboxResponse = (response: SandboxResponse) => {
  // Update session state
  if (response.sessionId) {
    sessionId.value = response.sessionId
  }
  if (response.screen) {
    currentScreen.value = response.screen
  }
  if (response.currentStep) {
    currentStep.value = response.currentStep
  }

  // Render console entries
  if (response.consoleEntries && response.consoleEntries.length > 0) {
    for (const entry of response.consoleEntries) {
      log(entry.type || 'output', entry.message)
    }
  } else if (response.screen) {
    // Fallback to screen if no console entries
    log('output', response.screen)
  }

  // Handle session end
  if (response.isEnded) {
    log('ended', 'Session ended')
  }
}

const startSession = async () => {
  isRunning.value = true
  log('system', 'Starting sandbox session...')
  try {
    const payload = await sandboxFetch<SandboxResponse>('/start', {
      method: 'POST',
      body: {
        configJson: code.value, // Send as JSON string
        msisdn: msisdn.value,
        network: network.value,
        ussdCode: ussdCode.value,
        simulateFailure: simulateFailure.value,
      },
    })

    if (payload && payload.sessionId) {
      renderSandboxResponse(payload)
      log('success', `Session started: ${payload.sessionId}`)
    } else {
      const message = 'Failed to start session (no sessionId returned)'
      log('error', message)
      sandboxHandler.handleSessionError(new Error(message))
    }
  } catch (error: any) {
    const message = error.message || 'Failed to start session'
    log('error', message)
    sandboxHandler.handleSessionError(new Error(message))
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
    const payload = await sandboxFetch<SandboxResponse>('/input', {
      method: 'POST',
      body: {
        sessionId: sessionId.value,
        userInput: trimmed, // Use userInput not input
      },
    })

    if (payload) {
      renderSandboxResponse(payload)
    } else {
      const message = 'No response from server'
      log('error', message)
      userInput.value = sent
    }
  } catch (error: any) {
    const message = error.message || 'Failed to send input'
    log('error', message)
    userInput.value = sent
    sandboxHandler.handleInputError(new Error(message))
  } finally {
    isRunning.value = false
  }
}

const clearConsole = () => {
  output.value = []
  sessionId.value = null
  currentScreen.value = null
  currentStep.value = null
}

const endSession = () => {
  if (sessionId.value) {
    log('ended', `Session ${sessionId.value} manually ended`)
    sessionId.value = null
    currentScreen.value = null
    currentStep.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">USSD Sandbox</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Test and debug your USSD logic in isolation</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      <!-- Left Panel: Code Editor + Config -->
      <div class="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
        <!-- Session Config -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <div class="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
            <Terminal class="w-4 h-4 text-vibes-500 dark:text-vibes-400" />
            <span>Session Configuration</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">MSISDN</label>
              <input
                v-model="msisdn"
                type="text"
                placeholder="23385264217"
                class="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-vibes-500"
                :disabled="!!sessionId && !isSessionEnded"
              >
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Network</label>
              <select
                v-model="network"
                class="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-vibes-500"
                :disabled="!!sessionId && !isSessionEnded"
              >
                <option value="mtn">MTN</option>
                <option value="telecel">Telecel</option>
                <option value="airtel">Airtel</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">USSD Code</label>
              <input
                v-model="ussdCode"
                type="text"
                placeholder="820*1*170"
                class="w-full bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-vibes-500"
                :disabled="!!sessionId && !isSessionEnded"
              >
            </div>
            <div class="flex items-end">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  v-model="simulateFailure"
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-vibes-600 focus:ring-vibes-500"
                  :disabled="!!sessionId && !isSessionEnded"
                >
                <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Simulate Failure</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Code Editor -->
        <div class="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 min-h-0">
          <div class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between">
            <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 font-medium">
              <Code class="w-4 h-4 text-vibes-500 dark:text-vibes-400" />
              <span>configJson</span>
              <span v-if="sessionId" class="ml-2 text-[10px] text-gray-400 font-mono">session: {{ sessionId }}</span>
              <span v-if="currentStep" class="ml-2 text-[10px] text-vibes-500 font-mono">step: {{ currentStep }}</span>
            </div>
          </div>
          <div class="flex-1 relative min-h-0">
            <textarea
              v-model="code"
              class="w-full h-full p-4 font-mono text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-800 resize-none focus:outline-none"
              spellcheck="false"
              :disabled="!!sessionId && !isSessionEnded"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Console / Output -->
      <div class="bg-gray-900 rounded-2xl shadow-lg flex flex-col overflow-hidden text-gray-300">
        <div class="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
          <div class="flex items-center space-x-2 text-sm font-medium text-gray-200">
            <Terminal class="w-4 h-4 text-green-400" />
            <span>Console</span>
            <span v-if="isSessionEnded" class="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">ENDED</span>
            <span v-else-if="sessionId" class="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">ACTIVE</span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="clearConsole"
              class="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 transition-colors"
              title="Clear Console"
            >
              <RotateCcw class="w-4 h-4" />
            </button>
            <button
              v-if="sessionId && !isSessionEnded"
              @click="endSession"
              class="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isRunning"
            >
              <StopCircle class="w-3 h-3 fill-current" />
              <span>End Session</span>
            </button>
            <button
              @click="startSession"
              class="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isRunning"
            >
              <Play class="w-3 h-3 fill-current" />
              <span>{{ !sessionId || isSessionEnded ? 'Start' : 'Restart' }}</span>
            </button>
          </div>
        </div>

        <div class="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2">
          <div v-if="output.length === 0" class="text-gray-600 italic mt-10 text-center">
            Click "Start" to begin...
          </div>
          <div v-for="(logEntry, idx) in output" :key="idx" class="border-l-2 pl-2"
            :class="{
              'border-gray-600 text-gray-400': logEntry.type === 'system',
              'border-green-500 text-green-400': logEntry.type === 'success',
              'border-vibes-500 text-vibes-300': logEntry.type === 'output',
              'border-blue-500 text-blue-400': logEntry.type === 'sent',
              'border-red-500 text-red-400': logEntry.type === 'error',
              'border-yellow-500 text-yellow-400': logEntry.type === 'ended'
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
            :disabled="!sessionId || isRunning || isSessionEnded"
            :placeholder="!sessionId ? 'Start a session first' : isSessionEnded ? 'Session ended' : 'Send input to session...'"
            class="flex-1 bg-gray-800 text-gray-100 placeholder-gray-500 text-xs font-mono px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-vibes-500 disabled:opacity-50"
            @keydown.enter="sendInput"
          >
          <button
            @click="sendInput"
            :disabled="!sessionId || !userInput.trim() || isRunning || isSessionEnded"
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
