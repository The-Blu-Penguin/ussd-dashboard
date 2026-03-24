<script setup lang="ts">
import { computed } from 'vue'
import Spinner from './Spinner.vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl
  },
  color: {
    type: String,
    default: 'primary', // primary, white, gray
  },
  fullScreen: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div 
    v-if="fullScreen" 
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity"
  >
    <Spinner :size="size" :color="color" />
    <p v-if="label" class="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300 animate-pulse">{{ label }}</p>
  </div>
  
  <div v-else class="flex flex-col items-center justify-center" :class="{ 'p-4': size !== 'sm' }">
    <Spinner :size="size" :color="color" />
    <p v-if="label" class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ label }}</p>
  </div>
</template>
