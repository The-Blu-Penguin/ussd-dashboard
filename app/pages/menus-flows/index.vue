<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useState } from '#imports'
import { Plus, ListTree, MoreVertical, Trash2, X, Network, FileJson, Edit2, AlertTriangle } from 'lucide-vue-next'
import { useMenuConfigsStore } from '~/stores/menuConfigs'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from '#imports'
import Button from '~/components/ui/Button.vue'

const menuConfigsStore = useMenuConfigsStore()
const router = useRouter()

onMounted(() => {
  menuConfigsStore.fetchConfigs()
})

const showCreateModal = ref(false)
const isCollapsed = useState('sidebarCollapsed', () => false)

// Delete Modal State
const showDeleteModal = ref(false)
const configToDelete = ref<any>(null)
const isDeleting = ref(false)
const deleteError = ref('')

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const handleEditConfig = (flow: any) => {
  // Determine which builder to use based on the menuConfig structure
  // If it has nodes/edges it's from visual builder, otherwise json builder
  const isVisual = flow.menuConfig?.nodes && flow.menuConfig?.edges
  
  if (isVisual) {
    router.push({ path: '/builder/visual', query: { id: flow.id } })
  } else {
    router.push({ path: '/builder/json', query: { id: flow.id } })
  }
}

const confirmDelete = (flow: any) => {
  configToDelete.value = flow
  showDeleteModal.value = true
  deleteError.value = ''
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  configToDelete.value = null
  deleteError.value = ''
}

const executeDelete = async () => {
  if (!configToDelete.value) return
  
  isDeleting.value = true
  deleteError.value = ''
  
  const result = await menuConfigsStore.deleteConfig(configToDelete.value.id)
  
  if (result.success) {
    closeDeleteModal()
  } else {
    deleteError.value = result.message || 'Failed to delete configuration'
  }
  
  isDeleting.value = false
}

const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  } catch (e) {
    return dateString
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Menus & Flows</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Design and manage your USSD logic flows</p>
      </div>
      <button @click="openCreateModal" class="w-full sm:w-auto flex justify-center items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
        <Plus class="w-4 h-4" />
        <span>Create New Flow</span>
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50/50 dark:bg-gray-900/50">
            <tr class="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th class="px-6 py-4">Flow Name</th>
              <th class="px-6 py-4">Description</th>
              <th class="px-6 py-4">Type</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Last Modified</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <tr v-if="menuConfigsStore.isLoading">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">Loading menu configurations...</td>
            </tr>
            <tr v-else-if="menuConfigsStore.error">
              <td colspan="6" class="px-6 py-8 text-center text-red-500">{{ menuConfigsStore.error }}</td>
            </tr>
            <tr v-else-if="menuConfigsStore.configs.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">No menu configurations found. Create one to get started.</td>
            </tr>
            <tr v-else v-for="flow in menuConfigsStore.configs" :key="flow.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mr-3">
                    <ListTree class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ flow.name }}</div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">ID: {{ flow.id.substring(0, 8) }}...</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ flow.description }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ flow.type }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ formatDate(flow.updatedAt) }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button 
                    @click="handleEditConfig(flow)"
                    class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" 
                    title="Edit"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="confirmDelete(flow)"
                    :disabled="menuConfigsStore.isLoading"
                    class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50" 
                    title="Delete"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Modal -->
    <div 
      v-if="showCreateModal" 
      class="fixed bottom-0 top-16 right-0 z-40 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'left-20' : 'left-64'"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeCreateModal"></div>
      
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all">
        <!-- Header -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Create New Flow</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Choose how you want to build your USSD flow</p>
          </div>
          <button @click="closeCreateModal" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Options -->
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <NuxtLink to="/builder/visual" class="group block p-6 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Network class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Visual Builder</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Drag and drop components to design your flow visually. Best for beginners and rapid prototyping.</p>
          </NuxtLink>

          <NuxtLink to="/builder/json" class="group block p-6 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-purple-900/10 transition-all cursor-pointer">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileJson class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">JSON Builder</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Edit the flow configuration directly in JSON. Best for developers and advanced configurations.</p>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="showDeleteModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeDeleteModal"></div>
      
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700">
        <!-- Header -->
        <div class="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
          <div class="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle class="w-5 h-5" />
            <h3 class="text-lg font-bold">Delete Configuration</h3>
          </div>
          <button @click="closeDeleteModal" class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Are you sure you want to delete the configuration <span class="font-bold text-gray-900 dark:text-white">"{{ configToDelete?.name }}"</span>?
          </p>
          <p class="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-100 dark:border-red-900/20">
            This action cannot be undone. Any active USSD menus relying on this flow will stop working.
          </p>
          
          <div v-if="deleteError" class="mt-4 text-sm text-red-500 text-center font-medium">
            {{ deleteError }}
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button 
            @click="closeDeleteModal" 
            :disabled="isDeleting"
            class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <Button 
            @click="executeDelete" 
            variant="danger"
            :loading="isDeleting"
            class="flex items-center space-x-2"
          >
            <span>Delete Flow</span>
          </Button>
        </div>
      </div>
    </div>

  </div>
</template>