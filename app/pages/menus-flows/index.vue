<script setup>
import { ref } from 'vue'
import { useState } from '#imports'
import { Plus, ListTree, MoreVertical, Trash2, X, Network, FileJson } from 'lucide-vue-next'

const flows = ref([
  { id: 1, name: 'Registration Flow', description: 'Handles new user onboarding', modified: '2 hours ago', status: 'Active', type: 'Main Menu' },
  { id: 2, name: 'Balance Check', description: 'Check account balance', modified: '1 day ago', status: 'Active', type: 'Action Flow' },
  { id: 3, name: 'Airtime Purchase', description: 'Airtime top-up for self and others', modified: '3 days ago', status: 'Draft', type: 'Payment Flow' },
  { id: 4, name: 'Support Menu', description: 'Customer service options', modified: '1 week ago', status: 'Active', type: 'Sub Menu' },
])

const showCreateModal = ref(false)
const isCollapsed = useState('sidebarCollapsed', () => false)

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
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
            <tr v-for="flow in flows" :key="flow.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mr-3">
                    <ListTree class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ flow.name }}</div>
                    <div class="text-xs text-gray-400 dark:text-gray-500">ID: FL-{{ flow.id }}</div>
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
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                  :class="flow.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'">
                  {{ flow.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ flow.modified }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <button class="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
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
  </div>
</template>