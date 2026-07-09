<script setup>
import { ref, onMounted, watch } from 'vue'
import { Save, Settings, FileJson, Download } from 'lucide-vue-next'
import { VueFlow, useVueFlow, Handle, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import ComponentsSidebar from '~/components/builder/ComponentsSidebar.vue'
import PropertiesPanel from '~/components/builder/PropertiesPanel.vue'
import { useMenuConfigsStore } from '~/stores/menuConfigs'
import Button from '~/components/ui/Button.vue'
import { useRoute } from '#imports'
import { nodesEdgesToSteps, stepsToNodesEdges } from '~/composables/useFlowSerializer'
import { useLogger } from '~/composables/useLogger'

// Import Vue Flow styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const route = useRoute()
const menuConfigsStore = useMenuConfigsStore()
const logger = useLogger()
const { onConnect, addEdges, addNodes, project, onNodeClick, onPaneClick, getNodes, getEdges } = useVueFlow()

const showProperties = ref(false)
const selectedNode = ref(null)
const saveMessage = ref('')
const saveError = ref(false)
const isEditing = ref(false)
const configId = ref(null)
const showExportModal = ref(false)
const exportedJson = ref('')
const selectedTemplate = ref('blank')

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

// Template definitions
const templates = {
  blank: {
    name: 'Blank Canvas',
    description: 'Start from scratch',
    nodes: [],
    edges: []
  },
  payment: {
    name: 'Payment Flow',
    description: 'Simple payment collection flow',
    nodes: [
      { 
        id: 'enter_amount', 
        type: 'default',
        label: 'INPUT: enter_amount', 
        position: { x: 350, y: 50 }, 
        class: 'bg-white border-2 border-vibes-500 rounded-lg shadow-sm font-bold text-center p-3', 
        data: { 
          componentType: 'INPUT', 
          prompt: 'Welcome to {{merchantName}}\nEnter amount:', 
          variable: 'amount', 
          validation: { type: 'AMOUNT', minValue: 0.01, errorMessage: 'Invalid amount. Enter numbers only' } 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'enter_description',
        type: 'default',
        label: 'INPUT: enter_description', 
        position: { x: 350, y: 150 }, 
        class: 'bg-white border-2 border-blue-400 rounded-lg shadow-sm text-center p-3', 
        data: { 
          componentType: 'INPUT', 
          prompt: 'Enter reference:', 
          variable: 'description', 
          validation: { type: 'ALPHANUMERIC' } 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'process_payment',
        type: 'default',
        label: 'ACTION: process_payment', 
        position: { x: 350, y: 250 }, 
        class: 'bg-purple-50 border-2 border-purple-400 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'ACTION', 
          actionName: 'processPaymentToMerchant' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'payment_success', 
        type: 'default',
        label: 'END: payment_success', 
        position: { x: 200, y: 380 }, 
        class: 'bg-green-50 border-2 border-green-500 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'END', 
          prompt: 'Request submitted successfully. You will receive a payment prompt shortly. Ref: {{transactionReference}}.' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'payment_failed', 
        type: 'default',
        label: 'END: payment_failed', 
        position: { x: 500, y: 380 }, 
        class: 'bg-red-50 border-2 border-red-500 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'END', 
          prompt: 'Transfer failed. Please try again later.' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
    ],
    edges: [
      { 
        id: 'e-enter_amount-enter_description', 
        source: 'enter_amount', 
        target: 'enter_description', 
        type: 'smoothstep',
        animated: true, 
        style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' } 
      },
      { 
        id: 'e-enter_description-process_payment', 
        source: 'enter_description', 
        target: 'process_payment', 
        type: 'smoothstep',
        animated: true, 
        style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' } 
      },
      { 
        id: 'e-process_payment-payment_success', 
        source: 'process_payment', 
        target: 'payment_success', 
        type: 'smoothstep',
        animated: true, 
        label: 'onSuccess', 
        style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' }, 
        labelBgStyle: { fill: '#f0fdf4' } 
      },
      { 
        id: 'e-process_payment-payment_failed', 
        source: 'process_payment', 
        target: 'payment_failed', 
        type: 'smoothstep',
        animated: true, 
        label: 'onFailure', 
        style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }, 
        labelBgStyle: { fill: '#fef2f2' } 
      },
    ]
  },
  donation: {
    name: 'Donation/Giving Flow',
    description: 'Church/charity donation with categories',
    nodes: [
      { 
        id: 'select_category',
        type: 'default',
        label: 'MENU: select_category', 
        position: { x: 350, y: 50 }, 
        class: 'bg-blue-50 border-2 border-blue-500 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'MENU', 
          prompt: 'Welcome to {{merchantName}}\n1. Offering\n2. Tithes\n3. Seed\n4. Thanksgiving', 
          options: [
            { input: '1', value: 'Offering', next: 'enter_amount', set: { category: 'Offering' } },
            { input: '2', value: 'Tithes', next: 'enter_amount', set: { category: 'Tithes' } },
            { input: '3', value: 'Seed', next: 'enter_amount', set: { category: 'Seed' } },
            { input: '4', value: 'Thanksgiving', next: 'enter_amount', set: { category: 'Thanksgiving' } }
          ]
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'enter_amount',
        type: 'default',
        label: 'INPUT: enter_amount', 
        position: { x: 350, y: 200 }, 
        class: 'bg-white border-2 border-vibes-500 rounded-lg shadow-sm text-center p-3', 
        data: { 
          componentType: 'INPUT', 
          prompt: 'Enter amount:', 
          variable: 'amount', 
          validation: { type: 'AMOUNT', minValue: 1, errorMessage: 'Invalid amount' } 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'process_donation',
        type: 'default',
        label: 'ACTION: process_donation', 
        position: { x: 350, y: 300 }, 
        class: 'bg-purple-50 border-2 border-purple-400 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'ACTION', 
          actionName: 'processPaymentToMerchant' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'success',
        type: 'default',
        label: 'END: success', 
        position: { x: 200, y: 430 }, 
        class: 'bg-green-50 border-2 border-green-500 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'END', 
          prompt: 'Thank you for your {{category}}! Ref: {{transactionReference}}' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'failed',
        type: 'default',
        label: 'END: failed', 
        position: { x: 500, y: 430 }, 
        class: 'bg-red-50 border-2 border-red-500 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'END', 
          prompt: 'Transaction failed. Please try again.' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
    ],
    edges: [
      { id: 'e1', source: 'select_category', target: 'enter_amount', type: 'smoothstep', animated: true, label: '1-4', style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' } },
      { id: 'e2', source: 'enter_amount', target: 'process_donation', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' } },
      { id: 'e3', source: 'process_donation', target: 'success', type: 'smoothstep', animated: true, label: 'onSuccess', style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' }, labelBgStyle: { fill: '#f0fdf4' } },
      { id: 'e4', source: 'process_donation', target: 'failed', type: 'smoothstep', animated: true, label: 'onFailure', style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }, labelBgStyle: { fill: '#fef2f2' } },
    ]
  },
  registration: {
    name: 'User Registration',
    description: 'Collect user information',
    nodes: [
      { 
        id: 'enter_name',
        type: 'default',
        label: 'INPUT: enter_name', 
        position: { x: 350, y: 50 }, 
        class: 'bg-white border-2 border-vibes-500 rounded-lg shadow-sm text-center p-3', 
        data: { 
          componentType: 'INPUT', 
          prompt: 'Welcome! Enter your full name:', 
          variable: 'fullName', 
          validation: { type: 'ALPHANUMERIC' } 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'enter_phone',
        type: 'default',
        label: 'INPUT: enter_phone', 
        position: { x: 350, y: 150 }, 
        class: 'bg-white border-2 border-vibes-500 rounded-lg shadow-sm text-center p-3', 
        data: { 
          componentType: 'INPUT', 
          prompt: 'Enter phone number:', 
          variable: 'phone', 
          validation: { type: 'PHONE', errorMessage: 'Invalid phone number' } 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'enter_email',
        type: 'default',
        label: 'INPUT: enter_email', 
        position: { x: 350, y: 250 }, 
        class: 'bg-white border-2 border-vibes-500 rounded-lg shadow-sm text-center p-3', 
        data: { 
          componentType: 'INPUT', 
          prompt: 'Enter email address:', 
          variable: 'email', 
          validation: { type: 'EMAIL', errorMessage: 'Invalid email' } 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'register_user',
        type: 'default',
        label: 'ACTION: register_user', 
        position: { x: 350, y: 350 }, 
        class: 'bg-purple-50 border-2 border-purple-400 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'ACTION', 
          actionName: 'registerUser' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'success',
        type: 'default',
        label: 'END: success', 
        position: { x: 200, y: 480 }, 
        class: 'bg-green-50 border-2 border-green-500 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'END', 
          prompt: 'Registration successful! Welcome {{fullName}}.' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      { 
        id: 'failed',
        type: 'default',
        label: 'END: failed', 
        position: { x: 500, y: 480 }, 
        class: 'bg-red-50 border-2 border-red-500 rounded-lg shadow-sm text-center p-3 font-medium', 
        data: { 
          componentType: 'END', 
          prompt: 'Registration failed. Please try again.' 
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
    ],
    edges: [
      { id: 'e1', source: 'enter_name', target: 'enter_phone', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' } },
      { id: 'e2', source: 'enter_phone', target: 'enter_email', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' } },
      { id: 'e3', source: 'enter_email', target: 'register_user', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' } },
      { id: 'e4', source: 'register_user', target: 'success', type: 'smoothstep', animated: true, label: 'onSuccess', style: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '5,5' }, labelBgStyle: { fill: '#f0fdf4' } },
      { id: 'e5', source: 'register_user', target: 'failed', type: 'smoothstep', animated: true, label: 'onFailure', style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }, labelBgStyle: { fill: '#fef2f2' } },
    ]
  }
}

const loadTemplate = (templateKey) => {
  const template = templates[templateKey]
  if (!template) return
  
  nodes.value = JSON.parse(JSON.stringify(template.nodes))
  edges.value = JSON.parse(JSON.stringify(template.edges))
  
  // Update flow name based on template
  if (templateKey !== 'blank') {
    flowName.value = template.name
    flowDescription.value = template.description
  }
  
  logger.builder.flowLoaded(`Template: ${template.name}`)
}

onNodeClick(({ node }) => {
  selectedNode.value = node
  showProperties.value = true
})

onPaneClick(() => {
  selectedNode.value = null
  showProperties.value = false
})

const nodes = ref([])
const edges = ref([])

onConnect((params) => {
  // Add styling to the new connection
  const styledEdge = {
    ...params,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' }
  }
  addEdges([styledEdge])
  logger.builder.edgeConnected(params.source, params.target)
})

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
  } else if (type === 'ACTION') {
    classNames = 'bg-purple-50 border-2 border-purple-400 rounded-lg shadow-sm text-center p-3 font-medium'
  } else if (type === 'MENU' || type === 'INPUT') {
    classNames = 'bg-vibes-50 border-2 border-vibes-500 rounded-lg shadow-sm text-center p-3 font-medium'
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
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    data: {
      componentType: type,
      prompt: '',
      variable: '',
      actionName: '',
      endpoint: '',
      validation: type === 'INPUT' ? { type: 'ALPHANUMERIC' } : undefined,
      options: type === 'MENU' ? [] : undefined,
      onSuccess: '',
      onFailure: ''
    }
  }
  
  addNodes([newNode])
  logger.builder.nodeAdded(type, newNode.id)
}

// Watch cleanup
let templateWatchStop
let searchQueryWatchStop

onMounted(async () => {
  // Load default template
  loadTemplate('payment')
  
  // Check for preview from JSON builder
  const previewJson = sessionStorage.getItem('previewFlowJson')
  if (previewJson) {
    try {
      const parsed = JSON.parse(previewJson)
      flowName.value = parsed.name || 'Preview Flow'
      flowDescription.value = parsed.description || ''
      flowType.value = parsed.type || 'STANDARD_NOT_REFERENCED'
      flowHasReference.value = parsed.type?.includes('REFERENCED') || false
      
      if (parsed.menuConfig && parsed.menuConfig.steps) {
        const { nodes: loadedNodes, edges: loadedEdges } = stepsToNodesEdges(
          parsed.menuConfig.steps,
          parsed.menuConfig.entry
        )
        nodes.value = loadedNodes
        edges.value = loadedEdges
      }
      sessionStorage.removeItem('previewFlowJson')
      saveMessage.value = 'Loaded from JSON preview'
      saveError.value = false
      logger.builder.flowLoaded(flowName.value)
      setTimeout(() => { saveMessage.value = '' }, 3000)
      return
    } catch (e) {
      logger.error('Failed to load preview JSON from JSON builder', { category: 'builder', error: e instanceof Error ? e : new Error(String(e)) })
    }
  }

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
      logger.error(`Config not found with ID: ${configId.value}`, { category: 'builder' })
      saveMessage.value = 'Configuration not found.'
      saveError.value = true
      return
    }

    // Set metadata
    flowName.value = configToEdit.name
    flowDescription.value = configToEdit.description
    flowType.value = configToEdit.type
    flowHasReference.value = configToEdit.hasReference
    
    // Load nodes and edges from menuConfig.steps
    if (configToEdit.menuConfig && configToEdit.menuConfig.steps) {
      const { nodes: loadedNodes, edges: loadedEdges } = stepsToNodesEdges(
        configToEdit.menuConfig.steps,
        configToEdit.menuConfig.entry
      )
      nodes.value = loadedNodes
      edges.value = loadedEdges
    }
    logger.builder.flowLoaded(configToEdit.name, configToEdit.id)
  }
})

onBeforeUnmount(() => {
  // Clean up watchers if they exist
  if (templateWatchStop) templateWatchStop()
  if (searchQueryWatchStop) searchQueryWatchStop()
})

const saveFlow = async () => {
  // Get current nodes and edges from VueFlow
  const currentNodes = getNodes.value
  const currentEdges = getEdges.value
  
  // Debug: Check what's in the nodes array
  console.log('[Visual Builder] Nodes array before serialization:', currentNodes.map(n => ({ id: n.id, type: n.type, componentType: n.data?.componentType })))
  console.log('[Visual Builder] Edges array before serialization:', currentEdges.map(e => ({ id: e.id, source: e.source, target: e.target })))
  
  const { steps, entry } = nodesEdgesToSteps(currentNodes, currentEdges)
  
  const requestData = {
    name: flowName.value,
    type: flowType.value,
    hasReference: flowHasReference.value,
    description: flowDescription.value,
    menuConfig: {
      entry,
      steps,
      version: 1,
      configId: 'config_v1',
      metadata: {
        name: flowName.value,
        description: flowDescription.value,
      }
    }
  }
  
  // Log the payload for debugging
  console.log('[Visual Builder] Saving flow with payload:', JSON.stringify(requestData, null, 2))
  
  let result;
  if (isEditing.value && configId.value) {
    result = await menuConfigsStore.updateConfig(configId.value, requestData)
  } else {
    result = await menuConfigsStore.saveConfig(requestData)
  }
  
  saveMessage.value = result.message
  saveError.value = !result.success

  if (result.success) {
    logger.builder.flowSaved(flowName.value, configId.value || undefined)
  } else {
    logger.error(`Failed to save flow: ${result.message}`, { category: 'builder' })
    console.error('[Visual Builder] Save failed. Request data:', requestData)
  }

  setTimeout(() => { saveMessage.value = '' }, 3000)
}

const exportJson = () => {
  // Get current nodes and edges from VueFlow
  const currentNodes = getNodes.value
  const currentEdges = getEdges.value
  
  const { steps, entry } = nodesEdgesToSteps(currentNodes, currentEdges)
  const payload = {
    name: flowName.value,
    type: flowType.value,
    description: flowDescription.value,
    menuConfig: {
      entry,
      steps,
      version: 1,
      configId: 'config_v1',
      metadata: {
        name: flowName.value,
        description: flowDescription.value,
      }
    }
  }
  exportedJson.value = JSON.stringify(payload, null, 2)
  showExportModal.value = true
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(exportedJson.value)
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Builder Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4 sm:gap-0">
      <div class="flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">Menu Builder</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Design USSD flows visually</p>
        </div>
        
        <!-- Template Selector -->
        <div class="flex items-center space-x-2">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Template:</label>
          <select 
            v-model="selectedTemplate"
            @change="loadTemplate(selectedTemplate)"
            class="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-800 dark:text-gray-200 shadow-sm"
          >
            <option value="blank">Blank Canvas</option>
            <option value="payment">Payment Flow</option>
            <option value="donation">Donation/Giving</option>
            <option value="registration">User Registration</option>
          </select>
        </div>
        
        <!-- Metadata Controls -->
        <div class="hidden lg:flex items-center space-x-3 pl-6 border-l border-gray-200 dark:border-gray-700">
          <input 
            v-model="flowName" 
            type="text" 
            placeholder="Flow Name" 
            class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-800 dark:text-gray-200"
          />
          <select 
            v-model="flowType"
            class="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-800 dark:text-gray-200"
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
          @click="exportJson"
          class="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          title="Export JSON"
        >
          <Download class="w-4 h-4" />
        </button>
        <button 
          @click="showProperties = !showProperties"
          class="flex-1 sm:flex-none flex justify-center items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
          :class="{ 'bg-vibes-50 dark:bg-vibes-900/30 border-blue-200 dark:border-blue-800 text-vibes-700 dark:text-vibes-400': showProperties }"
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
        <VueFlow 
          v-model="nodes" 
          v-model:edges="edges" 
          fit-view-on-init
          :connect-on-click="true"
          :default-edge-options="{ type: 'smoothstep', animated: true, style: { strokeWidth: 2, strokeDasharray: '5,5' } }"
          :connection-line-style="{ strokeWidth: 2, strokeDasharray: '5,5', stroke: '#9ca3af' }"
          class="h-full w-full"
        >
          <Background pattern-color="#94a3b8" :gap="20" />
        </VueFlow>
      </div>

      <!-- Properties Sidebar -->
      <PropertiesPanel 
        :show="showProperties" 
        :selected-node="selectedNode"
        :all-nodes="getNodes.value"
        @close="showProperties = false"
      />
    </div>

    <!-- Export JSON Modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showExportModal = false"></div>
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Exported JSON</h3>
          <button @click="showExportModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XCircle class="w-5 h-5" />
          </button>
        </div>
        <div class="flex-1 overflow-auto p-4">
          <pre class="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg overflow-auto">{{ exportedJson }}</pre>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
          <button @click="copyToClipboard" class="px-4 py-2 bg-vibes-600 hover:bg-vibes-700 text-white rounded-lg text-sm font-medium transition-colors">Copy to Clipboard</button>
          <button @click="showExportModal = false" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Add support for VueFlow dark mode text colors inside nodes */
.dark .vue-flow__node {
  color: #1f2937; /* Keep nodes dark text even in dark mode for contrast with their bright backgrounds */
}

/* Make connection handles more visible */
.vue-flow__handle {
  width: 12px !important;
  height: 12px !important;
  background: #3b82f6 !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.vue-flow__handle:hover {
  width: 14px !important;
  height: 14px !important;
  background: #2563eb !important;
}

/* Style the connection line while dragging */
.vue-flow__connection-path {
  stroke: #9ca3af !important;
  stroke-width: 2 !important;
  stroke-dasharray: 5, 5 !important;
}

/* Animated edges */
.vue-flow__edge-path {
  animation: dash 20s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -100;
  }
}
</style>
