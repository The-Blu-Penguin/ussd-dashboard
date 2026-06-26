<script setup lang="ts">
import { Menu, Moon, Sun, Bell, ChevronDown } from 'lucide-vue-next'
import { useState } from '#imports'
import { useTheme } from '~/composables/useTheme'
import { useAuth } from '~/composables/useAuth'

const { user, logout } = useAuth()
const { isDark, toggleTheme } = useTheme()
const isMobileSidebarOpen = useState('mobileSidebarOpen', () => false)

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}
</script>

<template>
  <header class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 h-16 px-4 sm:px-6 flex items-center justify-between shadow-sm transition-colors duration-300">
    <!-- Left: Toggle -->
    <div class="flex items-center space-x-4 flex-1 min-w-0">
      <button
        @click="toggleMobileSidebar"
        class="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 lg:hidden"
        aria-label="Toggle mobile sidebar"
        aria-expanded="false"
        aria-controls="mobile-sidebar"
      >
        <Menu class="w-5 h-5" aria-hidden="true" />
      </button>
    </div>

    <!-- Right: Actions -->
    <nav class="flex items-center space-x-2 sm:space-x-4 shrink-0" aria-label="Header actions">
      <!-- Dark Mode -->
      <button 
        @click="toggleTheme"
        class="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <Moon v-if="isDark" class="w-5 h-5" aria-hidden="true" />
        <Sun v-else class="w-5 h-5" aria-hidden="true" />
      </button>

      <!-- User Profile -->
      <div 
        class="flex items-center pl-2 sm:pl-4 border-l border-gray-100 dark:border-gray-800 ml-2 sm:ml-4 cursor-pointer group"
        role="button"
        tabindex="0"
        aria-label="User profile menu"
        @keydown.enter="$event.preventDefault()"
        @keydown.space="$event.preventDefault()"
      >
        <div class="flex items-center space-x-2 sm:space-x-3">
          <div class="w-8 h-8 rounded-full bg-vibes-100 dark:bg-vibes-900/50 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all shrink-0">
            <img 
              v-if="user?.avatarUrl"
              :src="user.avatarUrl"
              :alt="`${user.fullName} avatar`" 
              class="w-full h-full object-cover" 
            />
          </div>
          <div class="hidden md:block text-left">
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-vibes-600 dark:group-hover:text-vibes-400">{{ user?.fullName || 'User' }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500">{{ user?.role || 'N/A' }}</p>
          </div>
          <ChevronDown class="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 hidden sm:block" aria-hidden="true" />
        </div>
      </div>
    </nav>
  </header>
</template>
