<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useState } from '#imports'
import SearchInput from '~/components/ui/SearchInput.vue'
import Pagination from '~/components/ui/Pagination.vue'
import FilterButton from '~/components/ui/FilterButton.vue'
import Spinner from '~/components/ui/Spinner.vue'
import { useDirectoryStore } from '~/stores/directory'
import { useToast } from '~/composables/useToast'
import type { Directory } from '~/types/api'
import { formatDistanceToNow } from 'date-fns'
import { 
  Users, 
  Download, 
  MoreVertical, 
  Ban, 
  CheckCircle,
  Smartphone,
  Globe,
  Trash2,
  Eye,
  UserX,
  X
} from 'lucide-vue-next'

export interface MappedMerchant {
  id: string
  merchantId: string
  name: string
  ussdCode: string
  status: string
  level: string
  type: string
  lastActive: string
  reference: boolean
  traffic: string
  menu?: string[] | null
  region?: string
}

const directoryStore = useDirectoryStore()

onMounted(() => {
  directoryStore.fetchDirectories()
})

const mappedSubscribers = computed<MappedMerchant[]>(() => {
  return directoryStore.directories.map(dir => ({
    id: dir.id,
    merchantId: dir.merchantCode,
    name: dir.merchantName || dir.createdBy?.fullName || 'Unknown',
    ussdCode: dir.ussdCode,
    status: dir.status === 'Active' ? 'Active' : dir.status === 'Inactive' ? 'Inactive' : dir.status === 'Suspended' ? 'Suspended' : 'Unknown',
    level: dir.level === 'PRIMARY' ? 'Primary' : dir.level === 'SECONDARY' ? 'Secondary' : dir.level,
    type: dir.menuConfig?.metadata?.name || 'Standard Flow',
    lastActive: dir.updatedAt ? formatDistanceToNow(new Date(dir.updatedAt), { addSuffix: true }) : 'Unknown',
    reference: dir.parentDirectoryId !== null,
    traffic: '0',
    menu: null,
    region: 'N/A'
  }))
})

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showModal = ref(false)
const selectedMerchant = ref<MappedMerchant | null>(null)

const filteredSubscribers = computed(() => {
  if (!searchQuery.value) return mappedSubscribers.value
  const query = searchQuery.value.toLowerCase()
  return mappedSubscribers.value.filter(sub => 
    sub.name.toLowerCase().includes(query) || 
    sub.ussdCode.toLowerCase().includes(query) ||
    sub.merchantId.toLowerCase().includes(query)
  )
})

const paginatedSubscribers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSubscribers.value.slice(start, end)
})

const closeModal = () => {
  showModal.value = false
  selectedMerchant.value = null
}

const isCollapsed = useState('sidebarCollapsed', () => false)

const viewMerchant = (merchant: MappedMerchant) => {
  selectedMerchant.value = merchant
  showModal.value = true
  activeMenuId.value = null // Close dropdown
}

const activeMenuId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const merchantToDelete = ref<MappedMerchant | null>(null)
const isDeleting = ref(false)

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const toggleMenu = (id: string) => {
  if (activeMenuId.value === id) {
    activeMenuId.value = null
  } else {
    activeMenuId.value = id
  }
}

