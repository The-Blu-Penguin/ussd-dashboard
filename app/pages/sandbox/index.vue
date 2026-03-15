<script setup>
import { ref } from 'vue'
import { Play, RotateCcw, Save, Terminal, Code } from 'lucide-vue-next'

const code = ref('{\n  "type": "menu",\n  "message": "Welcome to Sandbox",\n  "options": [\n    "Option 1",\n    "Option 2"\n  ]\n}')
const output = ref([])
const isRunning = ref(false)

const runCode = () => {
  isRunning.value = true
  output.value.push({ type: 'system', message: 'Validating JSON configuration...', time: new Date().toLocaleTimeString() })
  
  // Simulate execution delay
  setTimeout(() => {
    try {
      const parsed = JSON.parse(code.value)
      output.value.push({ type: 'success', message: 'Valid JSON configuration', time: new Date().toLocaleTimeString() })
      output.value.push({ type: 'output', message: 'Preview: ' + parsed.message, time: new Date().toLocaleTimeString() })
    } catch (e) {
      output.value.push({ type: 'error', message: 'JSON Error: ' + e.message, time: new Date().toLocaleTimeString() })
    } finally {
      isRunning.value = false
    }
  }, 800)
}

const clearConsole = () => {
  output.value = []
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">USSD Sandbox</h1>
      <p class="text-sm text-gray-500">Test and debug your USSD logic in isolation</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      <!-- Code Editor -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden border border-gray-100">
        <div class="bg-gray-50 border-b border-gray-100 p-3 flex items-center justify-between">
          <div class="flex items-center space-x-2 text-sm text-gray-600 font-medium">
            <Code class="w-4 h-4 text-blue-500" />
            <span>logic.json</span>
          </div>
          <div class="flex items-center space-x-2">
             <button class="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors" title="Save">
               <Save class="w-4 h-4" />
             </button>
          </div>
        </div>
        <div class="flex-1 relative">
          <textarea 
            v-model="code"
            class="w-full h-full p-4 font-mono text-sm text-gray-800 bg-white resize-none focus:outline-none"
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <!-- Console / Output -->
      <div class="bg-gray-900 rounded-2xl shadow-lg flex flex-col overflow-hidden text-gray-300">
        <div class="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
          <div class="flex items-center space-x-2 text-sm font-medium text-gray-200">
            <Terminal class="w-4 h-4 text-green-400" />
            <span>Console</span>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="clearConsole" 
              class="p-1.5 hover:bg-gray-700 rounded-md text-gray-400 transition-colors" 
              title="Clear Console"
            >
              <RotateCcw class="w-4 h-4" />
            </button>
            <button 
              @click="runCode" 
              class="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
              :disabled="isRunning"
            >
              <Play class="w-3 h-3 fill-current" />
              <span>{{ isRunning ? 'Running...' : 'Run' }}</span>
            </button>
          </div>
        </div>
        
        <div class="flex-1 p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-2">
          <div v-if="output.length === 0" class="text-gray-600 italic mt-10 text-center">
            Ready to execute...
          </div>
          <div v-for="(log, idx) in output" :key="idx" class="border-l-2 pl-2"
            :class="{
              'border-gray-600 text-gray-400': log.type === 'system',
              'border-green-500 text-green-400': log.type === 'success',
              'border-blue-500 text-blue-300': log.type === 'output',
              'border-red-500 text-red-400': log.type === 'error'
            }"
          >
            <div class="flex justify-between opacity-50 mb-0.5">
               <span class="uppercase tracking-wider text-[10px]">{{ log.type }}</span>
               <span class="text-[10px]">{{ log.time }}</span>
            </div>
            <div class="whitespace-pre-wrap">{{ log.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #1f2937;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 20px;
}
</style>