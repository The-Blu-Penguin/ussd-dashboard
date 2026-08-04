<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMonitoringStore } from '~/stores/monitoring'
import type { SessionEvent } from '~/stores/monitoring'
import SearchInput from '~/components/ui/SearchInput.vue'
import FilterButton from '~/components/ui/FilterButton.vue'
import Shimmer from '~/components/ui/Shimmer.vue'
import { 
  Activity, 
  RefreshCw, 
  Smartphone, 
  Clock, 
  AlertCircle, 
  Eye, 
  Signal,
  Wifi,
  X
} from 'lucide-vue-next'

const monitoringStore = useMonitoringStore()
const searchQuery = ref('')
const showModal = ref(false)
const selectedSession = ref<SessionEvent | null>(null)
const isRefreshing = ref(false)

onMounted(() => {
  if (import.meta.client) {
    monitoringStore.connectSessions()
  }
})

// Disconnect the SSE stream when leaving the page to avoid background leaks
onUnmounted(() => {
  monitoringStore.disconnectSessions()
})

const refreshSessions = () => {
  isRefreshing.value = true
  monitoringStore.disconnectSessions()
  monitoringStore.clearEvents('sessions')
  monitoringStore.sessionStats = null
  monitoringStore.connectSessions()
  setTimeout(() => { isRefreshing.value = false }, 800)
}

const filteredEvents = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return monitoringStore.sessionEvents
  return monitoringStore.sessionEvents.filter(e =>
    e.sessionId.toLowerCase().includes(q) ||
    e.msisdn.toLowerCase().includes(q) ||
    e.ussdCode.toLowerCase().includes(q) ||
    e.network.toLowerCase().includes(q)
  )
})



const viewSession = (session: SessionEvent) => {
  selectedSession.value = session
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSession.value = null
}



const formatDuration = (seconds: number) => {
  if (!seconds) return '0s'
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

const getStatusFromEvent = (eventType: string) => {
  switch (eventType) {
    case 'SESSION_STARTED': return 'Active'
    case 'SESSION_ERROR': return 'Error'
    case 'SESSION_ENDED': return 'Ended'
    case 'SESSION_TIMEOUT': return 'Timeout'
    default: return eventType
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
    case 'Error': return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'Ended': return 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
    case 'Timeout': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    default: return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
  }
}

const getStatusDot = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-500 animate-pulse'
    case 'Error': return 'bg-red-500'
    case 'Ended': return 'bg-gray-400'
    case 'Timeout': return 'bg-amber-500'
    default: return 'bg-blue-500'
  }
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}
</script>

