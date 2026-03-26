<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  width: {
    type: String,
    default: 'w-48'
  },
  placement: {
    type: String,
    default: 'bottom-right'
  }
})

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('click', handleClickOutside)
  }
  // Clean up refs
  dropdownRef.value = null
})
</script>

<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <div @click.stop="toggle">
      <slot name="trigger" />
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-2 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        :class="[
          width,
          placement === 'bottom-right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
        ]"
      >
        <div class="py-1" @click="close">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>
