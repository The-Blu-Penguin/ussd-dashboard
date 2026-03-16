<script setup>
import { ref } from 'vue'
import { Phone, Delete, Activity } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'

const screenContent = ref('')
const isRunning = ref(false)
const sessionLog = ref([])

const keys = [
  { label: '1', sub: '' }, { label: '2', sub: 'ABC' }, { label: '3', sub: 'DEF' },
  { label: '4', sub: 'GHI' }, { label: '5', sub: 'JKL' }, { label: '6', sub: 'MNO' },
  { label: '7', sub: 'PQRS' }, { label: '8', sub: 'TUV' }, { label: '9', sub: 'WXYZ' },
  { label: '*', sub: '' }, { label: '0', sub: '+' }, { label: '#', sub: '' }
]

const handleKeyPress = (key) => {
  if (screenContent.value.length < 20) {
    screenContent.value += key
  }
}

const handleDelete = () => {
  screenContent.value = screenContent.value.slice(0, -1)
}

const isSending = ref(false)

const handleCall = async () => {
  if (screenContent.value) {
    isRunning.value = true
    isSending.value = true
    sessionLog.value.push({ type: 'sent', message: screenContent.value, time: new Date().toLocaleTimeString() })
    
    // Simulate USSD Response
    await new Promise(resolve => setTimeout(resolve, 800))
    
    sessionLog.value.push({ 
      type: 'received', 
      message: 'Welcome to USSD Simulator\n1. Check Balance\n2. Buy Airtime\n3. Exit', 
      time: new Date().toLocaleTimeString() 
    })
    screenContent.value = ''
    isSending.value = false
  }
}

const handleEndSession = () => {
  isRunning.value = false
  sessionLog.value.push({ type: 'system', message: 'Session Ended', time: new Date().toLocaleTimeString() })
  screenContent.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">USSD Simulator</h1>
      <p class="text-sm text-gray-500">Dial a code and test menu responses</p>
    </div>

    <div class="flex flex-col xl:flex-row gap-6">
    <!-- Simulator Phone -->
    <div class="flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-sm flex items-center justify-center">
      <div class="w-full max-w-[320px] bg-gray-900 rounded-[40px] p-4 shadow-2xl border-4 border-gray-800 relative">
        <!-- Phone Speaker -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-xl z-10 flex justify-center items-center">
          <div class="w-12 h-1.5 bg-gray-700 rounded-full"></div>
        </div>

        <!-- Phone Screen -->
        <div class="bg-gray-100 h-[560px] md:h-[600px] rounded-[32px] overflow-hidden flex flex-col relative">
          <!-- Status Bar -->
          <div class="h-8 bg-gray-200 flex justify-between items-center px-4 text-[10px] text-gray-600 font-bold">
            <span>9:41</span>
            <div class="flex space-x-1">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          <!-- Active USSD Session Screen -->
          <div v-if="isRunning" class="absolute inset-0 top-8 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center p-6">
            <div class="bg-white w-full rounded-lg shadow-lg overflow-hidden">
              <div class="p-4 border-b border-gray-100">
                <h3 class="text-sm font-bold text-gray-800">USSD Message</h3>
              </div>
              <div class="p-4 min-h-[100px] text-sm text-gray-600 whitespace-pre-wrap">
                {{ sessionLog[sessionLog.length - 1]?.message }}
              </div>
              <div class="p-4 bg-gray-50 flex gap-2">
                <input 
                  v-model="screenContent" 
                  type="text" 
                  class="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Reply..."
                >
                <Button 
                  @click="handleCall" 
                  variant="primary" 
                  size="sm"
                  :loading="isSending"
                  class="rounded"
                >
                  Send
                </Button>
                <Button 
                  @click="handleEndSession" 
                  variant="secondary" 
                  size="sm"
                  class="rounded"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          <!-- Dialer Screen -->
          <div class="flex-1 flex flex-col">
            <!-- Display Area -->
            <div class="flex-1 flex items-end justify-center pb-8 px-6">
              <span class="text-3xl font-light text-gray-800 tracking-wider">{{ screenContent }}</span>
              <span v-if="!screenContent" class="text-3xl text-gray-300">...</span>
            </div>

            <!-- Keypad -->
            <div class="bg-white pb-8 pt-4 px-6 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div class="grid grid-cols-3 gap-y-4 gap-x-6 mb-6">
                <button 
                  v-for="key in keys" 
                  :key="key.label"
                  @click="handleKeyPress(key.label)"
                  class="w-16 h-16 rounded-full bg-gray-50 hover:bg-gray-100 active:bg-gray-200 flex flex-col items-center justify-center transition-colors"
                >
                  <span class="text-2xl font-medium text-gray-800">{{ key.label }}</span>
                  <span class="text-[9px] font-bold text-gray-400 tracking-widest">{{ key.sub }}</span>
                </button>
              </div>

              <!-- Call Actions -->
              <div class="grid grid-cols-3 gap-6 items-center">
                <div class="flex justify-center">
                  <!-- Empty placeholder for alignment -->
                </div>
                <button 
                  @click="handleCall"
                  class="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 flex items-center justify-center text-white shadow-lg shadow-green-200 transition-all transform active:scale-95"
                >
                  <Phone class="w-7 h-7 fill-current" />
                </button>
                <div class="flex justify-center">
                  <button 
                    v-if="screenContent"
                    @click="handleDelete"
                    class="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <Delete class="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simulator Logs & Config -->
    <div class="w-full xl:w-96 flex flex-col gap-6">
      <!-- Session Info -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Activity class="w-5 h-5 mr-2 text-blue-500" />
          Session Logs
        </h2>
        <div class="max-h-[300px] overflow-y-auto custom-scrollbar space-y-3 pr-2">
          <div v-if="sessionLog.length === 0" class="text-center text-gray-400 py-10 text-sm">
            No active session logs. Start a USSD call to see logs here.
          </div>
          <div v-for="(log, idx) in sessionLog" :key="idx" 
               class="p-3 rounded-lg text-sm border-l-4"
               :class="{
                 'bg-blue-50 border-blue-500': log.type === 'sent',
                 'bg-green-50 border-green-500': log.type === 'received',
                 'bg-gray-50 border-gray-400': log.type === 'system'
               }"
          >
            <div class="flex justify-between mb-1">
              <span class="font-bold text-xs uppercase" 
                    :class="{
                      'text-blue-700': log.type === 'sent',
                      'text-green-700': log.type === 'received',
                      'text-gray-600': log.type === 'system'
                    }"
              >{{ log.type }}</span>
              <span class="text-xs text-gray-400">{{ log.time }}</span>
            </div>
            <p class="text-gray-700 font-mono whitespace-pre-wrap">{{ log.message }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Quick Test Codes</h2>
        <div class="space-y-2">
          <button @click="screenContent = '*123#'" class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex justify-between group">
            <span>Check Balance</span>
            <span class="font-mono text-gray-400 group-hover:text-blue-400">*123#</span>
          </button>
          <button @click="screenContent = '*141#'" class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex justify-between group">
            <span>Buy Bundle</span>
            <span class="font-mono text-gray-400 group-hover:text-blue-400">*141#</span>
          </button>
          <button @click="screenContent = '*999#'" class="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex justify-between group">
            <span>Customer Service</span>
            <span class="font-mono text-gray-400 group-hover:text-blue-400">*999#</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