<template>
  <div class="space-y-6 relative">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Live Sessions</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time monitoring of USSD interactions across networks</p>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">
        <button 
          @click="refreshSessions" 
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
        <span 
          class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
          :class="monitoringStore.connectionStatus.sessions === 'connected' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' : monitoringStore.connectionStatus.sessions === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800'"
        >
          <Activity class="w-3.5 h-3.5 mr-1.5" :class="monitoringStore.connectionStatus.sessions === 'connected' ? 'animate-pulse' : ''" />
          {{ monitoringStore.activeSessionCount }} Active
        </span>

      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-vibes-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Smartphone class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Live</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.activeSessionCount }}</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Total Active Sessions</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-purple-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Clock class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 text-white bg-white/20 backdrop-blur-md rounded-full border border-white/20 shadow-sm">Avg</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ formatDuration(monitoringStore.avgSessionDuration) }}</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Session Duration</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-orange-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <AlertCircle class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Stalled</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.stalledSessionCount }}</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Stalled Sessions</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-emerald-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Signal class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 text-white bg-white/20 backdrop-blur-md rounded-full border border-white/20 shadow-sm">Top</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.topNetwork.toUpperCase() }}</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Top Network</p>
        </div>
      </div>
    </div>

    <!-- Session Events Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center space-x-2">
          <h2 class="font-bold text-gray-800 dark:text-gray-100">Current Activity</h2>
          <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">{{ monitoringStore.sessionEvents.length }}</span>
        </div>
        
        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <div class="relative w-full sm:w-64">
            <SearchInput v-model="searchQuery" placeholder="Search session ID, MSISDN..." />
          </div>
          <FilterButton label="Filter" />
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="px-6 py-4">Session Details</th>
              <th class="px-6 py-4">Network</th>
              <th class="px-6 py-4">Service Code</th>
              <th class="px-6 py-4">Event / Step</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Time</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <template v-if="isRefreshing">
              <tr v-for="i in 6" :key="i" class="border-b border-gray-50 dark:border-gray-700/50">
                <td class="px-6 py-4"><Shimmer width="120px" height="14px" /></td>
                <td class="px-6 py-4"><Shimmer width="60px" height="14px" /></td>
                <td class="px-6 py-4"><Shimmer width="80px" height="14px" /></td>
                <td class="px-6 py-4"><Shimmer width="100px" height="14px" /></td>
                <td class="px-6 py-4"><Shimmer width="70px" height="20px" class="rounded-full" /></td>
                <td class="px-6 py-4"><Shimmer width="60px" height="14px" /></td>
                <td class="px-6 py-4 text-right"><Shimmer width="30px" height="14px" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-if="monitoringStore.sessionEvents.length === 0">
                <td colspan="7" class="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic">
                  Waiting for session events...
                </td>
              </tr>
              <tr v-for="event in filteredEvents" :key="event.sessionId + event.timestamp" class="hover:bg-vibes-50/30 dark:hover:bg-gray-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{{ event.sessionId }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{{ event.msisdn }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-medium uppercase">{{ event.network }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-vibes-700 dark:text-vibes-400 font-mono font-bold bg-vibes-50 dark:bg-vibes-900/30 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800">{{ event.ussdCode }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ event.eventType }}</span>
                  <span v-if="event.currentStep" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ event.currentStep }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="getStatusColor(getStatusFromEvent(event.eventType))"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="getStatusDot(getStatusFromEvent(event.eventType))"></span>
                  {{ getStatusFromEvent(event.eventType) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatTime(event.timestamp) }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="viewSession(event)"
                  class="text-gray-400 hover:text-vibes-600 dark:hover:text-vibes-400 hover:bg-vibes-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-all group-hover:text-vibes-500 dark:group-hover:text-vibes-400" 
                  title="View Details"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
      

    </div>

    <!-- View Session Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700">
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Session Details</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-6" v-if="selectedSession">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Session ID</p>
              <p class="text-lg font-bold text-gray-900 dark:text-gray-100 font-mono">{{ selectedSession.sessionId }}</p>
            </div>
            <span 
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
              :class="getStatusColor(getStatusFromEvent(selectedSession.eventType))"
            >
              {{ getStatusFromEvent(selectedSession.eventType) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">MSISDN</p>
              <p class="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedSession.msisdn }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Service Code</p>
              <p class="font-mono text-sm font-medium text-vibes-600 dark:text-vibes-400">{{ selectedSession.ussdCode }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Network</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200 uppercase">{{ selectedSession.network }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Event Type</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedSession.eventType }}</p>
            </div>
          </div>

          <div v-if="selectedSession.currentStep || selectedSession.message || selectedSession.userInput">
            <h4 class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-3">Session Context</h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
              <div v-if="selectedSession.currentStep" class="px-4 py-3 flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Current Step</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ selectedSession.currentStep }}</span>
              </div>
              <div v-if="selectedSession.userInput" class="px-4 py-3 flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">User Input</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-200 font-mono">{{ selectedSession.userInput }}</span>
              </div>
              <div v-if="selectedSession.message" class="px-4 py-3 flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Message</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ selectedSession.message }}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-3">Technical Details</h4>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
              <div class="px-4 py-3 flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Timestamp</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-200 font-mono">{{ formatTime(selectedSession.timestamp) }}</span>
              </div>
              <div class="px-4 py-3 flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-400">Raw Timestamp</span>
                <span class="text-sm font-medium text-gray-900 dark:text-gray-200 font-mono">{{ selectedSession.timestamp }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="closeModal" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>
