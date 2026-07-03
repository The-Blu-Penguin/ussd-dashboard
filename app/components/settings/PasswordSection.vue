<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Eye, EyeOff } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import { useAuthStore } from '~/stores/auth'
import { useSettingsErrorHandler } from '~/composables/useSettingsErrorHandler'

const authStore = useAuthStore()
const settingsHandler = useSettingsErrorHandler()

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isUpdatingPassword = ref(false)

const handlePasswordChange = async () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    settingsHandler.handleValidationError('Please fill in all password fields.')
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    settingsHandler.handleValidationError('New passwords do not match.')
    return
  }

  isUpdatingPassword.value = true
  
  const result = await authStore.changePassword({
    currentPassword: passwordForm.value.currentPassword,
    newPassword: passwordForm.value.newPassword
  })
  
  if (result.success) {
    settingsHandler.handleSuccess(result.message || 'Password changed successfully!')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } else {
    settingsHandler.handlePasswordError(new Error(result.message || 'Failed to change password.'))
  }
  
  isUpdatingPassword.value = false
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-700">
    <div class="flex items-center mb-4">
      <Lock class="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
      <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">Change Password</h2>
    </div>
    
    <form @submit.prevent="handlePasswordChange">
      <div class="mb-4">
        <label class="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-2" for="current-password">
          Current Password
        </label>
        <div class="relative">
          <input
            id="current-password"
            v-model="passwordForm.currentPassword"
            class="appearance-none border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 rounded-lg w-full py-2.5 px-3 pr-10 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-transparent transition"
            :type="showCurrentPassword ? 'text' : 'password'"
            placeholder="•••••••"
          >
          <button 
            type="button" 
            @click="showCurrentPassword = !showCurrentPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Eye v-if="!showCurrentPassword" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-2" for="new-password">
          New Password
        </label>
        <div class="relative">
          <input
            id="new-password"
            v-model="passwordForm.newPassword"
            class="appearance-none border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 rounded-lg w-full py-2.5 px-3 pr-10 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-transparent transition"
            :type="showNewPassword ? 'text' : 'password'"
            placeholder="•••••••"
          >
          <button 
            type="button" 
            @click="showNewPassword = !showNewPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Eye v-if="!showNewPassword" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="mb-6">
        <label class="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-2" for="confirm-password">
          Confirm New Password
        </label>
        <div class="relative">
          <input
            id="confirm-password"
            v-model="passwordForm.confirmPassword"
            class="appearance-none border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 rounded-lg w-full py-2.5 px-3 pr-10 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-vibes-500 focus:border-transparent transition"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="•••••••"
          >
          <button 
            type="button" 
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Eye v-if="!showConfirmPassword" class="w-4 h-4" />
            <EyeOff v-else class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="flex items-center justify-end mt-6">
        <Button 
          type="submit" 
          variant="primary"
          :loading="isUpdatingPassword"
          class="shadow-sm"
        >
          Update Password
        </Button>
      </div>
    </form>
  </div>
</template>
