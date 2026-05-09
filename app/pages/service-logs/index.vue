<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMonitoringStore } from '~/stores/monitoring'
import { getLevelColor, getLevelIcon, getStatusCodeColor } from '~/utils/statusHelpers'
import SearchInput from '~/components/ui/SearchInput.vue'
import FilterButton from '~/components/ui/FilterButton.vue'
import LogDetailsModal from '~/components/logs/LogDetailsModal.vue'
import Shimmer from '~/components/ui/Shimmer.vue'
import { 
  ScrollText, AlertTriangle, CheckCircle, XCircle, Info,
  Server, Activity, RefreshCw
} from 'lucide-vue-next'
import type { LogLevel } from '~/types/api'

const monitoringStore = useMonitoringStore()
const searchQuery = ref('')
const showModal = ref(false)
const selectedLog = ref<Record<string, any> | undefined>(undefined)
const isLoading = ref(true)
const autoRefreshInterval = ref(0) // 0 = off, otherwise minutes
const selectedServiceFilter = ref('All')
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

const refreshLogs = () => {
  isLoading.value = true
  monitoringStore.disconnectAll()
  monitoringStore.clearEvents('logs')
  monitoringStore.logStats = null
  monitoringStore.connectLogs()
  setTimeout(() => { isLoading.value = false }, 800)
}

const setupAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
  if (autoRefreshInterval.value > 0) {
    autoRefreshTimer = setInterval(() => {
      refreshLogs()
    }, autoRefreshInterval.value * 60 * 1000)
  }
}

onMounted(() => {
  const loadingTimeout = setTimeout(() => {
    isLoading.value = false
  }, 800)

  if (import.meta.client) {
    monitoringStore.connectLogs()
  }

  return () => clearTimeout(loadingTimeout)
})

onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})

const availableServices = computed(() => {
  const services = new Set(monitoringStore.logEvents.map(l => l.service))
  return ['All', ...Array.from(services)]
})

const filteredLogs = computed(() => {
  let logs = monitoringStore.logEvents
  if (selectedServiceFilter.value !== 'All') {
    logs = logs.filter(l => l.service === selectedServiceFilter.value)
  }
  const q = searchQuery.value.toLowerCase()
  if (!q) return logs
  return logs.filter(l =>
    l.message.toLowerCase().includes(q) ||
    l.service.toLowerCase().includes(q) ||
    l.level.toLowerCase().includes(q)
  )
})



const viewLog = (log: any) => { selectedLog.value = log; showModal.value = true }
const closeModal = () => { showModal.value = false; selectedLog.value = undefined }


