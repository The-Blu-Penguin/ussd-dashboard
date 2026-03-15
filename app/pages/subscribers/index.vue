<script setup lang="ts">
import { ref } from 'vue'
import { useState } from '#imports'
import SearchInput from '~/components/ui/SearchInput.vue'
import Pagination from '~/components/ui/Pagination.vue'
import FilterButton from '~/components/ui/FilterButton.vue'
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

const subscribers = ref([
  { id: 'MER-001', msisdn: '+233541234567', name: 'Kofi Electronics', ussdCode: '*920*10#', status: 'Active', level: 'Primary', type: 'Basic', lastActive: '2 mins ago', reference: true, menu: null },
  { id: 'MER-002', msisdn: '+233209876543', name: 'Ama Provisions', ussdCode: '*920*11#', status: 'Active', level: 'Secondary', type: 'Menu', lastActive: '1 hour ago', reference: false, menu: ['Check Balance', 'Buy Airtime', 'Pay Bills'] },
  { id: 'MER-003', msisdn: '+233555555555', name: 'Tech Solutions', ussdCode: '*920*12#', status: 'Blocked', level: 'Primary', type: 'API', lastActive: '2 days ago', reference: true, menu: null },
  { id: 'MER-004', msisdn: '+233244444444', name: 'Accra Mall Pharmacy', ussdCode: '*920*13#', status: 'Active', level: 'Primary', type: 'Menu', lastActive: '5 mins ago', reference: false, menu: ['Order Drugs', 'Consultation', 'Emergency'] },
  { id: 'MER-005', msisdn: '+233277777777', name: 'Kumasi Motors', ussdCode: '*920*14#', status: 'Suspended', level: 'Secondary', type: 'Basic', lastActive: '1 week ago', reference: true, menu: null },
  { id: 'MER-006', msisdn: '+233266666666', name: 'Cape Coast Textiles', ussdCode: '*920*15#', status: 'Active', level: 'Secondary', type: 'Menu', lastActive: '10 mins ago', reference: false, menu: ['New Arrivals', 'Discounts', 'Locations'] },
  { id: 'MER-007', msisdn: '+233500000000', name: 'Volta Grains', ussdCode: '*920*16#', status: 'Active', level: 'Primary', type: 'API', lastActive: 'Just now', reference: true, menu: null },
])

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showModal = ref(false)
const selectedMerchant = ref(null)

const closeModal = () => {
  showModal.value = false
  selectedMerchant.value = null
}

const isCollapsed = useState('sidebarCollapsed', () => false)

const viewMerchant = (merchant) => {
  selectedMerchant.value = merchant
  showModal.value = true
  activeMenuId.value = null // Close dropdown
}

const activeMenuId = ref(null)

const handlePageChange = (page) => {
  currentPage.value = page
}

const toggleMenu = (id: string | number) => {
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

const getStatusColor = (status) => {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800 border-green-200'
    case 'Blocked': return 'bg-red-100 text-red-800 border-red-200'
    case 'Suspended': return 'bg-amber-100 text-amber-800 border-amber-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getNetworkBadge = (network) => {
  switch (network) {
    case 'MTN': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'Telecel': return 'bg-red-50 text-red-700 border-red-100'
    case 'AT': return 'bg-blue-50 text-blue-700 border-blue-100'
    default: return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Merchants</h1>
        <p class="text-sm text-gray-500 mt-1">Manage and monitor B2B merchant base</p>
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
            <Users class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">2,450</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total Merchants</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-green-50 rounded-lg text-green-600">
            <CheckCircle class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-gray-500">95%</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">2,320</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Active Merchants</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-red-50 rounded-lg text-red-600">
            <Ban class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-red-600">+1</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">12</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Blocked/Suspended</p>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <UserX class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-purple-600">+2</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-800">45</h3>
        <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Unsubscribed</p>
      </div>
    </div>

    <!-- Subscribers Table -->
    <div class="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <!-- Controls -->
      <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <tr class="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-4">Merchant</th>
              <th class="px-6 py-4">USSD Code</th>
              <th class="px-6 py-4">Level</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Last Active</th>
              <th class="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="sub in subscribers" :key="sub.id" class="hover:bg-blue-50/30 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold mr-3">
                    {{ sub.name.split(' ').map(n => n[0]).join('') }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ sub.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 font-mono">
                  {{ sub.ussdCode }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {{ sub.level }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600">{{ sub.type }}</span>
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
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ sub.lastActive }}
              </td>
              <td class="px-6 py-4 text-right relative">
                <button 
                  @click="toggleMenu(sub.id)"
                  class="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical class="w-4 h-4" />
                </button>
                
                <!-- Dropdown Menu -->
                <div 
                  v-if="activeMenuId === sub.id" 
                  class="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1"
                >
                  <button 
                    @click="viewMerchant(sub)"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Eye class="w-4 h-4 mr-2 text-gray-400" />
                    View Details
                  </button>
                  <button class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
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
        :total-items="subscribers.length" 
        :items-per-page="itemsPerPage"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Merchant Details Modal -->
    <div 
      v-if="showModal" 
      class="fixed bottom-0 top-16 right-0 z-40 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'left-20' : 'left-64'"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
        <!-- Modal Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">Merchant Details</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6" v-if="selectedMerchant">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-bold mr-4">
                {{ selectedMerchant.name.split(' ').map(n => n[0]).join('') }}
              </div>
              <div>
                <p class="text-lg font-bold text-gray-900">{{ selectedMerchant.name }}</p>
                <p class="text-sm text-gray-500 font-mono">{{ selectedMerchant.msisdn }}</p>
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
             <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">USSD Code</p>
              <p class="font-mono text-sm font-medium text-blue-600">{{ selectedMerchant.ussdCode }}</p>
            </div>
             <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Level</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedMerchant.level }}</p>
            </div>
             <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Type</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedMerchant.type }}</p>
            </div>
             <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Last Active</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedMerchant.lastActive }}</p>
            </div>
             <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Reference</p>
              <span 
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                :class="selectedMerchant.reference ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-50 text-gray-600 border-gray-200'"
              >
                {{ selectedMerchant.reference ? 'True' : 'False' }}
              </span>
            </div>
          </div>

          <div v-if="selectedMerchant.type === 'Menu' && selectedMerchant.menu">
             <h4 class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">USSD Menu</h4>
             <div class="bg-white border border-gray-200 rounded-xl p-4">
               <ul class="space-y-2">
                 <li v-for="(item, index) in selectedMerchant.menu" :key="index" class="flex items-center text-sm text-gray-700">
                   <span class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3">{{ index + 1 }}</span>
                   {{ item }}
                 </li>
               </ul>
             </div>
          </div>

          <div>
             <h4 class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Additional Info</h4>
             <div class="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
               <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600">Region</span>
                 <div class="flex items-center">
                   <Globe class="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                   <span class="text-sm font-medium text-gray-900">{{ selectedMerchant.region }}</span>
                 </div>
               </div>
               <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600">Merchant ID</span>
                 <span class="text-sm font-medium text-gray-900 font-mono">{{ selectedMerchant.id }}</span>
               </div>
             </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
          <button @click="closeModal" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
          <button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center">
            <Trash2 class="w-4 h-4 mr-2" />
            Unsubscribe
          </button>
        </div>
      </div>
    </div>
  </div>
</template>