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
const selectedTxn = ref(null)
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
const closeModal = () => { showModal.value = false; selectedTxn.value = null }
const handlePageChange = (page: number) => { currentPage.value = page }
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Transaction Logs</h1>
        <p class="text-sm text-gray-500 mt-1">Real-time record of all USSD transactions</p>
      </div>
      <div class="flex items-center space-x-3">
        <button class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download class="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
            <FileText class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+8%</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">14,205</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total Transactions</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-green-50 rounded-lg text-green-600">
            <CheckCircle class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-gray-500">98.2%</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">13,950</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Successful</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-red-50 rounded-lg text-red-600">
            <XCircle class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-red-600">+0.5%</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">255</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Failed</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <ArrowUpRight class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-purple-600">+15%</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">GHS 45.2k</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total Volume</p>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <!-- Controls -->
      <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <tr class="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
          <tbody class="divide-y divide-gray-50">
            <tr v-for="txn in paginatedTransactions" :key="txn.id" class="hover:bg-blue-50/30 transition-colors group">
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-gray-900 font-mono">{{ txn.id }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600">{{ txn.date.split(' ')[0] }}</div>
                <div class="text-xs text-gray-400">{{ txn.date.split(' ')[1] }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ txn.merchant }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600 font-mono">{{ txn.msisdn }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {{ txn.type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm font-bold text-gray-900">{{ txn.amount }}</span>
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
                  class="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
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