const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Service Logs</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">System events, API calls, and error tracking</p>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">

      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-vibes-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Server class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Live</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.totalRequests.toLocaleString() }}</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Total Requests</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-red-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <XCircle class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Errors</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.errorRate.toFixed(2) }}%</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Error Rate</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-amber-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Activity class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Latency</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.avgLatency }}ms</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Avg Latency</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-emerald-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <CheckCircle class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Uptime</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.uptime.toFixed(2) }}%</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">System Uptime</p>
        </div>
      </div>
    </div>

    <!-- Live Log Stream -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[600px]">
      <!-- Controls -->
      <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-900/50">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
           <div class="flex items-center space-x-2">
             <button 
               @click="refreshLogs" 
               class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
             >
               <RefreshCw class="w-3.5 h-3.5" />
               <span>Refresh</span>
             </button>
             <select 
               v-model="autoRefreshInterval"
               @change="setupAutoRefresh"
               class="text-xs border-gray-200 dark:border-gray-700 rounded-md focus:ring-vibes-500 focus:border-vibes-500 bg-white dark:bg-gray-800 py-1.5 px-2 text-gray-600 dark:text-gray-300"
             >
               <option :value="0">Auto: Off</option>
               <option :value="1">1 min</option>
               <option :value="2">2 min</option>
               <option :value="5">5 min</option>
               <option :value="15">15 min</option>
               <option :value="30">30 min</option>
             </select>
           </div>
           <div class="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700"></div>
           <div class="w-full sm:w-64">
             <SearchInput v-model="searchQuery" placeholder="Filter logs..." />
           </div>
        </div>
        
        <div class="flex items-center space-x-3 overflow-x-auto pb-2 sm:pb-0">
           <span 
             class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
             :class="monitoringStore.connectionStatus.logs === 'connected' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : monitoringStore.connectionStatus.logs === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'"
           >
             <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="monitoringStore.connectionStatus.logs === 'connected' ? 'bg-green-500 animate-pulse' : monitoringStore.connectionStatus.logs === 'error' ? 'bg-red-500' : 'bg-amber-500'"></span>
             {{ monitoringStore.connectionStatus.logs }}
           </span>
           <select 
             v-model="selectedServiceFilter"
             class="text-xs border-gray-200 dark:border-gray-700 rounded-md focus:ring-vibes-500 focus:border-vibes-500 bg-white dark:bg-gray-800 py-1.5 px-2 text-gray-600 dark:text-gray-300"
           >
             <option v-for="svc in availableServices" :key="svc" :value="svc">{{ svc }}</option>
           </select>
        </div>
      </div>

      <!-- Live Tail View -->
      <div class="flex-1 overflow-x-auto overflow-y-auto bg-white dark:bg-gray-800 p-0 relative">
         <div class="min-w-[800px]">
           <!-- Headers -->
           <div class="flex items-center space-x-4 border-b border-gray-100 dark:border-gray-700 px-6 py-3 sticky top-0 bg-gray-50 dark:bg-gray-900/50 z-10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <span class="w-36 shrink-0">Timestamp</span>
              <span class="w-24 shrink-0">Service</span>
              <span class="w-24 shrink-0">Level</span>
              <span class="w-16 shrink-0">Status</span>
              <span class="flex-1">Message</span>
              <span class="w-20 shrink-0 text-right">Duration</span>
           </div>

           <template v-if="isLoading && monitoringStore.logEvents.length === 0">
              <div v-for="i in 8" :key="i" class="flex items-center space-x-4 px-6 py-3 border-b border-gray-50 dark:border-gray-700/50">
                 <div class="w-36 shrink-0"><Shimmer width="100px" height="14px" /></div>
                 <div class="w-24 shrink-0"><Shimmer width="60px" height="14px" /></div>
                 <div class="w-24 shrink-0"><Shimmer width="50px" height="20px" class="rounded-full" /></div>
                 <div class="w-16 shrink-0"><Shimmer width="30px" height="20px" class="rounded" /></div>
                 <div class="flex-1"><Shimmer width="80%" height="14px" /></div>
                 <div class="w-20 shrink-0 flex justify-end"><Shimmer width="40px" height="14px" /></div>
              </div>
           </template>

           <template v-else>
             <div v-if="filteredLogs.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-10 italic">
               {{ monitoringStore.isLive ? 'Waiting for log events...' : 'Live feed paused' }}
             </div>
             <div v-for="log in filteredLogs" :key="log.timestamp + log.message" class="flex items-center space-x-4 px-6 py-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group" @click="viewLog(log)">
                <!-- Timestamp -->
                <div class="w-36 shrink-0">
                   <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ log.dateTime ? log.dateTime.split('\n')[0] : '-' }}</div>
                   <div class="text-xs text-gray-400 dark:text-gray-500">{{ log.dateTime ? log.dateTime.split('\n')[1] : '-' }}</div>
                </div>
                
                <!-- Service -->
                <div class="w-24 shrink-0">
                   <span class="text-sm font-bold" :class="log.service === 'USSD' ? 'text-vibes-600 dark:text-vibes-400' : 'text-purple-600 dark:text-purple-400'">{{ log.service }}</span>
                </div>

                <!-- Level -->
                <div class="w-24 shrink-0">
                   <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="getLevelColor(log.level as LogLevel)">
                      <component :is="getLevelIcon(log.level as LogLevel)" class="w-3 h-3 mr-1.5" />
                      {{ log.level }}
                   </span>
                </div>

                <!-- Status -->
                <div class="w-16 shrink-0">
                   <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold" :class="getStatusCodeColor(log.statusCode)">
                      {{ log.statusCode }}
                   </span>
                </div>

                <!-- Message -->
                <div class="flex-1 min-w-0">
                   <p class="text-sm text-gray-600 dark:text-gray-300 truncate group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{{ log.message }}</p>
                </div>

                <!-- Duration -->
                <div class="w-20 shrink-0 text-right">
                   <span class="text-sm text-gray-500 dark:text-gray-400 font-mono">{{ formatDuration(log.durationMs) }}</span>
                </div>
             </div>
           </template>
         </div>
      </div>
    </div>

    <!-- Log Details Modal -->
    <LogDetailsModal 
      :show="showModal" 
      :log="selectedLog" 
      :is-collapsed="false" 
      @close="closeModal" 
    />
  </div>
</template>
