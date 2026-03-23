<script setup>
import { ref, onMounted, watch } from 'vue'
import { Save, Settings } from 'lucide-vue-next'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import ComponentsSidebar from '~/components/builder/ComponentsSidebar.vue'
import PropertiesPanel from '~/components/builder/PropertiesPanel.vue'
import { useMenuConfigsStore } from '~/stores/menuConfigs'
import Button from '~/components/ui/Button.vue'
import { useRoute } from '#imports'

// Import Vue Flow styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const route = useRoute()
const menuConfigsStore = useMenuConfigsStore()
const { onConnect, addEdges, addNodes, project, onNodeClick, onPaneClick } = useVueFlow()

const showProperties = ref(false)
const selectedNode = ref(null)
const saveMessage = ref('')
const saveError = ref(false)
const isEditing = ref(false)
const configId = ref(null)

// Menu Flow Metadata
const flowName = ref("Visual Menu Flow")
const flowDescription = ref("Flow built with visual builder")
const flowType = ref("STANDARD_NOT_REFERENCED")
const flowHasReference = ref(false)

// Watch for flow type changes to automatically update hasReference
watch(flowType, (newType) => {
  if (newType.includes('NOT_REFERENCED')) {
    flowHasReference.value = false
  } else if (newType.includes('REFERENCED')) {
    flowHasReference.value = true
  }
})

onNodeClick(({ node }) => {
  selectedNode.value = node
  showProperties.value = true
})

onPaneClick(() => {
  selectedNode.value = null
  showProperties.value = false
})

const initialNodes = [
  { id: 'enter_amount', type: 'input', label: 'INPUT: enter_amount', position: { x: 350, y: 50 }, class: 'bg-white border-2 border-blue-500 rounded-lg shadow-sm font-bold text-center p-3', data: { componentType: 'INPUT', prompt: 'Welcome to {{merchantName}}\nEnter amount:', variable: 'amount' } },
  { id: 'enter_description', label: 'INPUT: enter_description', position: { x: 350, y: 150 }, class: 'bg-white border-2 border-blue-400 rounded-lg shadow-sm text-center p-3', data: { componentType: 'INPUT', prompt: 'Enter reference:', variable: 'description' } },
  { id: 'process_payment', label: 'ACTION: process_payment', position: { x: 350, y: 250 }, class: 'bg-purple-50 border-2 border-purple-400 rounded-lg shadow-sm text-center p-3 font-medium', data: { componentType: 'ACTION', actionName: 'processPaymentToMerchant' } },
  { id: 'payment_success', type: 'output', label: 'END: payment_success', position: { x: 200, y: 380 }, class: 'bg-green-50 border-2 border-green-500 rounded-lg shadow-sm text-center p-3 font-medium', data: { componentType: 'END', prompt: 'Request submitted successfully.' } },
  { id: 'payment_failed', type: 'output', label: 'END: payment_failed', position: { x: 500, y: 380 }, class: 'bg-red-50 border-2 border-red-500 rounded-lg shadow-sm text-center p-3 font-medium', data: { componentType: 'END', prompt: 'Transfer failed. Please try again later.' } },
]

const initialEdges = [
  { id: 'e-enter_amount-enter_description', source: 'enter_amount', target: 'enter_description', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e-enter_description-process_payment', source: 'enter_description', target: 'process_payment', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e-process_payment-payment_success', source: 'process_payment', target: 'payment_success', animated: true, label: 'onSuccess', style: { stroke: '#22c55e' }, labelBgStyle: { fill: '#f0fdf4' } },
  { id: 'e-process_payment-payment_failed', source: 'process_payment', target: 'payment_failed', animated: true, label: 'onFailure', style: { stroke: '#ef4444' }, labelBgStyle: { fill: '#fef2f2' } },
]

const nodes = ref(initialNodes)
const edges = ref(initialEdges)

onConnect((params) => addEdges([params]))

const onDragOver = (event) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event) => {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return

  const { left, top } = event.currentTarget.getBoundingClientRect()
  
  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  })

  let classNames = 'bg-white border-2 border-blue-400 rounded-lg shadow-sm text-center p-3'
  let nodeType = 'default'
  
  if (type === 'END') {
    classNames = 'bg-red-50 border-2 border-red-500 rounded-lg shadow-sm text-center p-3 font-medium'
    nodeType = 'output'
  } else if (type === 'ACTION') {
    classNames = 'bg-purple-50 border-2 border-purple-400 rounded-lg shadow-sm text-center p-3 font-medium'
  } else if (type === 'MENU' || type === 'INPUT') {
    classNames = 'bg-blue-50 border-2 border-blue-500 rounded-lg shadow-sm text-center p-3 font-medium'
  } else if (type === 'CONDITION') {
    classNames = 'bg-orange-50 border-2 border-orange-400 rounded-lg shadow-sm text-center p-3 font-medium'
  } else if (type === 'AUTH') {
    classNames = 'bg-slate-50 border-2 border-slate-500 rounded-lg shadow-sm text-center p-3 font-medium'
  } else if (type === 'DATABASE') {
    classNames = 'bg-emerald-50 border-2 border-emerald-500 rounded-lg shadow-sm text-center p-3 font-medium'
  } else if (type === 'ROUTE') {
    classNames = 'bg-yellow-50 border-2 border-yellow-500 rounded-lg shadow-sm text-center p-3 font-medium'
  } else if (type === 'SET_VAR') {
    classNames = 'bg-indigo-50 border-2 border-indigo-500 rounded-lg shadow-sm text-center p-3 font-medium'
  }

  const newNode = {
    id: `node_${Date.now()}`,
    type: nodeType,
    position,
    label: `${type}: new_node`,
    class: classNames,
    data: {
      componentType: type,
      prompt: '',
      variable: '',
      actionName: '',
      endpoint: ''
    }
  }
  
  addNodes([newNode])
}

