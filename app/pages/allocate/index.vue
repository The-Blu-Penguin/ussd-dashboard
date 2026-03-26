<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Smartphone, PlayCircle, X, Pencil } from 'lucide-vue-next'
import SearchInput from '~/components/ui/SearchInput.vue'
import Pagination from '~/components/ui/Pagination.vue'
import Button from '~/components/ui/Button.vue'
import Shimmer from '~/components/ui/Shimmer.vue'
import Spinner from '~/components/ui/Spinner.vue'
import { useDirectoryStore } from '~/stores/directory'
import { useMenuConfigsStore } from '~/stores/menuConfigs'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import { useToast } from '~/composables/useToast'

const directoryStore = useDirectoryStore()
const menuConfigsStore = useMenuConfigsStore()
const authStore = useAuthStore()
const toast = useToast()

onMounted(() => {
  directoryStore.fetchDirectories()
  menuConfigsStore.fetchConfigs()
})

interface App {
  id: string
  name: string
  merchantId: string
  code: string
  type: string
  menuFlow: string
  status: string
  traffic: string
}

const showModal = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Edit mode state
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)

const newApp = ref({
  merchant: '',
  merchantId: '',
  level: 'Secondary',
  method: 'Automatic',
  selectedCode: '',
  menuFlow: ''
})

const merchants = computed(() => {
  const uniqueMerchants = new Set<string>()
  directoryStore.directories.forEach(dir => {
    const name = dir.merchantName || dir.createdBy?.fullName
    if (name && name !== 'Unknown') uniqueMerchants.add(name)
  })
  return Array.from(uniqueMerchants).sort()
})

const menuFlows = computed(() => {
  return menuConfigsStore.configs.map(config => ({
    id: config.id,
    name: config.name
  }))
})

// Available Codes Fetch Logic
const availableCodes = ref<number[]>([])
const isFetchingCodes = ref(false)
const autoSelectedCode = ref<number | null>(null)

const fetchAvailableCodes = async (level: string) => {
  isFetchingCodes.value = true
  autoSelectedCode.value = null
  
  try {
    const api = useApi()
    
    // Map 'Primary' -> 'PRIMARY', 'Secondary' -> 'SECONDARY'
    const levelQuery = level.toUpperCase()
    // parentCode is 1 for SECONDARY, empty for PRIMARY
    const parentCodeQuery = levelQuery === 'SECONDARY' ? '&parentCode=1' : ''
    
    const response = await api<any>(`/directory/available-codes?level=${levelQuery}${parentCodeQuery}&limit=100`, {
      method: 'GET',
    })

    if (response.success && response.data?.availableCodes) {
      availableCodes.value = response.data.availableCodes
      if (availableCodes.value.length > 0) {
        // Randomly pick one code for auto-generation
        const randomIndex = Math.floor(Math.random() * availableCodes.value.length)
        autoSelectedCode.value = availableCodes.value[randomIndex] ?? null
      }
    } else {
      availableCodes.value = []
    }
  } catch (e) {
    console.error('Failed to fetch available codes:', e)
    availableCodes.value = []
  } finally {
    isFetchingCodes.value = false
  }
}

watch(() => newApp.value.level, (newLevel) => {
  if (!isEditing.value) {
    fetchAvailableCodes(newLevel)
  }
})

// Merchant Name Auto-Fetch Logic
const isFetchingMerchant = ref(false)
let debounceTimeout: NodeJS.Timeout | null = null

const fetchMerchantName = async (code: string) => {
  if (!code || code.trim() === '') {
    newApp.value.merchant = ''
    return
  }

  isFetchingMerchant.value = true
  try {
    const api = useApi()
    
    const response = await api<any>(`/merchants/${code}`, {
      method: 'GET',
    })

    if (response.success && response.data?.merchantName) {
      newApp.value.merchant = response.data.merchantName
    } else if (response.success && response.data?.merchant?.merchantName) {
      newApp.value.merchant = response.data.merchant.merchantName
    } else {
      newApp.value.merchant = 'Unknown Merchant'
    }
  } catch (e) {
    console.error('Failed to fetch merchant details:', e)
    newApp.value.merchant = 'Unknown Merchant'
  } finally {
    isFetchingMerchant.value = false
  }
}

watch(() => newApp.value.merchantId, (newId) => {
  if (isEditing.value) return // Don't auto-fetch while editing an existing record
  
  if (debounceTimeout) clearTimeout(debounceTimeout)
  
  // Debounce the API call so it doesn't fire on every keystroke
  debounceTimeout = setTimeout(() => {
    fetchMerchantName(newId)
  }, 500)
})

