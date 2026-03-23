<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md', // xs, sm, md, lg, xl
    validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'blue', // blue, white, gray, red, etc.
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

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-3 h-3 border-2'
    case 'sm': return 'w-4 h-4 border-2'
    case 'md': return 'w-8 h-8 border-3'
    case 'lg': return 'w-12 h-12 border-4'
    case 'xl': return 'w-16 h-16 border-4'
    default: return 'w-8 h-8 border-3'
  }
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'blue': return 'border-vibes-600 border-t-transparent'
    case 'white': return 'border-white border-t-transparent'
    case 'gray': return 'border-gray-600 border-t-transparent'
    case 'red': return 'border-red-600 border-t-transparent'
    case 'green': return 'border-green-600 border-t-transparent'
    case 'purple': return 'border-purple-600 border-t-transparent'
    default: return 'border-vibes-600 border-t-transparent'
  }
})
</script>

<template>
  <div 
    v-if="fullScreen" 
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity"
  >
    <div 
      class="rounded-full animate-spin"
      :class="[sizeClasses, colorClasses]"
    ></div>
    <p v-if="label" class="mt-4 text-sm font-medium text-gray-600 animate-pulse">{{ label }}</p>
  </div>
  
  <div v-else class="flex flex-col items-center justify-center" :class="{ 'p-4': size !== 'xs' }">
    <div 
      class="rounded-full animate-spin"
      :class="[sizeClasses, colorClasses]"
    ></div>
    <p v-if="label" class="mt-2 text-xs text-gray-500">{{ label }}</p>
  </div>
</template>
