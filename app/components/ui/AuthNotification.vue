<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Success!'
  },
  type: {
    type: String,
    default: 'success', // 'success' or 'info'
  }
})
</script>

<template>
  <div 
    class="fixed top-0 left-0 right-0 z-[100] flex justify-center transition-all duration-500 ease-in-out pointer-events-none"
    :class="show ? 'translate-y-4 opacity-100' : '-translate-y-full opacity-0'"
  >
    <div 
      class="text-white px-6 py-3 rounded-full shadow-2xl font-semibold flex items-center space-x-2 border"
      :class="type === 'success' ? 'bg-green-500 border-green-400' : 'bg-vibes-600 border-vibes-500'"
    >
      <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      <span>{{ message }}</span>
    </div>
  </div>
</template>