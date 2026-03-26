<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { AlertTriangle, RefreshCw, Home } from 'lucide-vue-next'

const props = defineProps({
  fallbackMessage: {
    type: String,
    default: 'Something went wrong'
  },
  showDetails: {
    type: Boolean,
    default: false
  }
})

const error = ref<Error | null>(null)
const errorInfo = ref<string>('')
const hasError = ref(false)

onErrorCaptured((err, instance, info) => {
  error.value = err
  errorInfo.value = info
  hasError.value = true
  
  // Log error to console in development
  if (import.meta.dev) {
    console.error('[ErrorBoundary] Caught error:', err)
    console.error('[ErrorBoundary] Error info:', info)
    console.error('[ErrorBoundary] Component:', instance)
  }
  
  // TODO: Log to error monitoring service (e.g., Sentry)
  
  // Prevent error from propagating
  return false
})

const retry = () => {
  hasError.value = false
  error.value = null
  errorInfo.value = ''
}

const goHome = () => {
  navigateTo('/')
}
</script>

<template>
  <div v-if="hasError" class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
    <div class="max-w-md w-full">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {{ fallbackMessage }}
        </h2>
        
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          We're sorry, but something unexpected happened. Please try again or return to the home page.
        </p>
        
        <div v-if="showDetails && error" class="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-left">
          <p class="text-sm font-mono text-red-600 dark:text-red-400 break-all">
            {{ error.message }}
          </p>
          <p v-if="errorInfo" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {{ errorInfo }}
          </p>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="retry"
            class="inline-flex items-center justify-center px-4 py-2 bg-vibes-600 text-white rounded-lg hover:bg-vibes-700 transition-colors"
          >
            <RefreshCw class="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <button
            @click="goHome"
            class="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Home class="w-4 h-4 mr-2" />
            Go Home
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <slot v-else />
</template>
