<script setup>
import { X } from 'lucide-vue-next'
import { getLevelColor, getLevelIcon, getStatusCodeColor } from '~/utils/statusHelpers'

const props = defineProps({
  show: Boolean,
  log: Object,
  isCollapsed: Boolean
})

const emit = defineEmits(['close'])
</script>

<template>
  <div 
    v-if="show" 
    class="fixed bottom-0 top-16 right-0 z-40 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'left-20' : 'left-64'"
  >
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="$emit('close')"></div>
    
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-full">
      <!-- Modal Header -->
      <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h3 class="text-lg font-bold text-gray-800">Log Details</h3>
          <p class="text-xs text-gray-500 font-mono mt-0.5">{{ log?.id }}</p>
        </div>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-6 overflow-y-auto" v-if="log">
        <!-- Status & Level -->
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p class="text-xs text-gray-500 mb-1">Status Code</p>
            <span class="text-2xl font-bold px-3 py-1 rounded-lg" :class="getStatusCodeColor(log.statusCode)">
              {{ log.statusCode }}
            </span>
          </div>
           <span 
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
              :class="getLevelColor(log.level)"
            >
              <component :is="getLevelIcon(log.level)" class="w-3.5 h-3.5 mr-1.5" />
              {{ log.level }}
            </span>
        </div>

        <!-- Grid Details -->
        <div class="grid grid-cols-2 gap-4">
           <div class="p-3 border border-gray-100 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Timestamp</p>
            <p class="text-sm font-medium text-gray-900">{{ log.timestamp }}</p>
          </div>
           <div class="p-3 border border-gray-100 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Service</p>
            <p class="text-sm font-medium text-gray-900">{{ log.service }}</p>
          </div>
           <div class="p-3 border border-gray-100 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Duration</p>
            <p class="text-sm font-medium text-gray-900">{{ log.duration }}</p>
          </div>
        </div>

        <!-- Message -->
        <div class="space-y-2">
            <p class="text-sm font-medium text-gray-700">Message</p>
            <div class="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-800">
                {{ log.message }}
            </div>
        </div>

        <!-- Stack Trace (if error) -->
        <div v-if="log.trace" class="space-y-2">
            <p class="text-sm font-medium text-red-600">Stack Trace</p>
            <div class="p-3 bg-gray-900 rounded-lg border border-gray-800 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
                {{ log.trace }}
            </div>
        </div>
      </div>
    </div>
  </div>
</template>