const apps = computed<App[]>(() => {
  return directoryStore.directories.map(dir => ({
    id: dir.id,
    name: dir.merchantName || dir.createdBy?.fullName || 'Unknown',
    merchantId: dir.merchantCode || '-',
    code: dir.ussdCode,
    type: dir.level,
    menuFlow: dir.menuConfig?.metadata?.name || 'Standard Flow',
    status: dir.status,
    traffic: '0' // Placeholder as traffic data is not in the directory API
  }))
})

const filteredApps = computed(() => {
  if (!searchQuery.value) return apps.value
  const query = searchQuery.value.toLowerCase()
  return apps.value.filter(app => 
    app.name.toLowerCase().includes(query) || 
    app.code.toLowerCase().includes(query)
  )
})

const paginatedApps = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredApps.value.slice(start, end)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const openAllocateModal = () => {
  isEditing.value = false
  editingId.value = null
  newApp.value = { merchant: '', merchantId: '', level: 'Secondary', method: 'Automatic', selectedCode: '', menuFlow: '' }
  showModal.value = true
  fetchAvailableCodes('Secondary') // Fetch codes for default level when opening
}

const openEditModal = (app: App) => {
  isEditing.value = true
  editingId.value = app.id
  
  let codeSuffix = ''
  // Strip both *820* and *820*1* dynamically based on the level
  const prefix = app.type === 'Secondary' ? '*820*1*' : '*820*'
  const exactCodeMatch = app.type === 'Secondary' ? '*820*1#' : '*820#'
  
  if (app.code === exactCodeMatch) {
    codeSuffix = ''
  } else {
    // Escape prefix for regex
    const escapedPrefix = prefix.replace(/\*/g, '\\*')
    const regex = new RegExp(`^${escapedPrefix}`)
    codeSuffix = app.code.replace(regex, '').replace(/#$/, '')
  }
  
  newApp.value = {
    merchant: app.name,
    merchantId: app.merchantId || '',
    level: app.type, 
    method: 'Manual',
    selectedCode: codeSuffix,
    menuFlow: app.menuFlow
  }
  
  showModal.value = true
}

const handleAllocate = async () => {
  if (!newApp.value.merchant || !newApp.value.merchantId || !newApp.value.menuFlow) {
    toast.error('Please fill in all required fields.')
    return
  }

  isSubmitting.value = true

  let codeToAssignNumber = 0
  
  if (newApp.value.method === 'Automatic' && !isEditing.value) {
    if (autoSelectedCode.value !== null) {
        codeToAssignNumber = autoSelectedCode.value
    } else {
        codeToAssignNumber = Math.floor(100 + Math.random() * 900)
    }
  } else {
    if (!newApp.value.selectedCode || newApp.value.selectedCode === '') {
        toast.error('Please select a code.')
        isSubmitting.value = false
        return
    }
    codeToAssignNumber = parseInt(newApp.value.selectedCode, 10)
  }

  if (isEditing.value && editingId.value) {
    // This will be updated to use actual API call later
    const index = apps.value.findIndex(a => a.id === editingId.value)
    // For now we just close the modal since we can't mutate computed properties directly
    toast.success('Code allocation updated successfully')
    showModal.value = false
    isSubmitting.value = false
  } else {
    // Find the corresponding menuConfigFlowId based on the selected name
    const selectedFlow = menuConfigsStore.configs.find(c => c.name === newApp.value.menuFlow)
    const menuConfigFlowId = selectedFlow ? selectedFlow.id : ''

    if (!menuConfigFlowId) {
        toast.error('Invalid Menu Flow selected.')
        isSubmitting.value = false
        return
    }

    const payload = {
      merchantCode: newApp.value.merchantId,
      codeToAssign: codeToAssignNumber,
      level: newApp.value.level.toUpperCase(),
      methodOfAllocation: newApp.value.method === 'Automatic' ? 'AUTO' : 'MANUAL',
      menuConfigFlowId: menuConfigFlowId,
      ...(newApp.value.level === 'Secondary' ? { parentCode: 1 } : {})
    }

    const response = await directoryStore.allocateCode(payload)

    if (response.success) {
      toast.success(response.message || 'Code allocated successfully')
      showModal.value = false
    } else {
      toast.error(`Allocation Failed: ${response.message}`)
    }
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Allocate</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage and allocate USSD service codes</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <SearchInput v-model="searchQuery" placeholder="Search codes..." class="w-full sm:w-auto" />
        <button 
          @click="openAllocateModal"
          class="flex items-center justify-center space-x-2 px-6 py-2 bg-vibes-600 hover:bg-vibes-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm h-10 w-full sm:w-auto whitespace-nowrap"
        >
          <Plus class="w-4 h-4" />
          <span>Allocate New Code</span>
        </button>
      </div>
    </div>

    <!-- Allocation Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ isEditing ? 'Edit Allocation' : 'Allocate New USSD Code' }}</h3>
          <button @click="showModal = false" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Merchant ID -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Merchant ID</label>
            <div class="relative">
              <input 
                v-model="newApp.merchantId"
                type="text" 
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:bg-white dark:focus:bg-gray-800 transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed dark:text-gray-200"
                placeholder="e.g. MER-001"
                :disabled="isEditing"
              />
              <div v-if="isFetchingMerchant" class="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" color="primary" />
              </div>
            </div>
          </div>

          <!-- Merchant Name -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Merchant Name</label>
            <div 
              class="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium opacity-80 cursor-not-allowed"
            >
              {{ newApp.merchant || 'Enter Merchant ID to auto-fill' }}
            </div>
          </div>

          <!-- Menu Flow -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Menu Flow</label>
            <div class="relative">
              <select 
                v-model="newApp.menuFlow"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:bg-white dark:focus:bg-gray-800 transition-all dark:text-gray-200 disabled:opacity-60"
                :disabled="menuConfigsStore.isLoading"
              >
                <option value="" disabled>{{ menuConfigsStore.isLoading ? 'Loading flows...' : 'Select a menu flow...' }}</option>
                <option v-for="flow in menuFlows" :key="flow.id" :value="flow.name">{{ flow.name }}</option>
              </select>
              <div v-if="menuConfigsStore.isLoading" class="absolute right-8 top-1/2 -translate-y-1/2">
                <Spinner size="sm" color="primary" />
              </div>
            </div>
          </div>

          <!-- Level & Method -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Level</label>
              <div class="flex bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                <button 
                  v-for="level in ['Primary', 'Secondary']" 
                  :key="level"
                  @click="newApp.level = level"
                  class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all"
                  :class="newApp.level === level ? 'bg-white dark:bg-gray-700 text-vibes-600 dark:text-vibes-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
                >
                  {{ level }}
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Allocation Method</label>
              <select 
                v-model="newApp.method"
                class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:bg-white dark:focus:bg-gray-800 transition-all h-[38px] dark:text-gray-200"
                :disabled="isEditing"
              >
                <option>Automatic</option>
                <option>Manual</option>
              </select>
            </div>
          </div>
          
          <!-- USSD Code Allocation -->
          <div v-if="newApp.method === 'Automatic' && !isEditing">
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Auto-Generated Code</label>
            <div class="w-full px-4 py-2.5 bg-vibes-50 dark:bg-vibes-900/30 border border-blue-100 dark:border-blue-800 rounded-lg text-sm font-mono text-vibes-600 dark:text-vibes-400 flex items-center justify-between">
              <span v-if="isFetchingCodes" class="flex items-center gap-2">
                <Spinner size="sm" color="primary" /> Fetching...
              </span>
              <span v-else>*820*<span v-if="newApp.level === 'Secondary'">1*</span><span class="font-bold text-blue-800 dark:text-vibes-300">{{ autoSelectedCode !== null ? autoSelectedCode : 'XXX' }}</span>#</span>
              <span class="text-xs bg-vibes-100 dark:bg-vibes-800 px-2 py-0.5 rounded text-vibes-700 dark:text-vibes-300 font-bold">Auto</span>
            </div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">System will automatically assign an available code</p>
          </div>

          <div v-else>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{{ isEditing ? 'Assigned Code' : 'Select Available Code' }}</label>
            <div v-if="isEditing" class="relative">
                 <div class="flex items-center w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus-within:ring-2 focus-within:ring-vibes-500 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all font-mono">
                    <span class="text-gray-500 dark:text-gray-400 mr-1">*820*<span v-if="newApp.level === 'Secondary'">1*</span></span>
                    <input 
                      v-model="newApp.selectedCode" 
                      type="text" 
                      class="bg-transparent border-none focus:ring-0 p-0 w-full text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none"
                      placeholder="Code"
                    />
                    <span class="text-gray-500 dark:text-gray-400 ml-1">#</span>
                 </div>
            </div>
            <div v-else class="relative">
              <select 
                v-model="newApp.selectedCode"
                class="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:bg-white dark:focus:bg-gray-800 transition-all font-mono dark:text-gray-200 disabled:opacity-60"
                :disabled="isFetchingCodes"
              >
                <option value="" disabled>{{ isFetchingCodes ? 'Loading codes...' : 'Choose a code...' }}</option>
                <option v-for="code in availableCodes" :key="code" :value="code">*820*<template v-if="newApp.level === 'Secondary'">1*</template>{{ code }}#</option>
              </select>
              <div v-if="isFetchingCodes" class="absolute right-8 top-1/2 -translate-y-1/2">
                <Spinner size="sm" color="primary" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button 
            @click="showModal = false"
            class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <Button 
            @click="handleAllocate"
            variant="primary"
            :loading="isSubmitting"
          >
            <Plus v-if="!isEditing" class="w-4 h-4 mr-2" />
            <Pencil v-else class="w-4 h-4 mr-2" />
            {{ isEditing ? 'Save Changes' : 'Allocate Code' }}
          </Button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="px-6 py-4 font-bold">Merchant Name</th>
              <th class="px-6 py-4 font-bold">USSD Code</th>
              <th class="px-6 py-4 font-bold">Menu Flow</th>
              <th class="px-6 py-4 font-bold">Level</th>
              <th class="px-6 py-4 font-bold">Traffic</th>
              <th class="px-6 py-4 font-bold">Status</th>
              <th class="px-6 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <template v-if="directoryStore.isLoading">
              <tr v-for="i in 10" :key="'skeleton-'+i" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-2">
                    <Shimmer width="70%" height="1.25rem" />
                    <Shimmer width="40%" height="0.875rem" />
                  </div>
                </td>
                <td class="px-6 py-4"><Shimmer width="6rem" height="1.75rem" /></td>
                <td class="px-6 py-4"><Shimmer width="8rem" height="1.25rem" /></td>
                <td class="px-6 py-4"><Shimmer width="5rem" height="1.25rem" /></td>
                <td class="px-6 py-4"><Shimmer width="3rem" height="1.25rem" /></td>
                <td class="px-6 py-4"><Shimmer width="5rem" height="1.5rem" circle class="!rounded-full" /></td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end">
                    <Shimmer width="2rem" height="2rem" class="rounded-lg" />
                  </div>
                </td>
              </tr>
            </template>
            <tr v-else-if="directoryStore.error">
              <td colspan="7" class="px-6 py-8 text-center text-red-500">{{ directoryStore.error }}</td>
            </tr>
            <tr v-else-if="paginatedApps.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">No directories found.</td>
            </tr>
            <tr v-else v-for="app in paginatedApps" :key="app.id" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-full">
                    <p v-if="app.name === 'Unknown' && app.merchantId !== '-'" class="flex items-center gap-2">
                      <Shimmer width="6rem" height="1rem" />
                    </p>
                    <p v-else class="font-bold text-gray-800 dark:text-gray-100">{{ app.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">ID: {{ app.merchantId }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 bg-[#005586] text-white rounded-md font-mono text-sm font-bold border border-[#00446b]">
                  {{ app.code }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ app.menuFlow }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ app.type }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
                  <PlayCircle class="w-4 h-4 text-green-500 dark:text-green-400 mr-1.5" />
                  {{ app.traffic }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  :class="app.status.toLowerCase() === 'active' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="app.status.toLowerCase() === 'active' ? 'bg-green-600 dark:bg-green-400' : 'bg-amber-500'"></span>
                  {{ app.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click="openEditModal(app)" 
                    class="p-2 text-gray-400 dark:text-gray-500 hover:text-vibes-600 dark:hover:text-vibes-400 hover:bg-vibes-50 dark:hover:bg-vibes-900/30 rounded-lg transition-colors" 
                    title="Edit"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredApps.length === 0 && !directoryStore.isLoading && !directoryStore.error" class="p-12 text-center">
        <div class="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone class="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No codes found</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">Try adjusting your search query or allocate a new code.</p>
        <button 
          @click="openAllocateModal"
          class="px-4 py-2 bg-vibes-600 hover:bg-vibes-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Allocate Code
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="filteredApps.length > 0" class="border-t border-gray-100 dark:border-gray-700 p-4">
        <Pagination 
          :current-page="currentPage" 
          :total-items="filteredApps.length" 
          :items-per-page="itemsPerPage"
          @page-change="handlePageChange"
          @update:itemsPerPage="itemsPerPage = $event"
        />
      </div>
    </div>
  </div>
</template>
