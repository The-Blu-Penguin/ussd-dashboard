<script setup>
import { ref } from 'vue'
import { Plus, Smartphone, MoreVertical, PlayCircle, Edit } from 'lucide-vue-next'

const apps = ref([
  { id: 1, name: 'Main Merchant Menu', code: '*920#', type: 'Menu Flow', status: 'Active', traffic: '12.5k' },
  { id: 2, name: 'Customer Support', code: '*920*1#', type: 'Interactive', status: 'Active', traffic: '3.2k' },
  { id: 3, name: 'Promo Campaign', code: '*920*50#', type: 'Menu Flow', status: 'Paused', traffic: '0' },
  { id: 4, name: 'Direct Payment', code: '*920*Pay#', type: 'Payment API', status: 'Active', traffic: '45.1k' },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Allocate</h1>
        <p class="text-sm text-gray-500 mt-1">Manage and allocate USSD service codes</p>
      </div>
      <button class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
        <Plus class="w-4 h-4" />
        <span>Allocate New Code</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="app in apps" :key="app.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-4">
          <div class="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Smartphone class="w-6 h-6" />
          </div>
          <div class="flex space-x-2">
             <span class="px-2.5 py-0.5 rounded-full text-xs font-medium" 
               :class="app.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
               {{ app.status }}
             </span>
             <button class="text-gray-400 hover:text-gray-600"><MoreVertical class="w-4 h-4" /></button>
          </div>
        </div>
        
        <h3 class="text-lg font-bold text-gray-900 mb-1">{{ app.name }}</h3>
        <p class="text-sm text-gray-500 font-mono mb-4">{{ app.code }}</p>
        
        <div class="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-50">
           <span>{{ app.type }}</span>
           <span class="flex items-center">
             <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
             {{ app.traffic }} reqs
           </span>
        </div>

        <div class="mt-4 flex space-x-2">
           <button class="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-200">
             <Edit class="w-3.5 h-3.5" />
             <span>Edit</span>
           </button>
           <button class="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-100">
             <PlayCircle class="w-3.5 h-3.5" />
             <span>Simulate</span>
           </button>
        </div>
      </div>
    </div>
  </div>
</template>