<script setup lang="ts">
import { ref, computed } from 'vue'
import { useState } from '#imports'
import { useMockData } from '~/composables/useMockData'
import { getStatusColor, getStatusIcon } from '~/utils/statusHelpers'
import SearchInput from '~/components/ui/SearchInput.vue'
import Pagination from '~/components/ui/Pagination.vue'
import FilterButton from '~/components/ui/FilterButton.vue'
import TransactionDetailsModal from '~/components/transactions/TransactionDetailsModal.vue'
import { 
  FileText, Download, CheckCircle, XCircle, Clock, AlertCircle, Eye, ArrowUpRight
} from 'lucide-vue-next'

const { initialTransactions } = useMockData()
const transactions = ref([...initialTransactions])

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showModal = ref(false)
const selectedTxn = ref<Record<string, any> | undefined>(undefined)
const isCollapsed = useState('sidebarCollapsed', () => false)

const filteredTransactions = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return transactions.value
  return transactions.value.filter(t =>
    t.id.toLowerCase().includes(q) ||
    t.merchant.toLowerCase().includes(q) ||
    t.msisdn.toLowerCase().includes(q) ||
    t.type.toLowerCase().includes(q)
  )
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTransactions.value.slice(start, start + itemsPerPage)
})

const viewTxn = (txn: any) => { selectedTxn.value = txn; showModal.value = true }
const closeModal = () => { showModal.value = false; selectedTxn.value = undefined }
const handlePageChange = (page: number) => { currentPage.value = page }
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Transaction Logs</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Real-time record of all USSD transactions</p>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">
        <button class="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download class="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <!-- Texture Pattern Overlay -->
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-blue-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <FileText class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">+8%</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">14,205</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Total Transactions</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <!-- Texture Pattern Overlay -->
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-emerald-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <CheckCircle class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 text-white bg-white/20 backdrop-blur-md rounded-full border border-white/20 shadow-sm">98.2%</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">13,950</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Successful</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <!-- Texture Pattern Overlay -->
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-red-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <XCircle class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">+0.5%</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">255</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Failed</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <!-- Texture Pattern Overlay -->
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-purple-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <ArrowUpRight class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">+15%</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">GHS 45.2k</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Total Volume</p>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden">
      <!-- Controls -->
      <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:w-96">
          <SearchInput v-model="searchQuery" placeholder="Search by ID, MSISDN, or Merchant..." />
        </div>
        
        <div class="flex items-center space-x-3">
          <FilterButton label="Filter" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="px-6 py-4">Transaction ID</th>
              <th class="px-6 py-4">Date & Time</th>
              <th class="px-6 py-4">Merchant</th>
              <th class="px-6 py-4">MSISDN</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Amount</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <tr v-for="txn in paginatedTransactions" :key="txn.id" class="hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors group">
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{{ txn.id }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600 dark:text-gray-300">{{ txn.date.split(' ')[0] }}</div>
                <div class="text-xs text-gray-400 dark:text-gray-500">{{ txn.date.split(' ')[1] }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ txn.merchant }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600 dark:text-gray-300 font-mono">{{ txn.msisdn }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {{ txn.type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ txn.amount }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="getStatusColor(txn.status)">
                  <component :is="getStatusIcon(txn.status)" class="w-3 h-3 mr-1.5" />
                  {{ txn.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="viewTxn(txn)"
                  class="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  title="View Details"
                >
                  <Eye class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination 
        :current-page="currentPage" 
        :total-items="filteredTransactions.length" 
        :items-per-page="itemsPerPage"
        @page-change="handlePageChange"
      />
    </div>

    <TransactionDetailsModal
      :show="showModal"
      :txn="selectedTxn"
      :is-collapsed="isCollapsed"
      @close="closeModal"
    />
  </div>
</template>