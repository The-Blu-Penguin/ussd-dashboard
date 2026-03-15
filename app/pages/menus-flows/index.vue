<script setup>
import { ref } from 'vue'
import { useState } from '#imports'
import { Plus, ListTree, MoreVertical, Edit, Copy, Trash2, X, Network, FileJson } from 'lucide-vue-next'

const flows = ref([
  { id: 1, name: 'Registration Flow', trigger: 'First Dial', modified: '2 hours ago', status: 'Active', nodes: 5 },
  { id: 2, name: 'Balance Check', trigger: 'Option 1', modified: '1 day ago', status: 'Active', nodes: 3 },
  { id: 3, name: 'Airtime Purchase', trigger: 'Option 2', modified: '3 days ago', status: 'Draft', nodes: 8 },
  { id: 4, name: 'Support Menu', trigger: 'Option 9', modified: '1 week ago', status: 'Active', nodes: 4 },
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
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Menus & Flows</h1>
        <p class="text-sm text-gray-500 mt-1">Design and manage your USSD logic flows</p>
      </div>
      <button @click="openCreateModal" class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
        <Plus class="w-4 h-4" />
        <span>Create New Flow</span>
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50/50">
            <tr class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th class="px-6 py-4">Flow Name</th>
              <th class="px-6 py-4">Trigger</th>
              <th class="px-6 py-4">Complexity</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Last Modified</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="flow in flows" :key="flow.id" class="hover:bg-gray-50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="p-2 bg-blue-50 text-blue-600 rounded-lg mr-3">
                    <ListTree class="w-4 h-4" />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ flow.name }}</div>
                    <div class="text-xs text-gray-400">ID: FL-{{ flow.id }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{{ flow.trigger }}</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-600">{{ flow.nodes }} Nodes</span>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                  :class="flow.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                  {{ flow.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ flow.modified }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                    <Edit class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Duplicate">
                    <Copy class="w-4 h-4" />
                  </button>
                  <button class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
      
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all">
        <!-- Header -->
        <div class="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-800">Create New Flow</h3>
            <p class="text-sm text-gray-500">Choose how you want to build your USSD flow</p>
          </div>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Options -->
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <NuxtLink to="/builder/visual" class="group block p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer">
            <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Network class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 mb-2">Visual Builder</h4>
            <p class="text-sm text-gray-500">Drag and drop components to design your flow visually. Best for beginners and rapid prototyping.</p>
          </NuxtLink>

          <NuxtLink to="/builder/json" class="group block p-6 border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:bg-purple-50/30 transition-all cursor-pointer">
            <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileJson class="w-6 h-6" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 mb-2">JSON Builder</h4>
            <p class="text-sm text-gray-500">Edit the flow configuration directly in JSON. Best for developers and advanced configurations.</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>