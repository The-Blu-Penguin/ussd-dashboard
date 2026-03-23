<script setup lang="ts">
import { Filter } from 'lucide-vue-next'

defineProps<{ label?: string }>()
</script>

<template>
  <button class="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
    <Filter class="w-4 h-4" />
    <span>{{ label }}</span>
  </button>
</template>
