<script setup>
import { ref, onMounted } from 'vue'
import { Save, Code, FileJson } from 'lucide-vue-next'
import { useMenuConfigsStore } from '~/stores/menuConfigs'
import Button from '~/components/ui/Button.vue'
import { useRoute } from '#imports'

const route = useRoute()
const menuConfigsStore = useMenuConfigsStore()
const saveMessage = ref('')
const saveError = ref(false)
const isEditing = ref(false)
const configId = ref(null)

const jsonContent = ref(JSON.stringify({
  "name": "",
  "type": "STANDARD_NOT_REFERENCED",
  "description": "",
  "menuConfig": {
    "entry": "",
    "steps": [],
    "version": 1,
    "configId": "",
    "metadata": {
      "name": "",
      "description": ""
    }
  }
}, null, 2))

const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonContent.value)
    jsonContent.value = JSON.stringify(parsed, null, 2)
    saveMessage.value = 'JSON formatted successfully'
    saveError.value = false
  } catch (e) {
    saveMessage.value = 'Invalid JSON structure'
    saveError.value = true
  }
  
  setTimeout(() => { saveMessage.value = '' }, 3000)
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

    // Reconstruct the JSON structure matching our expected payload
    const jsonToLoad = {
      name: configToEdit.name,
      type: configToEdit.type,
      hasReference: configToEdit.hasReference,
      description: configToEdit.description,
      menuConfig: configToEdit.menuConfig
    }
    jsonContent.value = JSON.stringify(jsonToLoad, null, 2)
  }
})

const saveConfig = async () => {
  try {
    const parsed = JSON.parse(jsonContent.value)
    
    // Extract root level properties or fall back to defaults/metadata
    const metadata = parsed.menuConfig?.metadata || {}
    
    const requestData = {
      name: parsed.name || metadata.name || "New Menu Config",
      type: parsed.type || "STANDARD_NOT_REFERENCED",
      hasReference: parsed.hasReference !== undefined ? parsed.hasReference : false,
      description: parsed.description || metadata.description || "USSD Menu Flow",
      menuConfig: parsed.menuConfig || parsed
    }
    
    let result;
    if (isEditing.value && configId.value) {
      result = await menuConfigsStore.updateConfig(configId.value, requestData)
    } else {
      result = await menuConfigsStore.saveConfig(requestData)
    }
    
    saveMessage.value = result.message
    saveError.value = !result.success
    
  } catch (e) {
    saveMessage.value = 'Invalid JSON structure. Please fix errors before saving.'
    saveError.value = true
  }
  
  setTimeout(() => { saveMessage.value = '' }, 3000)
}
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">JSON Builder</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">Edit USSD flow configuration directly</p>
      </div>
      <div class="flex items-center space-x-3">
        <span v-if="saveMessage" class="text-sm font-medium mr-2" :class="saveError ? 'text-red-500' : 'text-green-500'">
          {{ saveMessage }}
        </span>
        <button @click="formatJson" class="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
          <FileJson class="w-4 h-4" />
          <span>Format</span>
        </button>
        <Button 
          @click="saveConfig"
          variant="primary"
          :loading="menuConfigsStore.isSaving"
          class="flex items-center space-x-2"
        >
          <Save v-if="!menuConfigsStore.isSaving" class="w-4 h-4 mr-2" />
          <span>Save Config</span>
        </Button>
      </div>
    </div>

    <!-- Editor -->
    <div class="flex-1 bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden flex flex-col">
      <div class="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span class="text-xs font-mono text-gray-400">config.json</span>
        <div class="flex items-center space-x-2">
           <span class="w-3 h-3 rounded-full bg-red-500"></span>
           <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
           <span class="w-3 h-3 rounded-full bg-green-500"></span>
        </div>
      </div>
      <textarea 
        v-model="jsonContent" 
        class="flex-1 w-full bg-gray-900 text-green-400 font-mono p-4 text-sm focus:outline-none resize-none"
        spellcheck="false"
      ></textarea>
    </div>
  </div>
</template>
