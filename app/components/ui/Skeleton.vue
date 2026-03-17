<script setup lang="ts">
defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '1rem'
  },
  circle: {
    type: Boolean,
    default: false
  },
  lines: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div class="animate-pulse space-y-2">
    <div
      v-for="i in lines"
      :key="i"
      class="bg-gray-200 rounded"
      :class="{ 'rounded-full': circle }"
      :style="{ 
        width: width, 
        height: height,
        opacity: 1 - (i - 1) * 0.2
      }"
    ></div>
  </div>
</template>
