<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useState } from '#imports'
import { useMockData } from '~/composables/useMockData'
import { getLevelColor, getLevelIcon, getStatusCodeColor } from '~/utils/statusHelpers'
import SearchInput from '~/components/ui/SearchInput.vue'
import Pagination from '~/components/ui/Pagination.vue'
import FilterButton from '~/components/ui/FilterButton.vue'
import LogDetailsModal from '~/components/logs/LogDetailsModal.vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import { 
  ScrollText, Download, AlertTriangle, CheckCircle, XCircle, Info,
  Server, Activity, Pause, Play, Trash2
} from 'lucide-vue-next'

const { initialServiceLogs, generateServiceLog } = useMockData()
const logs = ref([...initialServiceLogs])

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showModal = ref(false)
const selectedLog = ref<Record<string, any> | undefined>(undefined)
const isCollapsed = useState('sidebarCollapsed', () => false)
const isLive = ref(true)
const timeFilter = ref('Live')
const isLoading = ref(true)

const filteredLogs = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return logs.value
  return logs.value.filter(l =>
    l.message.toLowerCase().includes(q) ||
    l.service.toLowerCase().includes(q) ||
    l.level.toLowerCase().includes(q) ||
    l.id.toLowerCase().includes(q)
  )
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredLogs.value.slice(start, start + itemsPerPage)
})

let intervalId: ReturnType<typeof setInterval> | undefined

const addMockLog = () => {
  if (!isLive.value) return
  logs.value.unshift(generateServiceLog())
  if (logs.value.length > 50) logs.value.pop()
}

onMounted(() => {
  // Simulate initial loading
  setTimeout(() => {
    isLoading.value = false
  }, 1200)

  if (import.meta.client) {
    intervalId = setInterval(addMockLog, 2000)
  }
})

onUnmounted(() => {
  clearInterval(intervalId)
})

const toggleLive = () => { isLive.value = !isLive.value }
const clearLogs = () => { logs.value = [] }

const viewLog = (log: any) => { selectedLog.value = log; showModal.value = true }
const closeModal = () => { showModal.value = false; selectedLog.value = undefined }
const handlePageChange = (page: number) => { currentPage.value = page }
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Service Logs</h1>
        <p class="text-sm text-gray-500 mt-1">System events, API calls, and error tracking</p>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">
        <button class="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download class="w-4 h-4" />
          <span>Export Logs</span>
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Server class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-gray-500">Last 24h</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">1.2M</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total Requests</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-red-50 rounded-lg text-red-600">
            <XCircle class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-red-600">+0.2%</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">0.05%</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Error Rate</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Activity class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-green-600">-12ms</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">45ms</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Avg Latency</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-green-50 rounded-lg text-green-600">
            <CheckCircle class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-green-600">Optimal</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">99.99%</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">System Uptime</p>
      </div>
    </div>

    <!-- Live Log Stream -->
    <div class="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col h-[600px]">
      <!-- Controls -->
      <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
           <div class="flex items-center space-x-2">
             <button 
               @click="toggleLive" 
               class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
               :class="isLive ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'"
             >
               <component :is="isLive ? Pause : Play" class="w-3.5 h-3.5" />
               <span>{{ isLive ? 'Live' : 'Paused' }}</span>
             </button>
             <button @click="clearLogs" class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Clear Logs">
               <Trash2 class="w-4 h-4" />
             </button>
           </div>
           <div class="hidden sm:block h-4 w-px bg-gray-200"></div>
           <div class="w-full sm:w-64">
             <SearchInput v-model="searchQuery" placeholder="Filter logs..." />
           </div>
        </div>
        
        <div class="flex items-center space-x-3 overflow-x-auto pb-2 sm:pb-0">
           <select v-model="timeFilter" class="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white py-1.5 px-3 text-gray-600">
             <option>Live</option>
             <option>Last 15m</option>
             <option>Last 1h</option>
             <option>Last 24h</option>
           </select>
           <FilterButton label="Level" />
           <FilterButton label="Service" />
        </div>
      </div>

      <!-- Live Tail View (Website Design) -->
      <div class="flex-1 overflow-x-auto overflow-y-auto bg-white p-0 relative" ref="logContainer">
         <div class="min-w-[800px]">
           <!-- Headers -->
           <div class="flex items-center space-x-4 border-b border-gray-100 px-6 py-3 sticky top-0 bg-gray-50 z-10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <span class="w-36 shrink-0">Timestamp</span>
              <span class="w-24 shrink-0">Service</span>
              <span class="w-24 shrink-0">Level</span>
              <span class="w-16 shrink-0">Stat</span>
              <span class="flex-1">Message</span>
              <span class="w-20 shrink-0 text-right">Duration</span>
           </div>

           <template v-if="isLoading">
              <div v-for="i in 8" :key="i" class="flex items-center space-x-4 px-6 py-3 border-b border-gray-50">
                 <div class="w-36 shrink-0"><Skeleton width="100px" height="14px" /></div>
                 <div class="w-24 shrink-0"><Skeleton width="60px" height="14px" /></div>
                 <div class="w-24 shrink-0"><Skeleton width="50px" height="20px" class="rounded-full" /></div>
                 <div class="w-16 shrink-0"><Skeleton width="30px" height="20px" class="rounded" /></div>
                 <div class="flex-1"><Skeleton width="80%" height="14px" /></div>
                 <div class="w-20 shrink-0 flex justify-end"><Skeleton width="40px" height="14px" /></div>
              </div>
           </template>

           <template v-else>
             <div v-if="filteredLogs.length === 0" class="text-gray-500 text-center py-10 italic">No logs available</div>
             <div v-for="log in paginatedLogs" :key="log.id" class="flex items-center space-x-4 px-6 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group" @click="viewLog(log)">
                <!-- Timestamp -->
                <div class="w-36 shrink-0">
                   <div class="text-sm font-medium text-gray-900">{{ log.timestamp.split(' ')[1] }}</div>
                   <div class="text-xs text-gray-400">{{ log.timestamp.split(' ')[0] }}</div>
                </div>
                
                <!-- Service -->
                <div class="w-24 shrink-0">
                   <span class="text-sm font-bold" :class="log.service === 'USSD' ? 'text-blue-600' : 'text-purple-600'">{{ log.service }}</span>
                </div>

                <!-- Level -->
                <div class="w-24 shrink-0">
                   <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="getLevelColor(log.level)">
                      <component :is="getLevelIcon(log.level)" class="w-3 h-3 mr-1.5" />
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
                   <p class="text-sm text-gray-600 truncate group-hover:text-gray-900 transition-colors">{{ log.message }}</p>
                </div>

                <!-- Duration -->
                <div class="w-20 shrink-0 text-right">
                   <span class="text-sm text-gray-500 font-mono">{{ log.duration }}</span>
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
      :is-collapsed="isCollapsed" 
      @close="closeModal" 
    />
  </div>
</template>