onMounted(async () => {
  if (route.query.id) {
    configId.value = route.query.id
    isEditing.value = true
    
    // Find the config to edit from existing store configs
    let configToEdit = menuConfigsStore.configs.find(c => c.id === configId.value)
    
    // If not found in store, try fetching it directly from API
    if (!configToEdit) {
      const result = await menuConfigsStore.getConfigById(configId.value)
      if (result.success && result.data) {
        configToEdit = result.data
      }
    }
    
    if (!configToEdit) {
      console.error('Config not found with ID:', configId.value)
      saveMessage.value = 'Configuration not found.'
      saveError.value = true
      return
    }

    // Set metadata
    flowName.value = configToEdit.name
    flowDescription.value = configToEdit.description
    flowType.value = configToEdit.type
    flowHasReference.value = configToEdit.hasReference
    
    // Load nodes and edges if available
    if (configToEdit.menuConfig && configToEdit.menuConfig.nodes && configToEdit.menuConfig.edges) {
      nodes.value = configToEdit.menuConfig.nodes
      edges.value = configToEdit.menuConfig.edges
    }
  }
})

const saveFlow = async () => {
  const flowData = {
    nodes: nodes.value,
    edges: edges.value
  }
  
  const requestData = {
    name: flowName.value,
    type: flowType.value,
    hasReference: flowHasReference.value,
    description: flowDescription.value,
    menuConfig: flowData
  }
  
  let result;
  if (isEditing.value && configId.value) {
    result = await menuConfigsStore.updateConfig(configId.value, requestData)
  } else {
    result = await menuConfigsStore.saveConfig(requestData)
  }
  
  saveMessage.value = result.message
  saveError.value = !result.success
  
  setTimeout(() => { saveMessage.value = '' }, 3000)
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Builder Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
      <div class="flex-1 flex items-center space-x-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Menu Builder</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Design USSD flows visually</p>
        </div>
        
        <!-- Metadata Controls -->
        <div class="hidden md:flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200 dark:border-gray-700">
          <input 
            v-model="flowName" 
            type="text" 
            placeholder="Flow Name" 
            class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
          />
          <select 
            v-model="flowType"
            class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-200"
          >
            <option value="STANDARD_NOT_REFERENCED">Standard</option>
            <option value="STANDARD_REFERENCED">Standard (Referenced)</option>
            <option value="CUSTOM_NOT_REFERENCED">Custom</option>
            <option value="CUSTOM_REFERENCED">Custom (Referenced)</option>
          </select>
        </div>
      </div>
      <div class="flex items-center space-x-3 w-full sm:w-auto">
        <span v-if="saveMessage" class="text-sm font-medium mr-2" :class="saveError ? 'text-red-500' : 'text-green-500'">
          {{ saveMessage }}
        </span>
        <button 
          @click="showProperties = !showProperties"
          class="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          :class="{ 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400': showProperties }"
        >
          <Settings class="w-4 h-4" />
          <span>Properties</span>
        </button>
        <Button 
          @click="saveFlow"
          variant="primary"
          :loading="menuConfigsStore.isSaving"
          class="flex-1 sm:flex-none flex justify-center items-center space-x-2"
        >
          <Save v-if="!menuConfigsStore.isSaving" class="w-4 h-4 mr-2" />
          <span>Save Flow</span>
        </Button>
      </div>
    </div>

    <!-- Workspace -->
    <div class="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row relative">
      <!-- Components Sidebar -->
      <ComponentsSidebar class="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 shrink-0" />

      <!-- Canvas -->
      <div class="flex-1 h-full min-h-[400px] bg-gray-50/50 dark:bg-gray-900/50 relative" @drop="onDrop" @dragover="onDragOver">
        <VueFlow v-model="nodes" :edges="edges" fit-view-on-init class="h-full w-full vue-flow-dark">
          <Background pattern-color="#94a3b8" :gap="20" />
        </VueFlow>
      </div>

      <!-- Properties Sidebar -->
      <PropertiesPanel 
        :show="showProperties" 
        :selected-node="selectedNode"
        @close="showProperties = false"
      />
    </div>
  </div>
</template>

<style>
/* Add support for VueFlow dark mode text colors inside nodes */
.dark .vue-flow__node {
  color: #1f2937; /* Keep nodes dark text even in dark mode for contrast with their bright backgrounds */
}
</style>