<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Smartphone, PlayCircle, X, Pencil } from 'lucide-vue-next'
import SearchInput from '~/components/ui/SearchInput.vue'
import Pagination from '~/components/ui/Pagination.vue'
import Button from '~/components/ui/Button.vue'

interface App {
  id: number
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
const itemsPerPage = 8

// Edit mode state
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const isSubmitting = ref(false)

const newApp = ref({
  merchant: '',
  merchantId: '',
  level: 'Secondary',
  method: 'Automatic',
  selectedCode: '',
  menuFlow: ''
})

const merchants = ['Kofi Electronics', 'Ama Provisions', 'Tech Solutions', 'Accra Mall Pharmacy', 'Volta Grains']
const availableCodes = ['123', '456', '789', '999', '000']
const menuFlows = [
  'Main Menu Flow',
  'Payment Flow',
  'Inquiry Flow',
  'Settings Flow',
  'Custom Flow'
]

const apps = ref<App[]>([
  { id: 1, name: 'Kofi Electronics', merchantId: 'MER-001', code: '*920#', type: 'Primary', menuFlow: 'Main Menu Flow', status: 'Active', traffic: '12.5k' },
  { id: 2, name: 'Ama Provisions', merchantId: 'MER-002', code: '*920*1#', type: 'Secondary', menuFlow: 'Payment Flow', status: 'Active', traffic: '3.2k' },
  { id: 3, name: 'Tech Solutions', merchantId: 'MER-003', code: '*920*50#', type: 'Secondary', menuFlow: 'Inquiry Flow', status: 'Paused', traffic: '0' },
  { id: 4, name: 'Accra Mall Pharmacy', merchantId: 'MER-004', code: '*920*Pay#', type: 'Secondary', menuFlow: 'Settings Flow', status: 'Active', traffic: '45.1k' },
])

const filteredApps = computed(() => {
  if (!searchQuery.value) return apps.value
  const query = searchQuery.value.toLowerCase()
  return apps.value.filter(app => 
    app.name.toLowerCase().includes(query) || 
    app.code.toLowerCase().includes(query)
  )
})

const paginatedApps = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
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
}

