<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next'

const { toasts, remove } = useToast()
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none w-full max-w-sm px-4 sm:px-0">
    <TransitionGroup 
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto flex items-start p-4 rounded-lg shadow-lg border backdrop-blur-sm"
        :class="{
          'bg-green-50/90 border-green-200 dark:bg-green-900/40 dark:border-green-800 text-green-800 dark:text-green-300': toast.type === 'success',
          'bg-red-50/90 border-red-200 dark:bg-red-900/40 dark:border-red-800 text-red-800 dark:text-red-300': toast.type === 'error',
          'bg-blue-50/90 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800 text-blue-800 dark:text-blue-300': toast.type === 'info',
          'bg-amber-50/90 border-amber-200 dark:bg-amber-900/40 dark:border-amber-800 text-amber-800 dark:text-amber-300': toast.type === 'warning',
        }"
      >
        <div class="flex-shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5" />
          <Info v-else class="w-5 h-5" />
        </div>
        <div class="ml-3 flex-1 pt-0.5">
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button 
            @click="remove(toast.id)"
            class="inline-flex text-current opacity-60 hover:opacity-100 focus:outline-none transition-opacity"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>