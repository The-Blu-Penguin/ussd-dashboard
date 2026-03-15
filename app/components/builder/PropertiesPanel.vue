<script setup>
import { Settings, XCircle } from 'lucide-vue-next'

const props = defineProps({
  selectedNode: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const updateNodeLabel = (val) => {
  if (props.selectedNode) {
    props.selectedNode.label = val
  }
}
</script>

<template>
  <div v-if="show" class="w-80 border-l border-gray-200 bg-white p-5 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 h-full">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-sm font-bold text-gray-800">Node Properties</h3>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
        <XCircle class="w-5 h-5" />
      </button>
    </div>

    <div v-if="selectedNode" class="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
      <!-- Node ID -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Node ID</label>
        <input 
          type="text" 
          v-model="selectedNode.id" 
          disabled
          class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
        />
      </div>

      <!-- Label -->
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">Display Label</label>
        <input 
          type="text" 
          :value="selectedNode.label"
          @input="updateNodeLabel($event.target.value)"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      <!-- Component Type Display -->
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">Type</label>
        <div class="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 inline-block">
          {{ selectedNode.data?.componentType || 'UNKNOWN' }}
        </div>
      </div>

      <hr class="border-gray-100 my-4" />

      <!-- Dynamic Properties based on type -->
      <div v-if="['INPUT', 'MENU', 'AUTH'].includes(selectedNode.data?.componentType)" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Prompt Text</label>
          <textarea 
            v-model="selectedNode.data.prompt"
            rows="3"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Enter prompt text shown to user..."
          ></textarea>
        </div>
        
        <div v-if="['INPUT', 'MENU'].includes(selectedNode.data?.componentType)">
          <label class="block text-xs font-medium text-gray-700 mb-1">Variable Name</label>
          <input 
            type="text" 
            v-model="selectedNode.data.variable"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g. amount"
          />
        </div>
      </div>

      <div v-if="selectedNode.data?.componentType === 'ACTION'" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Action Name</label>
          <input 
            type="text" 
            v-model="selectedNode.data.actionName"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g. processPayment"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Endpoint URL (Optional)</label>
          <input 
            type="text" 
            v-model="selectedNode.data.endpoint"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="https://api..."
          />
        </div>
      </div>

      <div v-if="selectedNode.data?.componentType === 'END'" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">End Message</label>
          <textarea 
            v-model="selectedNode.data.prompt"
            rows="3"
            class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Message to show before terminating session..."
          ></textarea>
        </div>
      </div>
    </div>
    
    <div v-else class="flex-1 flex flex-col items-center justify-center text-center px-4">
      <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Settings class="w-6 h-6 text-gray-400" />
      </div>
      <p class="text-sm text-gray-500">Select a node on the canvas to edit its properties.</p>
    </div>
  </div>
</template>