// Close menu when clicking outside
const closeMenu = () => {
  activeMenuId.value = null
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800 border-green-200'
    case 'Blocked': return 'bg-red-100 text-red-800 border-red-200'
    case 'Suspended': return 'bg-amber-100 text-amber-800 border-amber-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getNetworkBadge = (network: string) => {
  switch (network) {
    case 'MTN': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'Telecel': return 'bg-red-50 text-red-700 border-red-100'
    case 'AT': return 'bg-vibes-50 text-vibes-700 border-blue-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

const confirmUnsubscribe = (merchant: MappedMerchant) => {
  merchantToDelete.value = merchant
  showDeleteConfirm.value = true
  activeMenuId.value = null // Close dropdown
}

const cancelUnsubscribe = () => {
  showDeleteConfirm.value = false
  merchantToDelete.value = null
}

const unsubscribeMerchant = async () => {
  if (!merchantToDelete.value) return
  
  isDeleting.value = true
  const toast = useToast()
  const merchantId = merchantToDelete.value.id
  const merchantName = merchantToDelete.value.name
  
  try {
    const result = await directoryStore.deleteDirectory(merchantId)
    
    if (result.success) {
      toast.success(`${merchantName} unsubscribed successfully`)
      showDeleteConfirm.value = false
      merchantToDelete.value = null
      
      // Close modal if it's open for the deleted merchant
      if (selectedMerchant.value?.id === merchantId) {
        closeModal()
      }
    } else {
      toast.error(result.message || 'Failed to unsubscribe merchant')
    }
  } catch (error: any) {
    const errorMessage = error.response?._data?.message || error.message || 'Failed to unsubscribe merchant'
    toast.error(errorMessage)
  } finally {
    isDeleting.value = false
  }
}

const unsubscribeFromModal = () => {
  if (selectedMerchant.value) {
    confirmUnsubscribe(selectedMerchant.value)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Merchants</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and monitor B2B merchant base</p>
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
            <div class="p-3 bg-vibes-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Users class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">+12%</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">2,450</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Total Merchants</p>
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
            <span class="text-xs font-bold px-2.5 py-1 text-white bg-white/20 backdrop-blur-md rounded-full border border-white/20 shadow-sm">95%</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">2,320</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Active Merchants</p>
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
              <Ban class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">+1</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">12</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Blocked/Suspended</p>
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
              <UserX class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">+2</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">45</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Unallocated</p>
        </div>
      </div>
    </div>

    <!-- Subscribers Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden">
      <!-- Controls -->
      <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:w-96">
          <SearchInput v-model="searchQuery" placeholder="Search by name, MSISDN, or ID..." />
        </div>
        
        <div class="flex items-center space-x-3">
          <FilterButton label="Filter" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="px-6 py-4">Merchant</th>
              <th class="px-6 py-4">USSD Code</th>
              <th class="px-6 py-4">Level</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Last Active</th>
              <th class="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <tr v-if="directoryStore.isLoading">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                <Spinner size="md" color="primary" class="mx-auto" />
                <p class="mt-2 text-sm">Loading merchants...</p>
              </td>
            </tr>
            <tr v-else-if="filteredSubscribers.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                <p class="text-sm">No merchants found.</p>
              </td>
            </tr>
            <tr v-else v-for="sub in paginatedSubscribers" :key="sub.id" class="hover:bg-vibes-50/30 dark:hover:bg-gray-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold mr-3">
                    {{ sub.name.split(' ').map((n: string) => n[0]).join('') }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ sub.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-vibes-50 dark:bg-vibes-900/30 text-vibes-700 dark:text-vibes-400 border border-blue-100 dark:border-blue-800 font-mono">
                  {{ sub.ussdCode }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {{ sub.level }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ sub.type }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="getStatusColor(sub.status)">
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="{
                    'bg-green-500': sub.status === 'Active',
                    'bg-red-500': sub.status === 'Blocked',
                    'bg-amber-500': sub.status === 'Suspended'
                  }"></span>
                  {{ sub.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                {{ sub.lastActive }}
              </td>
              <td class="px-6 py-4 text-right relative">
                <button 
                  @click="toggleMenu(sub.id)"
                  class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <MoreVertical class="w-4 h-4" />
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                  v-if="activeMenuId === sub.id" 
                  class="absolute right-0 top-8 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-10 py-1"
                >
                  <button 
                    @click="viewMerchant(sub)"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center"
                  >
                    <Eye class="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                    View Details
                  </button>
                  <button 
                    @click="confirmUnsubscribe(sub)"
                    class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center"
                  >
                    <Trash2 class="w-4 h-4 mr-2" />
                    Unsubscribe
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pagination 
        :current-page="currentPage" 
        :total-items="filteredSubscribers.length" 
        :items-per-page="itemsPerPage"
        @page-change="handlePageChange"
        @update:itemsPerPage="itemsPerPage = $event"
      />
    </div>

    <!-- Merchant Details Modal -->
    <div 
      v-if="showModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Modal Header -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Merchant Details</h3>
          <button @click="closeModal" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6 overflow-y-auto" v-if="selectedMerchant">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-full bg-vibes-100 dark:bg-vibes-900/50 flex items-center justify-center text-vibes-600 dark:text-vibes-400 text-lg font-bold mr-4">
                {{ selectedMerchant.name.split(' ').map(n => n[0]).join('') }}
              </div>
              <div>
                <p class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ selectedMerchant.name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 font-mono">{{ selectedMerchant.merchantId }}</p>
              </div>
            </div>
             <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                :class="getStatusColor(selectedMerchant.status)"
              >
                {{ selectedMerchant.status }}
              </span>
          </div>

          <div class="grid grid-cols-2 gap-4">
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">USSD Code</p>
              <p class="font-mono text-sm font-medium text-vibes-600 dark:text-vibes-400">{{ selectedMerchant.ussdCode }}</p>
            </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Level</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedMerchant.level }}</p>
            </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedMerchant.type }}</p>
            </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Active</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedMerchant.lastActive }}</p>
            </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference</p>
              <span 
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                :class="selectedMerchant.reference ? 'bg-vibes-50 dark:bg-vibes-900/30 text-vibes-700 dark:text-vibes-400 border-blue-100 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'"
              >
                {{ selectedMerchant.reference ? 'True' : 'False' }}
              </span>
            </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Traffic</p>
              <p class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ selectedMerchant.traffic }}</p>
            </div>
          </div>

          <div v-if="selectedMerchant.type === 'Menu' && selectedMerchant.menu">
             <h4 class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-3">USSD Menu</h4>
             <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
               <ul class="space-y-2">
                 <li v-for="(item, index) in selectedMerchant.menu" :key="index" class="flex items-center text-sm text-gray-700 dark:text-gray-300">
                   <span class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 mr-3">{{ index + 1 }}</span>
                   {{ item }}
                 </li>
               </ul>
             </div>
          </div>

          <div>
             <h4 class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-3">Additional Info</h4>
             <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
               <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600 dark:text-gray-400">Region</span>
                 <div class="flex items-center">
                   <Globe class="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                   <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ selectedMerchant.region || 'N/A' }}</span>
                 </div>
               </div>
               <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600 dark:text-gray-400">Merchant ID</span>
                 <span class="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">{{ selectedMerchant.id }}</span>
               </div>
             </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="closeModal" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Close</button>
          <button 
            @click="unsubscribeFromModal"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center"
          >
            <Trash2 class="w-4 h-4 mr-2" />
            Unsubscribe
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteConfirm" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <!-- Modal Header -->
        <div class="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/50">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mr-3">
              <Trash2 class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Confirm Unsubscribe</h3>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6" v-if="merchantToDelete">
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to unsubscribe <span class="font-bold">{{ merchantToDelete.name }}</span>?
          </p>
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4">
            <p class="text-sm text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> This action will remove the merchant's USSD code allocation and cannot be undone.
            </p>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button 
            @click="cancelUnsubscribe"
            :disabled="isDeleting"
            class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            @click="unsubscribeMerchant"
            :disabled="isDeleting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 v-if="!isDeleting" class="w-4 h-4 mr-2" />
            <Spinner v-else size="sm" color="white" class="mr-2" />
            {{ isDeleting ? 'Unsubscribing...' : 'Yes, Unsubscribe' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
