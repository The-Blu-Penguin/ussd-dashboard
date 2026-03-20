<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useState } from '#imports'
import { 
  Rocket, 
  LayoutDashboard, 
  Smartphone, 
  ListTree, 
  Activity, 
  Users, 
  Settings, 
  FileText,
  PlayCircle,
  TestTube,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Hammer,
  FileJson,
  Network
} from 'lucide-vue-next'

const route = useRoute()
const isCollapsed = useState('sidebarCollapsed', () => false)
const isMobileSidebarOpen = useState('mobileSidebarOpen', () => false)
const { user, logout } = useAuth()
const openMenus = ref<Record<string, boolean>>({})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleMenu = (name: string) => {
  if (isCollapsed.value) {
    isCollapsed.value = false
    setTimeout(() => {
        openMenus.value[name] = !openMenus.value[name]
    }, 150)
  } else {
    openMenus.value[name] = !openMenus.value[name]
  }
}

const menuItems = [
  {
    header: 'MAIN',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, to: '/' },
      { name: 'Merchants', icon: Users, to: '/subscribers' },
      { name: 'Allocate', icon: Smartphone, to: '/allocate' },
      { name: 'Menus & Flows', icon: ListTree, to: '/menus-flows' },
      { 
        name: 'Builder', 
        icon: Hammer, 
        to: '/builder',
        children: [
          { name: 'Visual Builder', to: '/builder/visual', icon: Network },
          { name: 'JSON Builder', to: '/builder/json', icon: FileJson }
        ]
      },
    ]
  },
  {
    header: 'TESTING',
    items: [
      { name: 'Simulator', icon: PlayCircle, to: '/simulator' },
      { name: 'Sandbox', icon: TestTube, to: '/sandbox' },
    ]
  },
  {
    header: 'MONITORING',
    items: [
      { name: 'Live Sessions', icon: Activity, to: '/live-sessions' },
      { name: 'Transaction Logs', icon: FileText, to: '/transaction-logs' },
      { name: 'Service Logs', icon: ScrollText, to: '/service-logs' },
    ]
  },
  {
    header: 'SYSTEM',
    items: [
      { name: 'Settings', icon: Settings, to: '/settings' },
    ]
  }
]

interface MenuItem {
  name: string
  icon: any
  to: string
  children?: { name: string; to: string; icon?: any }[]
}

const isActive = (item: MenuItem) => {
  if (item.children) {
    return item.children.some(child => route.path === child.to) || route.path === item.to
  }
  return item.to !== '#' && route.path === item.to
}

const isChildActive = (to: string) => route.path === to

const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false
}
</script>

<template>
  <aside 
    class="bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out lg:translate-x-0"
    :class="[
      isCollapsed ? 'w-20' : 'w-64',
      isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center justify-between px-4 border-b border-gray-50 relative">
      <div class="flex items-center overflow-hidden whitespace-nowrap">
        <img src="/images.png" alt="Logo" class="w-15 h-15 min-w-[32px] transition-all object-contain" :class="isCollapsed ? 'mx-auto' : 'mr-3'" />
        <span 
          class="text-xl font-bold text-gray-800 transition-opacity duration-200"
          :class="isCollapsed ? 'opacity-0 w-0' : 'opacity-100'"
        >
          USSD ADMIN
        </span>
      </div>
      
      <!-- Toggle Button -->
      <button 
        @click="toggleSidebar"
        class="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50 text-gray-500 z-50 hidden md:flex"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-3 h-3" />
        <ChevronRight v-else class="w-3 h-3" />
      </button>
    </div>

    <!-- Menu -->
    <div class="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar overflow-x-hidden">
      <div v-for="(section, idx) in menuItems" :key="idx" class="mb-6">
        <h3 
          class="text-xs font-bold text-gray-400 mb-3 px-2 tracking-wider transition-opacity duration-200 whitespace-nowrap overflow-hidden"
          :class="isCollapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100'"
        >
          {{ section.header }}
        </h3>
        <ul>
          <li v-for="(item, itemIdx) in section.items" :key="itemIdx" class="mb-1">
            <div v-if="item.children">
                <button 
                  @click="toggleMenu(item.name)"
                  class="w-full flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 group relative"
                  :class="[
                    isActive(item) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    isCollapsed ? 'justify-center' : ''
                  ]"
                  :title="isCollapsed ? item.name : ''"
                >
                  <component 
                    :is="item.icon" 
                    class="w-5 h-5 transition-all duration-200 min-w-[20px]" 
                    :class="[
                      isActive(item) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600',
                      isCollapsed ? 'mr-0' : 'mr-3'
                    ]" 
                  />
                  
                  <span 
                    class="flex-1 text-left text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200"
                    :class="isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
                  >
                    {{ item.name }}
                  </span>
                  
                  <ChevronDown 
                    class="w-4 h-4 text-gray-400 transition-transform duration-200"
                    :class="[
                        isCollapsed ? 'hidden' : '',
                        openMenus[item.name] ? 'rotate-180' : ''
                    ]"
                  />
                  
                  <div v-if="isActive(item)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                </button>

                <!-- Submenu -->
                <div 
                    v-if="!isCollapsed && openMenus[item.name]" 
                    class="mt-1 ml-4 border-l border-gray-100 pl-2 space-y-1 overflow-hidden transition-all duration-300"
                >
                    <NuxtLink 
                        v-for="(child, childIdx) in item.children" 
                        :key="childIdx"
                        :to="child.to"
                        class="flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-200"
                        :class="isChildActive(child.to) ? 'text-blue-600 bg-blue-50/50 font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'"
                        @click="closeMobileSidebar"
                    >
                        <span>{{ child.name }}</span>
                    </NuxtLink>
                </div>
            </div>

            <NuxtLink 
               v-else
               :to="item.to"
               class="flex items-center px-3 py-2.5 rounded-lg transition-colors duration-200 group relative"
               :class="[
                 isActive(item) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                 isCollapsed ? 'justify-center' : ''
               ]"
               :title="isCollapsed ? item.name : ''"
               @click="closeMobileSidebar"
            >
              <component 
                :is="item.icon" 
                class="w-5 h-5 transition-all duration-200 min-w-[20px]" 
                :class="[
                  isActive(item) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600',
                  isCollapsed ? 'mr-0' : 'mr-3'
                ]" 
              />
              
              <span 
                class="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200"
                :class="isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
              >
                {{ item.name }}
              </span>
              
              <div v-if="isActive(item)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- User Profile Footer -->
    <div class="p-4 border-t border-gray-50 overflow-hidden">
      <div 
        class="bg-blue-50 rounded-xl flex items-center transition-colors duration-200 group cursor-pointer hover:bg-blue-100"
        :class="isCollapsed ? 'p-2 justify-center' : 'p-3 justify-between'"
      >
        <div class="flex items-center overflow-hidden">
          <div class="w-8 h-8 min-w-[32px] rounded-full bg-blue-200 flex items-center justify-center overflow-hidden" :class="isCollapsed ? '' : 'mr-3'">
             <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
          </div>
          <div 
            class="transition-all duration-200 whitespace-nowrap"
            :class="isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
          >
            <h4 class="text-sm font-bold text-gray-800 group-hover:text-blue-700">{{ user.name }}</h4>
            <p class="text-xs text-gray-500">{{ user.role }}</p>
          </div>
        </div>
        <LogOut v-if="!isCollapsed" @click="logout" class="w-5 h-5 text-gray-400 group-hover:text-blue-600 ml-2 cursor-pointer" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
