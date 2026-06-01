<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import {
  Trash2,
  Download,
  Scroll,
  Bug,
  Info,
  AlertTriangle,
  XCircle,
  Search,
  ChevronDown,
  ChevronRight,
  Pause,
  Play,
  Terminal
} from 'lucide-vue-next'
import type { LogEntry, LogLevel } from '~/composables/useLogger'
import type { LogCategory } from '~/stores/logger'

const store = useLoggerStore()
const logContainer = ref<HTMLElement | null>(null)
const expandedLogId = ref<string | null>(null)

const levelOptions: { value: LogLevel | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'text-gray-600 dark:text-gray-400' },
  { value: 'debug', label: 'Debug', color: 'text-gray-500 dark:text-gray-400' },
  { value: 'info', label: 'Info', color: 'text-blue-600 dark:text-blue-400' },
  { value: 'warn', label: 'Warn', color: 'text-amber-600 dark:text-amber-400' },
  { value: 'error', label: 'Error', color: 'text-red-600 dark:text-red-400' },
]

const categoryOptions = computed(() => [
  { value: 'all' as const, label: 'All Categories' },
  ...store.categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
])

const levelBadge = (level: LogLevel) => {
  switch (level) {
    case 'debug': return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    case 'info': return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    case 'warn': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    case 'error': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
  }
}

const levelIcon = (level: LogLevel) => {
  switch (level) {
    case 'debug': return Bug
    case 'info': return Info
    case 'warn': return AlertTriangle
    case 'error': return XCircle
  }
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    '.' + String(d.getMilliseconds()).padStart(3, '0')
}

const toggleExpand = (id: string) => {
  expandedLogId.value = expandedLogId.value === id ? null : id
}

const handleExport = () => {
  const blob = new Blob([store.exportLogs()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Auto-scroll to top when new logs arrive
watch(() => store.logs.length, async () => {
  if (store.isAutoScroll && logContainer.value) {
    await nextTick()
    logContainer.value.scrollTop = 0
  }
})

useHead({
  title: 'Logger — USSD Admin'
})
</script>

<template>
  <div class="h-[calc(100vh-4rem)] flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-vibes-50 dark:bg-vibes-900/30 flex items-center justify-center">
            <Terminal class="w-5 h-5 text-vibes-600 dark:text-vibes-400" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">Application Logger</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ store.logs.length }} entries ·
              <span class="text-red-500">{{ store.stats.error }} errors</span> ·
              <span class="text-amber-500">{{ store.stats.warn }} warnings</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="store.toggleAutoScroll()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="store.isAutoScroll
              ? 'bg-vibes-50 dark:bg-vibes-900/30 text-vibes-600 dark:text-vibes-400'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
            :title="store.isAutoScroll ? 'Auto-scroll on' : 'Auto-scroll off'"
          >
            <component :is="store.isAutoScroll ? Play : Pause" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ store.isAutoScroll ? 'Live' : 'Paused' }}</span>
          </button>
          <button
            @click="handleExport"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Download class="w-4 h-4" />
            <span class="hidden sm:inline">Export</span>
          </button>
          <button
            @click="store.clearLogs()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 class="w-4 h-4" />
            <span class="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[200px] max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            v-model="store.searchQuery"
            type="text"
            placeholder="Search logs..."
            class="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-vibes-500/20 focus:border-vibes-500"
          />
        </div>

        <select
          v-model="store.filterLevel"
          class="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-vibes-500/20 focus:border-vibes-500"
        >
          <option v-for="opt in levelOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select
          v-model="store.filterCategory"
          class="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-vibes-500/20 focus:border-vibes-500"
        >
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Log List -->
    <div
      ref="logContainer"
      class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 custom-scrollbar"
    >
      <div v-if="store.filteredLogs.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
        <Scroll class="w-12 h-12 mb-3 opacity-50" />
        <p class="text-sm">No logs match your filters</p>
      </div>

      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="log in store.filteredLogs"
          :key="log.id"
          class="group hover:bg-white dark:hover:bg-gray-900 transition-colors"
        >
          <div
            class="flex items-start gap-3 px-4 py-2.5 cursor-pointer"
            @click="toggleExpand(log.id)"
          >
            <component
              :is="levelIcon(log.level)"
              class="w-4 h-4 mt-0.5 shrink-0"
              :class="{
                'text-gray-400': log.level === 'debug',
                'text-blue-500': log.level === 'info',
                'text-amber-500': log.level === 'warn',
                'text-red-500': log.level === 'error',
              }"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-mono text-gray-400 dark:text-gray-500 tabular-nums">{{ formatTime(log.timestamp) }}</span>
                <span class="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded border" :class="levelBadge(log.level)">
                  {{ log.level }}
                </span>
                <span class="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {{ log.category }}
                </span>
                <span class="text-sm text-gray-700 dark:text-gray-300 truncate">{{ log.message }}</span>
              </div>
            </div>
            <component
              :is="expandedLogId === log.id ? ChevronDown : ChevronRight"
              class="w-4 h-4 text-gray-400 shrink-0 mt-0.5"
            />
          </div>

          <!-- Expanded Details -->
          <div
            v-if="expandedLogId === log.id"
            class="px-4 pb-3 pl-11"
          >
            <div v-if="log.metadata && Object.keys(log.metadata).length > 0" class="mb-2">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-1">Metadata</p>
              <pre class="text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono">{{ JSON.stringify(log.metadata, null, 2) }}</pre>
            </div>
            <div v-if="log.error">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-500 mb-1">Error</p>
              <pre class="text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-3 overflow-x-auto text-red-700 dark:text-red-300 font-mono">{{ log.error.stack || log.error.message }}</pre>
            </div>
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
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 20px;
}
:deep(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
