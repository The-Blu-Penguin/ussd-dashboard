<script setup>
import { ref, computed } from 'vue'
import SearchInput from '~/components/ui/SearchInput.vue'
import Pagination from '~/components/ui/Pagination.vue'
import FilterButton from '~/components/ui/FilterButton.vue'
import { 
  Activity, 
  RefreshCw, 
  Smartphone, 
  Clock, 
  AlertCircle, 
  Eye, 
  Download,
  Signal,
  Wifi,
  X
} from 'lucide-vue-next'

const sessions = ref([
  { id: 'SES-839201', msisdn: '+233541234567', code: '*123#', startTime: '10:42:15 AM', duration: '45s', status: 'Active', step: 'Main Menu', network: 'MTN', device: 'Android' },
  { id: 'SES-839202', msisdn: '+233209876543', code: '*141#', startTime: '10:42:30 AM', duration: '30s', status: 'Active', step: 'Select Bundle', network: 'Telecel', device: 'iOS' },
  { id: 'SES-839203', msisdn: '+233555555555', code: '*999#', startTime: '10:41:00 AM', duration: '2m 15s', status: 'Stalled', step: 'Payment', network: 'AT', device: 'Feature Phone' },
  { id: 'SES-839204', msisdn: '+233244444444', code: '*123#', startTime: '10:42:55 AM', duration: '5s', status: 'Active', step: 'Main Menu', network: 'MTN', device: 'Android' },
  { id: 'SES-839205', msisdn: '+233277777777', code: '*134*2#', startTime: '10:40:10 AM', duration: '3m 05s', status: 'Active', step: 'Confirmation', network: 'MTN', device: 'Android' },
  { id: 'SES-839206', msisdn: '+233266666666', code: '*170#', startTime: '10:43:10 AM', duration: '10s', status: 'Active', step: 'Pin Entry', network: 'AT', device: 'iOS' },
  { id: 'SES-839207', msisdn: '+233500000000', code: '*123#', startTime: '10:43:05 AM', duration: '15s', status: 'Active', step: 'Main Menu', network: 'Telecel', device: 'Feature Phone' },
])

const showModal = ref(false)
const selectedSession = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)

const viewSession = (session) => {
  selectedSession.value = session
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSession.value = null
}

const refreshSessions = () => {
  // Logic to refresh data
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const getSignalColor = (signal) => {
  switch (signal) {
    case 'Strong': return 'text-green-500'
    case 'Good': return 'text-blue-500'
    case 'Moderate': return 'text-yellow-500'
    case 'Weak': return 'text-red-500'
    default: return 'text-gray-400'
  }
}
</script>

<template>
  <div class="space-y-6 relative">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Live Sessions</h1>
        <p class="text-sm text-gray-500 mt-1">Real-time monitoring of USSD interactions across networks</p>
      </div>
      <div class="flex items-center space-x-3">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <Activity class="w-3.5 h-3.5 mr-1.5 animate-pulse" />
          {{ sessions.length }} Active
        </span>
        <button @click="refreshSessions" class="p-2 hover:bg-white bg-gray-50 border border-gray-200 rounded-lg text-gray-600 transition-colors shadow-sm">
          <RefreshCw class="w-4 h-4" />
        </button>
        <button class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download class="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>
    </div>

    <!-- Enhanced Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-32">
        <div class="flex items-start justify-between">
          <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Smartphone class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-800">{{ sessions.length }}</h3>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total Active Sessions</p>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-32">
        <div class="flex items-start justify-between">
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Clock class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-gray-500">Avg</span>
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-800">42s</h3>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Session Duration</p>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-32">
        <div class="flex items-start justify-between">
          <div class="p-2 bg-amber-50 rounded-lg text-amber-600">
            <AlertCircle class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">2 Critical</span>
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-800">1</h3>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Stalled Sessions</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-32">
        <div class="flex items-start justify-between">
          <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <Signal class="w-5 h-5" />
          </div>
          <span class="text-xs font-medium text-emerald-600">3 Networks</span>
        </div>
        <div>
          <h3 class="text-2xl font-bold text-gray-800">MTN</h3>
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Top Network</p>
        </div>
      </div>
    </div>

    <!-- Active Sessions Table -->
    <div class="bg-white rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <!-- Table Header & Controls -->
      <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center space-x-2">
          <h2 class="font-bold text-gray-800">Current Activity</h2>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{{ sessions.length }}</span>
        </div>
        
        <div class="flex items-center space-x-3">
          <div class="relative w-64">
            <SearchInput v-model="searchQuery" placeholder="Search session ID, MSISDN..." />
          </div>
          <FilterButton label="Filter" />
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-4">Session Details</th>
              <th class="px-6 py-4">Network</th>
              <th class="px-6 py-4">Service Code</th>
              <th class="px-6 py-4">Current Step</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="session in sessions" :key="session.id" class="hover:bg-blue-50/30 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{ session.id }}</span>
                  <span class="text-xs text-gray-500 font-mono mt-0.5">{{ session.msisdn }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-700 font-medium">{{ session.network }}</span>
                    <div class="flex items-center mt-0.5">
                      <Smartphone class="w-3 h-3 text-gray-400 mr-1" />
                      <span class="text-xs text-gray-500">{{ session.device }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-blue-700 font-mono font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">{{ session.code }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-700 font-medium">{{ session.step }}</span>
                  <span class="text-xs text-gray-400 mt-0.5">{{ session.duration }} elapsed</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="session.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="session.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'"></span>
                  {{ session.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="viewSession(session)"
                  class="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all group-hover:text-blue-500" 
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
        :total-items="sessions.length" 
        :items-per-page="10"
        @page-change="handlePageChange"
      />
    </div>

    <!-- View Session Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all">
        <!-- Modal Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">Session Details</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6" v-if="selectedSession">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wider font-bold">Session ID</p>
              <p class="text-lg font-bold text-gray-900">{{ selectedSession.id }}</p>
            </div>
             <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                :class="selectedSession.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
              >
                {{ selectedSession.status }}
              </span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">MSISDN</p>
              <p class="font-mono text-sm font-medium text-gray-800">{{ selectedSession.msisdn }}</p>
            </div>
             <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Service Code</p>
              <p class="font-mono text-sm font-medium text-blue-600">{{ selectedSession.code }}</p>
            </div>
             <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Start Time</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedSession.startTime }}</p>
            </div>
             <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p class="text-xs text-gray-500 mb-1">Duration</p>
              <p class="text-sm font-medium text-gray-800">{{ selectedSession.duration }}</p>
            </div>
          </div>

          <div>
             <h4 class="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Technical Details</h4>
             <div class="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
               <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600">Network Provider</span>
                 <span class="text-sm font-medium text-gray-900">{{ selectedSession.network }}</span>
               </div>
               <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600">Device Type</span>
                 <div class="flex items-center">
                   <Smartphone class="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                   <span class="text-sm font-medium text-gray-900">{{ selectedSession.device }}</span>
                 </div>
               </div>
                <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600">Current Step</span>
                 <span class="text-sm font-medium text-gray-900">{{ selectedSession.step }}</span>
               </div>
             </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
          <button @click="closeModal" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
          <button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">Terminate Session</button>
        </div>
      </div>
    </div>
  </div>
</template>