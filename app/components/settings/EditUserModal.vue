<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import { useUsersStore } from '~/stores/users'
import { useSettingsErrorHandler } from '~/composables/useSettingsErrorHandler'
import type { User, UserRole } from '~/types/api'

const props = defineProps<{
  user: User | null
}>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const usersStore = useUsersStore()
const settingsHandler = useSettingsErrorHandler()

const editUserForm = ref({
  fullName: '',
  role: 'ADMIN' as UserRole
})
const isUpdatingUser = ref(false)

watch(() => props.user, (newUser) => {
  if (newUser) {
    editUserForm.value = {
      fullName: newUser.fullName,
      role: newUser.role
    }
  }
}, { immediate: true })

const close = () => {
  emit('close')
}

const handleUpdateUser = async () => {
  if (!props.user || !editUserForm.value.fullName) return
  
  isUpdatingUser.value = true
  
  const result = await usersStore.updateUser(props.user.id, {
    fullName: editUserForm.value.fullName,
    role: editUserForm.value.role
  })
  
  if (result.success) {
    settingsHandler.handleSuccess('User updated successfully')
    emit('updated')
    close()
  } else {
    settingsHandler.handleUserManagementError(new Error(result.message))
  }
  
  isUpdatingUser.value = false
}
</script>

<template>
  <div v-if="user" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="close"></div>
    
    <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700">
      <!-- Modal Header -->
      <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Edit User</h3>
        <button @click="close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <form @submit.prevent="handleUpdateUser" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
          <input 
            type="text" 
            :value="user.email"
            disabled
            class="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-500 cursor-not-allowed"
          />
        </div>
        
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
          <input 
            v-model="editUserForm.fullName"
            type="text" 
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Role</label>
          <select 
            v-model="editUserForm.role"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-900 dark:text-gray-100"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="EDITOR">EDITOR</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>

        <!-- Modal Footer -->
        <div class="pt-4 flex justify-end space-x-3">
          <button type="button" @click="close" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <Button 
            type="submit" 
            variant="primary"
            :loading="isUpdatingUser"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
