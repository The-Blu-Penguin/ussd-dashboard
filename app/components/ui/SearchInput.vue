<script setup lang="ts">
import { Search } from 'lucide-vue-next'

defineProps<{ modelValue?: string; placeholder?: string }>()
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="relative w-full">
    <input 
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text" 
      :placeholder="placeholder" 
      class="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500/20 focus:border-vibes-500 transition-all"
    >
    <Search class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
  </div>
</template>
