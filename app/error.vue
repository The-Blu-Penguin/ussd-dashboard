<script setup>
import { AlertTriangle, ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center border border-gray-100">
      <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <AlertTriangle class="w-8 h-8 text-red-500" />
      </div>
      
      <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ error.statusCode }}</h1>
      <h2 class="text-xl font-semibold text-gray-700 mb-4">
        {{ error.statusCode === 404 ? 'Page Not Found' : 'An Error Occurred' }}
      </h2>
      
      <p class="text-gray-500 mb-8">
        {{ error.message || "We couldn't find the page you're looking for." }}
      </p>

      <button 
        @click="handleError"
        class="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-vibes-600 hover:bg-vibes-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
    
    <div class="mt-8 text-sm text-gray-400">
      USSD Admin Dashboard &copy; {{ new Date().getFullYear() }}
    </div>
  </div>
</template>
