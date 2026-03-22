<script setup lang="ts">
import { onMounted } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Header from '~/components/Header.vue'
import { useState } from '#imports'
import { useTheme } from '~/composables/useTheme'

const isCollapsed = useState('sidebarCollapsed', () => false)
const isMobileSidebarOpen = useState('mobileSidebarOpen', () => false)
const { initTheme } = useTheme()

onMounted(() => {
  initTheme()
})

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-hidden transition-colors duration-300">
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="isMobileSidebarOpen"
      @click="closeMobileSidebar"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
    ></div>

    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div 
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out min-w-0"
      :class="isCollapsed ? 'lg:ml-20' : 'lg:ml-64'"
    >
      <!-- Top Header -->
      <Header />

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
        <slot />
      </main>
    </div>
  </div>
</template>
