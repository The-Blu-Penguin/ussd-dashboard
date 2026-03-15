<script setup>
import { ref } from 'vue'
import { Save, Settings } from 'lucide-vue-next'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import ComponentsSidebar from '~/components/builder/ComponentsSidebar.vue'
import PropertiesPanel from '~/components/builder/PropertiesPanel.vue'

// Import Vue Flow styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const { onConnect, addEdges, addNodes, project, onNodeClick, onPaneClick } = useVueFlow()

const showProperties = ref(false)
const selectedNode = ref(null)

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
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Builder Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Menu Builder</h1>
        <p class="text-sm text-gray-500">Design USSD flows visually</p>
      </div>
      <div class="flex space-x-3">
        <button 
          @click="showProperties = !showProperties"
          class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          :class="{ 'bg-blue-50 border-blue-200 text-blue-700': showProperties }"
        >
          <Settings class="w-4 h-4" />
          <span>Properties</span>
        </button>
        <button class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Save class="w-4 h-4" />
          <span>Save Flow</span>
        </button>
      </div>
    </div>

    <!-- Workspace -->
    <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
      <!-- Components Sidebar -->
      <ComponentsSidebar />

      <!-- Canvas -->
      <div class="flex-1 h-full bg-gray-50/50 relative" @drop="onDrop" @dragover="onDragOver">
        <VueFlow v-model="nodes" :edges="edges" fit-view-on-init class="h-full w-full">
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