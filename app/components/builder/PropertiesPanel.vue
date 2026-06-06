<script setup>
import { Settings, XCircle, Plus, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps({
  selectedNode: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  },
  allNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const updateNodeLabel = (val) => {
  if (props.selectedNode) {
    props.selectedNode.label = val
  }
}

const nodeType = computed(() => props.selectedNode?.data?.componentType || 'UNKNOWN')

// Validation helpers
const validationTypes = ['AMOUNT', 'ALPHANUMERIC', 'NUMERIC', 'PHONE', 'EMAIL']

const ensureValidation = () => {
  if (props.selectedNode && props.selectedNode.data) {
    if (!props.selectedNode.data.validation) {
      props.selectedNode.data.validation = { type: 'ALPHANUMERIC' }
    }
  }
}

// Ensure validation exists before accessing
const getValidation = () => {
  if (!props.selectedNode?.data?.validation) {
    ensureValidation()
  }
  return props.selectedNode?.data?.validation || { type: 'ALPHANUMERIC' }
}

// Menu options helpers
const addOption = () => {
  if (!props.selectedNode.data.options) {
    props.selectedNode.data.options = []
  }
  props.selectedNode.data.options.push({
    input: String(props.selectedNode.data.options.length + 1),
    value: '',
    next: '',
    set: {}
  })
}

// Validation for menu options
const validateMenuOptions = computed(() => {
  if (!props.selectedNode?.data?.options || nodeType.value !== 'MENU') {
    return { isValid: true, errors: [] }
  }
  
  const errors: string[] = []
  const seenKeys = new Set<string>()
  
  props.selectedNode.data.options.forEach((opt: MenuOption, index: number) => {
    // Check for duplicate keys
    if (opt.input && seenKeys.has(opt.input)) {
      errors.push(`Option ${index + 1}: Duplicate key "${opt.input}"`)
    } else if (opt.input) {
      seenKeys.add(opt.input)
    }
    
    // Check for empty key
    if (!opt.input || opt.input.trim() === '') {
      errors.push(`Option ${index + 1}: Key cannot be empty`)
    }
    
    // Check for empty value
    if (!opt.value || opt.value.trim() === '') {
      errors.push(`Option ${index + 1}: Value cannot be empty`)
    }
    
    // Check for valid target node
    if (opt.next && !props.allNodes.find(n => n.id === opt.next)) {
      errors.push(`Option ${index + 1}: Target node "${opt.next}" does not exist`)
    }
  })
  
  return { isValid: errors.length === 0, errors }
})

const removeOption = (index) => {
  props.selectedNode.data.options.splice(index, 1)
}

const addSetVariable = (option) => {
  if (!option.set) option.set = {}
  const key = `var${Object.keys(option.set).length + 1}`
  option.set[key] = ''
}

const removeSetVariable = (option, key) => {
  delete option.set[key]
}

// Target node options for onSuccess/onFailure
const targetNodes = computed(() => {
  return props.allNodes
    .filter(n => n.id !== props.selectedNode?.id)
    .map(n => ({ id: n.id, label: n.label || n.id }))
})
</script>

<template>
  <div v-if="show" class="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 h-full overflow-hidden">
    <div class="flex items-center justify-between mb-6 shrink-0">
      <h3 class="text-sm font-bold text-gray-800 dark:text-gray-100">Node Properties</h3>
      <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <XCircle class="w-5 h-5" />
      </button>
    </div>

    <div v-if="selectedNode" class="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
      <!-- Node ID -->
      <div>
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Node ID</label>
        <input 
          type="text" 
          v-model="selectedNode.id" 
          disabled
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
        />
      </div>

      <!-- Label -->
      <div>
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Display Label</label>
        <input 
          type="text" 
          :value="selectedNode.label"
          @input="updateNodeLabel($event.target.value)"
          class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors"
        />
      </div>

      <!-- Type -->
      <div>
        <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
        <div class="px-3 py-2 bg-vibes-50 dark:bg-vibes-900/30 text-vibes-700 dark:text-vibes-400 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800 inline-block">
          {{ nodeType }}
        </div>
      </div>

      <hr class="border-gray-100 dark:border-gray-700 my-4" />

      <!-- INPUT / MENU / AUTH / END: Prompt -->
      <div v-if="['INPUT', 'MENU', 'AUTH', 'END'].includes(nodeType)" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt Text</label>
          <textarea 
            v-model="selectedNode.data.prompt"
            rows="3"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors resize-none"
            placeholder="Enter prompt text shown to user..."
          ></textarea>
          <p class="text-xs text-gray-400 mt-1">Use {{variableName}} for dynamic values</p>
        </div>
      </div>

      <!-- INPUT: Variable + Validation -->
      <div v-if="nodeType === 'INPUT'" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Variable Name</label>
          <input 
            type="text" 
            v-model="selectedNode.data.variable"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors"
            placeholder="e.g. amount"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Validation Type</label>
          <select
            :value="getValidation().type"
            @change="(e) => { ensureValidation(); selectedNode.data.validation.type = e.target.value }"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors"
          >
            <option v-for="vt in validationTypes" :key="vt" :value="vt">{{ vt }}</option>
          </select>
        </div>

        <div v-if="getValidation().type === 'AMOUNT'">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Min Value</label>
          <input 
            type="number" 
            :value="getValidation().minValue"
            @input="(e) => { ensureValidation(); selectedNode.data.validation.minValue = parseFloat(e.target.value) }"
            step="0.01"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors"
            placeholder="0.01"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Error Message</label>
          <input 
            type="text" 
            :value="getValidation().errorMessage"
            @input="(e) => { ensureValidation(); selectedNode.data.validation.errorMessage = e.target.value }"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors"
            placeholder="Invalid input. Please try again."
          />
        </div>
      </div>

      <!-- MENU: Options Editor -->
      <div v-if="nodeType === 'MENU'" class="space-y-4">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Menu Options</label>
          <button 
            @click="addOption"
            class="flex items-center space-x-1 px-2 py-1 text-xs bg-vibes-50 dark:bg-vibes-900/30 text-vibes-600 dark:text-vibes-400 rounded-md border border-vibes-200 dark:border-vibes-800 hover:bg-vibes-100 transition-colors"
          >
            <Plus class="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>

        <!-- Validation Errors -->
        <div v-if="!validateMenuOptions.isValid" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p class="text-xs font-medium text-red-800 dark:text-red-300 mb-2">Validation Errors:</p>
          <ul class="text-xs text-red-700 dark:text-red-400 space-y-1">
            <li v-for="(error, idx) in validateMenuOptions.errors" :key="idx" class="flex items-start">
              <span class="mr-1">•</span>
              <span>{{ error }}</span>
            </li>
          </ul>
        </div>

        <div v-if="!selectedNode.data.options || selectedNode.data.options.length === 0" class="text-xs text-gray-400 italic">
          No options yet. Click Add to create one.
        </div>

        <div v-for="(opt, index) in selectedNode.data.options" :key="index" class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Option {{ index + 1 }}</span>
            <button @click="removeOption(index)" class="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <input 
              v-model="opt.input" 
              placeholder="Key (e.g. 1)"
              class="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-vibes-500"
            />
            <input 
              v-model="opt.value" 
              placeholder="Value (e.g. Offering)"
              class="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-vibes-500"
            />
          </div>

          <select
            v-model="opt.next"
            class="w-full px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-vibes-500"
          >
            <option value="">Select next step...</option>
            <option v-for="target in targetNodes" :key="target.id" :value="target.id">{{ target.label }}</option>
          </select>

          <!-- Set Variables -->
          <div class="pt-1">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-500">Set Variables</span>
              <button @click="addSetVariable(opt)" class="text-xs text-vibes-600 hover:text-vibes-700">+ Add</button>
            </div>
            <div v-for="(val, key) in opt.set" :key="key" class="flex items-center space-x-2 mb-1">
              <input 
                :value="key"
                @input="(e) => { const newKey = e.target.value; opt.set[newKey] = val; delete opt.set[key]; }"
                class="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder="Variable"
              />
              <input 
                v-model="opt.set[key]" 
                class="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder="Value"
              />
              <button @click="removeSetVariable(opt, key)" class="text-gray-400 hover:text-red-500">
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ACTION: Action Name + Branching -->
      <div v-if="nodeType === 'ACTION'" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Action Name</label>
          <input 
            type="text" 
            v-model="selectedNode.data.actionName"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors"
            placeholder="e.g. processPaymentToMerchant"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">On Success →</label>
          <select
            v-model="selectedNode.data.onSuccess"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors"
          >
            <option value="">Select target node...</option>
            <option v-for="target in targetNodes" :key="target.id" :value="target.id">{{ target.label }}</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">On Failure →</label>
          <select
            v-model="selectedNode.data.onFailure"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-vibes-500 transition-colors"
          >
            <option value="">Select target node...</option>
            <option v-for="target in targetNodes" :key="target.id" :value="target.id">{{ target.label }}</option>
          </select>
        </div>
      </div>
    </div>
    
    <div v-else class="flex-1 flex flex-col items-center justify-center text-center px-4">
      <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900/50 flex items-center justify-center mb-3">
        <Settings class="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">Select a node on the canvas to edit its properties.</p>
    </div>
  </div>
</template>
