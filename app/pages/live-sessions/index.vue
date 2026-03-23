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
    case 'Good': return 'text-vibes-500'
    case 'Moderate': return 'text-yellow-500'
    case 'Weak': return 'text-red-500'
    default: return 'text-gray-400'
  }
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
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
          <Activity class="w-3.5 h-3.5 mr-1.5 animate-pulse" />
          {{ sessions.length }} Active
        </span>
        <button @click="refreshSessions" class="p-2 hover:bg-white dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors shadow-sm">
          <RefreshCw class="w-4 h-4" />
        </button>
        <button class="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-vibes-600 hover:bg-vibes-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download class="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>
    </div>

    <!-- Enhanced Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <!-- Texture Pattern Overlay -->
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>
        
        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-vibes-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Smartphone class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">+12%</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">{{ sessions.length }}</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Total Active Sessions</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <!-- Texture Pattern Overlay -->
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
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">42s</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Session Duration</p>
        </div>
      </div>
      
      <div class="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <!-- Texture Pattern Overlay -->
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-orange-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <AlertCircle class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">2 Critical</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">1</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Stalled Sessions</p>
        </div>
      </div>

      <div class="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-0 hover:-translate-y-0.5 transition-transform duration-300">
        <!-- Texture Pattern Overlay -->
        <div class="absolute inset-0 opacity-10 mix-blend-overlay" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 16px 16px;"></div>
        <div class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl"></div>
        <div class="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-black/10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-start justify-between mb-4">
            <div class="p-3 bg-emerald-100/20 backdrop-blur-sm rounded-lg text-white border border-white/10 shadow-inner">
              <Signal class="w-6 h-6" />
            </div>
            <span class="text-xs font-bold px-2.5 py-1 text-white bg-white/20 backdrop-blur-md rounded-full border border-white/20 shadow-sm">3 Networks</span>
          </div>
          <h3 class="text-3xl font-bold text-white mb-1 drop-shadow-sm">MTN</h3>
          <p class="text-sm text-white/90 font-medium tracking-wide">Top Network</p>
        </div>
      </div>
    </div>

    <!-- Active Sessions Table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-gray-700 overflow-hidden">
      <!-- Table Header & Controls -->
      <div class="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center space-x-2">
          <h2 class="font-bold text-gray-800 dark:text-gray-100">Current Activity</h2>
          <span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">{{ sessions.length }}</span>
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
              <th class="px-6 py-4">Current Step</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <tr v-for="session in sessions" :key="session.id" class="hover:bg-vibes-50/30 dark:hover:bg-gray-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ session.id }}</span>
                  <span class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{{ session.msisdn }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ session.network }}</span>
                    <div class="flex items-center mt-0.5">
                      <Smartphone class="w-3 h-3 text-gray-400 dark:text-gray-500 mr-1" />
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ session.device }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-vibes-700 dark:text-vibes-400 font-mono font-bold bg-vibes-50 dark:bg-vibes-900/30 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800">{{ session.code }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-700 dark:text-gray-300 font-medium">{{ session.step }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ session.duration }} elapsed</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="session.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="session.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'"></span>
                  {{ session.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button 
                  @click="viewSession(session)"
                  class="text-gray-400 hover:text-vibes-600 dark:hover:text-vibes-400 hover:bg-vibes-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-all group-hover:text-vibes-500 dark:group-hover:text-vibes-400" 
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
      
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700">
        <!-- Modal Header -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Session Details</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6" v-if="selectedSession">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Session ID</p>
              <p class="text-lg font-bold text-gray-900 dark:text-gray-100">{{ selectedSession.id }}</p>
            </div>
             <span 
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                :class="selectedSession.status === 'Active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'"
              >
                {{ selectedSession.status }}
              </span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">MSISDN</p>
              <p class="font-mono text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedSession.msisdn }}</p>
            </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Service Code</p>
              <p class="font-mono text-sm font-medium text-vibes-600 dark:text-vibes-400">{{ selectedSession.code }}</p>
            </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Start Time</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedSession.startTime }}</p>
            </div>
             <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Duration</p>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ selectedSession.duration }}</p>
            </div>
          </div>

          <div>
             <h4 class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-3">Technical Details</h4>
             <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
               <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600 dark:text-gray-400">Network Provider</span>
                 <span class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ selectedSession.network }}</span>
               </div>
               <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600 dark:text-gray-400">Device Type</span>
                 <div class="flex items-center">
                   <Smartphone class="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                   <span class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ selectedSession.device }}</span>
                 </div>
               </div>
                <div class="px-4 py-3 flex justify-between items-center">
                 <span class="text-sm text-gray-600 dark:text-gray-400">Current Step</span>
                 <span class="text-sm font-medium text-gray-900 dark:text-gray-200">{{ selectedSession.step }}</span>
               </div>
             </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="closeModal" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Close</button>
          <button class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">Terminate Session</button>
        </div>
      </div>
    </div>
  </div>
</template>
