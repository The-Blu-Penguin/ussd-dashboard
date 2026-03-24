<script setup lang="ts">
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1.5rem' },
  circle: { type: Boolean, default: false }
})
</script>

<template>
  <div 
    class="relative overflow-hidden bg-gray-200 dark:bg-gray-700"
    :class="circle ? 'rounded-full' : 'rounded-md'"
    :style="{ width, height }"
  >
    <div class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 dark:via-gray-500/30 to-transparent"></div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
</style>