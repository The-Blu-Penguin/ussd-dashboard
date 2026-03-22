<script setup>
import { List, Type, Globe, GitBranch, XCircle, Lock, Database, Route, Code } from 'lucide-vue-next'

const components = [
  { type: 'MENU', label: 'Menu Screen', icon: List, color: 'blue' },
  { type: 'INPUT', label: 'User Input', icon: Type, color: 'blue' },
  { type: 'AUTH', label: 'PIN / Auth', icon: Lock, color: 'slate', disabled: true },
  { type: 'ACTION', label: 'API Request', icon: Globe, color: 'purple', disabled: true },
  { type: 'DATABASE', label: 'DB Lookup', icon: Database, color: 'emerald', disabled: true },
  { type: 'CONDITION', label: 'Logic / IF', icon: GitBranch, color: 'orange' },
  { type: 'ROUTE', label: 'Router / Switch', icon: Route, color: 'yellow', disabled: true },
  { type: 'SET_VAR', label: 'Set Variable', icon: Code, color: 'indigo', disabled: true },
  { type: 'END', label: 'End Session', icon: XCircle, color: 'red' },
]

const onDragStart = (event, type, disabled) => {
  if (disabled) {
    event.preventDefault()
    return
  }
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }
}
</script>

<template>
  <div class="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 z-10 h-full flex flex-col">
    <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Components</h3>
    <div class="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
      <div 
        v-for="comp in components" 
        :key="comp.type" 
        class="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex items-center transition-all"
        :class="[
          comp.disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900/50' 
            : 'cursor-grab hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
        ]"
        :draggable="!comp.disabled"
        @dragstart="onDragStart($event, comp.type, comp.disabled)"
      >
        <div :class="`w-8 h-8 rounded-md flex items-center justify-center mr-3 ${
          comp.disabled ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500' :
          comp.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
          comp.color === 'slate' ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
          comp.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
          comp.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
          comp.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
          comp.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
          comp.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
          'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        }`">
          <component :is="comp.icon" class="w-4 h-4" />
        </div>
        <span class="text-sm font-medium" :class="comp.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'">
          {{ comp.label }}
        </span>
      </div>
    </div>
  </div>
</template>