<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMonitoringStore } from '~/stores/monitoring'
import { getLevelColor, getLevelIcon, getStatusCodeColor } from '~/utils/statusHelpers'
import SearchInput from '~/components/ui/SearchInput.vue'
import Shimmer from '~/components/ui/Shimmer.vue'
import LogDetailsModal from '~/components/logs/LogDetailsModal.vue'
import {
  FileText, AlertTriangle, Clock, CheckCircle, Eye, RefreshCw, Activity
} from 'lucide-vue-next'
import type { LogLevel } from '~/types/api'

const monitoringStore = useMonitoringStore()
const searchQuery = ref('')
const showModal = ref(false)
const selectedLog = ref<Record<string, any> | undefined>(undefined)
const isRefreshing = ref(false)

onMounted(() => {
  if (import.meta.client) {
    monitoringStore.connectLogs()
  }
})

// Disconnect the SSE stream when leaving the page to avoid background leaks
onUnmounted(() => {
  monitoringStore.disconnectLogs()
})

const refreshLogs = () => {
  isRefreshing.value = true
  monitoringStore.disconnectLogs()
  monitoringStore.clearEvents('logs')
  monitoringStore.logStats = null
  monitoringStore.connectLogs()
  setTimeout(() => { isRefreshing.value = false }, 800)
}

const filteredLogs = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return monitoringStore.logEvents
  return monitoringStore.logEvents.filter(l =>
    (l.service || '').toLowerCase().includes(q) ||
    (l.message || '').toLowerCase().includes(q) ||
    (l.level || '').toLowerCase().includes(q) ||
    String(l.statusCode || '').includes(q)
  )
})

const viewLog = (log: any) => { selectedLog.value = log; showModal.value = true }
const closeModal = () => { showModal.value = false; selectedLog.value = undefined }

// SSE delivers the level as a raw string (e.g. "INFO", "warn"); map it to the
// LogLevel union the status helpers expect.
const normalizeLogLevel = (level: string): LogLevel => {
  const map: Record<string, LogLevel> = {
    'INFO': 'Info',
    'INFORMATION': 'Info',
    'DEBUG': 'Info',
    'WARN': 'Warning',
    'WARNING': 'Warning',
    'ERROR': 'Error',
    'ERR': 'Error',
    'CRITICAL': 'Critical',
    'FATAL': 'Critical',
  }
  return map[(level || '').toUpperCase()] || 'Info'
}

const formatLatency = (ms: number) => {
  if (!ms && ms !== 0) return '-'
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${Math.round(ms)}ms`
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Service Logs</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time backend service health and request logs</p>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">
        <button
          @click="refreshLogs"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
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
              <Activity class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Live</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.totalRequests }}</h3>
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
              <AlertTriangle class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Errors</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.errorRate }}%</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Error Rate</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-purple-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Clock class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Latency</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ formatLatency(monitoringStore.avgLatency) }}</h3>
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
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">Health</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ monitoringStore.uptime }}%</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Uptime</p>
        </div>
      </div>
    </div>

    <!-- Connection Status Bar -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center space-x-3">
        <span
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
          :class="monitoringStore.connectionStatus.logs === 'connected' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : monitoringStore.connectionStatus.logs === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'"
        >
          <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="monitoringStore.connectionStatus.logs === 'connected' ? 'bg-green-500 animate-pulse' : monitoringStore.connectionStatus.logs === 'error' ? 'bg-red-500' : 'bg-amber-500'"></span>
          {{ monitoringStore.connectionStatus.logs }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ monitoringStore.logEvents.length }} events received</span>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden">
      <!-- Controls -->
      <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:w-96">
          <SearchInput v-model="searchQuery" placeholder="Search by service, message, level or status..." />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="px-6 py-4">Date &amp; Time</th>
              <th class="px-6 py-4">Service</th>
              <th class="px-6 py-4">Level</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Message</th>
              <th class="px-6 py-4">Duration</th>
              <th class="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <template v-if="isRefreshing">
              <tr v-for="i in 6" :key="i" class="border-b border-gray-50 dark:border-gray-700/50">
                <td class="px-6 py-4"><Shimmer width="120px" height="14px" /></td>
                <td class="px-6 py-4"><Shimmer width="100px" height="14px" /></td>
                <td class="px-6 py-4"><Shimmer width="70px" height="20px" class="rounded-full" /></td>
                <td class="px-6 py-4"><Shimmer width="50px" height="14px" /></td>
                <td class="px-6 py-4"><Shimmer width="180px" height="14px" /></td>
                <td class="px-6 py-4"><Shimmer width="60px" height="14px" /></td>
                <td class="px-6 py-4 text-right"><Shimmer width="30px" height="14px" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-if="monitoringStore.logEvents.length === 0">
                <td colspan="7" class="px-6 py-10 text-center text-gray-500 dark:text-gray-400 italic">
                  Waiting for service log events...
                </td>
              </tr>
              <tr v-for="log in filteredLogs" :key="log.timestamp + log.service + log.message" class="hover:bg-vibes-50/30 dark:hover:bg-gray-700/50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-600 dark:text-gray-300">{{ log.dateTime ? log.dateTime.split(' ')[0] : '-' }}</div>
                  <div class="text-xs text-gray-400 dark:text-gray-500">{{ log.dateTime ? log.dateTime.split(' ')[1] : '-' }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ log.service }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="getLevelColor(normalizeLogLevel(log.level))">
                    <component :is="getLevelIcon(normalizeLogLevel(log.level))" class="w-3 h-3 mr-1.5" />
                    {{ normalizeLogLevel(log.level) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-semibold px-2 py-0.5 rounded-md" :class="getStatusCodeColor(log.statusCode)">
                    {{ log.statusCode }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 max-w-xs">{{ log.message }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 dark:text-gray-300 font-mono">{{ formatLatency(log.durationMs) }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="viewLog(log)"
                    class="text-gray-400 dark:text-gray-500 hover:text-vibes-600 dark:hover:text-vibes-400 p-1.5 rounded-md hover:bg-vibes-50 dark:hover:bg-vibes-900/30 transition-colors"
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

    <LogDetailsModal
      :show="showModal"
      :log="selectedLog"
      :is-collapsed="false"
      @close="closeModal"
    />
  </div>
</template>
