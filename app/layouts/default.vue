<script setup lang="ts">
import Sidebar from '~/components/Sidebar.vue'
import Header from '~/components/Header.vue'
import { useState } from '#imports'

const isCollapsed = useState('sidebarCollapsed', () => false)
</script>

<template>
  <div class="flex h-screen bg-gray-50 font-sans text-gray-900">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div 
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="isCollapsed ? 'ml-20' : 'ml-64'"
    >
      <!-- Top Header -->
      <Header />

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
