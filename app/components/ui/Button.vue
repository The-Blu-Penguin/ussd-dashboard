<script setup lang="ts">
import { computed } from 'vue'
import Preloader from './Preloader.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger', 'success', 'outline', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button'
  },
  block: {
    type: Boolean,
    default: false
  }
})

const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg'

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary': return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
    case 'secondary': return 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'
    case 'danger': return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    case 'success': return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    case 'outline': return 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
    case 'ghost': return 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    default: return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'px-3 py-1.5 text-xs'
    case 'md': return 'px-4 py-2 text-sm'
    case 'lg': return 'px-6 py-3 text-base'
    default: return 'px-4 py-2 text-sm'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      baseClasses,
      variantClasses,
      sizeClasses,
      { 'w-full': block }
    ]"
  >
    <span v-if="loading" class="mr-2 flex items-center justify-center">
      <Preloader 
        :size="size === 'lg' ? 'sm' : 'xs'" 
        :color="['outline', 'ghost', 'secondary'].includes(variant) ? 'blue' : 'white'" 
      />
    </span>
    <slot />
  </button>
</template>
