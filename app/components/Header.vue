<script setup lang="ts">
import { Menu, Search, Moon, Bell, ChevronDown } from 'lucide-vue-next'

const { user, logout } = useAuth()
</script>

<template>
  <header class="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 h-16 px-6 flex items-center justify-between shadow-sm">
    <!-- Left: Toggle & Search -->
    <div class="flex items-center space-x-4 flex-1">
      <button class="p-2 hover:bg-gray-100 rounded-lg text-gray-500 lg:hidden">
        <Menu class="w-5 h-5" />
      </button>
      
      <div class="relative w-full max-w-md hidden md:block">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-gray-400" />
        </div>
        <input 
          type="text" 
          class="block w-full pl-10 pr-3 py-2 border-none rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors" 
          placeholder="Try to searching ..."
        >
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center space-x-4">
      <!-- Dark Mode -->
      <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
        <Moon class="w-5 h-5" />
      </button>

      <!-- User Profile -->
      <div class="flex items-center pl-4 border-l border-gray-100 ml-4 cursor-pointer group">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-200 transition-all">
            <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
          </div>
          <div class="hidden md:block text-left">
            <p class="text-sm font-semibold text-gray-700 group-hover:text-blue-600">{{ user.name }}</p>
            <p class="text-xs text-gray-400">{{ user.role }}</p>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </div>
      </div>
    </div>
  </header>
</template>