const openEditModal = (app: App) => {
  isEditing.value = true
  editingId.value = app.id
  
  let codeSuffix = ''
  if (app.code === '*920#') {
    codeSuffix = ''
  } else {
    codeSuffix = app.code.replace(/^\*920\*/, '').replace(/#$/, '')
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
  if (!newApp.value.merchant || !newApp.value.merchantId) return

  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 800))

  let allocatedCode = ''
  
  if (newApp.value.method === 'Automatic' && !isEditing.value) {
    allocatedCode = `*920*${Math.floor(100 + Math.random() * 900)}#`
  } else {
    if (!newApp.value.selectedCode && newApp.value.selectedCode !== '') return
    
    if (newApp.value.selectedCode === '') {
        allocatedCode = '*920#'
    } else {
        allocatedCode = `*920*${newApp.value.selectedCode}#`
    }
  }

  if (isEditing.value && editingId.value) {
    const index = apps.value.findIndex(a => a.id === editingId.value)
    const existingApp = apps.value[index]
    
    if (index !== -1 && existingApp) {
      const updatedApp: App = {
        id: existingApp.id,
        name: newApp.value.merchant,
        merchantId: newApp.value.merchantId,
        code: allocatedCode,
        type: newApp.value.level,
        menuFlow: newApp.value.menuFlow,
        status: existingApp.status,
        traffic: existingApp.traffic
      }
      apps.value[index] = updatedApp
    }
  } else {
    apps.value.push({
      id: Date.now(),
      name: newApp.value.merchant,
      merchantId: newApp.value.merchantId,
      code: allocatedCode,
      type: newApp.value.level,
      menuFlow: newApp.value.menuFlow,
      status: 'Active',
      traffic: '0'
    })
  }

  showModal.value = false
  isSubmitting.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Allocate</h1>
        <p class="text-sm text-gray-500 mt-1">Manage and allocate USSD service codes</p>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
        <SearchInput v-model="searchQuery" placeholder="Search codes..." class="w-full sm:w-auto" />
        <button 
          @click="openAllocateModal"
          class="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm h-10 w-full sm:w-auto whitespace-nowrap"
        >
          <Plus class="w-4 h-4" />
          <span>Allocate New Code</span>
        </button>
      </div>
    </div>

    <!-- Allocation Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 class="text-lg font-bold text-gray-800">{{ isEditing ? 'Edit Allocation' : 'Allocate New USSD Code' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-6 space-y-4">
          <!-- Merchant Select -->
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">Select Merchant</label>
            <select 
              v-model="newApp.merchant"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              :disabled="isEditing"
            >
              <option value="" disabled>Choose a merchant...</option>
              <option v-for="m in merchants" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          
          <!-- Merchant ID -->
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">Merchant ID</label>
            <input 
              v-model="newApp.merchantId"
              type="text" 
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="e.g. MER-001"
              :disabled="isEditing"
            />
          </div>

          <!-- Menu Flow -->
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-1">Menu Flow</label>
            <select 
              v-model="newApp.menuFlow"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="" disabled>Select a menu flow...</option>
              <option v-for="flow in menuFlows" :key="flow" :value="flow">{{ flow }}</option>
            </select>
          </div>

          <!-- Level & Method -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Level</label>
              <div class="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button 
                  v-for="level in ['Primary', 'Secondary']" 
                  :key="level"
                  @click="newApp.level = level"
                  class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all"
                  :class="newApp.level === level ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                >
                  {{ level }}
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1">Allocation Method</label>
              <select 
                v-model="newApp.method"
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all h-[38px]"
                :disabled="isEditing"
              >
                <option>Automatic</option>
                <option>Manual</option>
              </select>
            </div>
          </div>
          
          <!-- USSD Code Allocation -->
          <div v-if="newApp.method === 'Automatic' && !isEditing">
            <label class="block text-xs font-bold text-gray-500 mb-1">Auto-Generated Code</label>
            <div class="w-full px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-lg text-sm font-mono text-blue-600 flex items-center justify-between">
              <span>*920*<span class="font-bold text-blue-800">XXX</span>#</span>
              <span class="text-xs bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-bold">Auto</span>
            </div>
            <p class="text-xs text-gray-400 mt-1">System will automatically assign an available code</p>
          </div>

          <div v-else>
            <label class="block text-xs font-bold text-gray-500 mb-1">{{ isEditing ? 'Assigned Code' : 'Select Available Code' }}</label>
            <div v-if="isEditing" class="relative">
                 <div class="flex items-center w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all font-mono">
                    <span class="text-gray-500 mr-1">*920*</span>
                    <input 
                      v-model="newApp.selectedCode" 
                      type="text" 
                      class="bg-transparent border-none focus:ring-0 p-0 w-full text-gray-800 placeholder-gray-400 outline-none"
                      placeholder="Code"
                    />
                    <span class="text-gray-500 ml-1">#</span>
                 </div>
            </div>
            <select 
              v-else
              v-model="newApp.selectedCode"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
            >
              <option value="" disabled>Choose a code...</option>
              <option v-for="code in availableCodes" :key="code" :value="code">*920*{{ code }}#</option>
            </select>
          </div>
        </div>
        
        <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button 
            @click="showModal = false"
            class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
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

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-4 font-bold">Merchant Name</th>
              <th class="px-6 py-4 font-bold">Service Code</th>
              <th class="px-6 py-4 font-bold">Menu Flow</th>
              <th class="px-6 py-4 font-bold">Level</th>
              <th class="px-6 py-4 font-bold">Traffic</th>
              <th class="px-6 py-4 font-bold">Status</th>
              <th class="px-6 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="app in paginatedApps" :key="app.id" class="hover:bg-gray-50/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div>
                    <p class="font-bold text-gray-800">{{ app.name }}</p>
                    <p class="text-xs text-gray-500">ID: {{ app.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md font-mono text-sm font-bold border border-gray-200">
                  {{ app.code }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600">{{ app.menuFlow }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600">{{ app.type }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center text-sm font-medium text-gray-900">
                  <PlayCircle class="w-4 h-4 text-green-500 mr-1.5" />
                  {{ app.traffic }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  :class="app.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'"
                >
                  <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="app.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'"></span>
                  {{ app.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click="openEditModal(app)" 
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
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
      <div v-if="filteredApps.length === 0" class="p-12 text-center">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-1">No codes found</h3>
        <p class="text-gray-500 text-sm mb-6">Try adjusting your search query or allocate a new code.</p>
        <button 
          @click="openAllocateModal"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Allocate Code
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="filteredApps.length > 0" class="border-t border-gray-100 p-4">
        <Pagination 
          :current-page="currentPage" 
          :total-items="filteredApps.length" 
          :items-per-page="itemsPerPage"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
