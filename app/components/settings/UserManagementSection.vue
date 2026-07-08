<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserPlus, Trash2, Edit2 } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import Shimmer from '~/components/ui/Shimmer.vue'
import { useAuthStore } from '~/stores/auth'
import { useUsersStore } from '~/stores/users'
import { useSettingsErrorHandler } from '~/composables/useSettingsErrorHandler'
import { FORM_ROLE_TO_API } from '~/constants/userRoles'
import type { User, UserRole } from '~/types/api'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const settingsHandler = useSettingsErrorHandler()

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'Viewer'
})
const isAddingUser = ref(false)

const emit = defineEmits<{
  editUser: [user: User]
}>()

onMounted(() => {
  usersStore.fetchUsers()
})

const mapFormRoleToApiRole = (formRole: string): UserRole => {
  return FORM_ROLE_TO_API[formRole] || 'VIEWER'
}

const handleAddUser = async () => {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) {
    settingsHandler.handleValidationError('Please fill in all required fields.')
    return
  }

  isAddingUser.value = true
  try {
    const result = await usersStore.registerUser({
      email: newUser.value.email,
      fullName: newUser.value.name,
      password: newUser.value.password,
      role: mapFormRoleToApiRole(newUser.value.role),
    })

    if (result.success) {
      settingsHandler.handleSuccess(result.message || 'User added successfully')
      newUser.value = { name: '', email: '', password: '', role: 'Viewer' }
    } else {
      settingsHandler.handleUserManagementError(new Error(result.message || 'Failed to add user'))
    }
  } finally {
    isAddingUser.value = false
  }
}

const removeUser = async (id: string) => {
  if (confirm('Are you sure you want to delete this user?')) {
    const result = await usersStore.deleteUser(id)
    if (result.success) {
      settingsHandler.handleSuccess('User deleted successfully')
    } else {
      settingsHandler.handleUserManagementError(new Error(result.message || 'Failed to delete user'))
    }
  }
}
</script>

<template>
  <div v-if="authStore.user?.role !== 'EDITOR'" class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm md:col-span-2 border border-transparent dark:border-gray-700">
    <div class="flex items-center mb-6">
      <UserPlus class="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
      <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">Team Members</h2>
    </div>

    <!-- Add User Form -->
    <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
      <h3 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Invite New User</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
          <input 
            v-model="newUser.name"
            type="text" 
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="John Doe"
          />
        </div>
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
          <input 
            v-model="newUser.email"
            type="email" 
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="john@example.com"
          />
        </div>
        <div class="sm:col-span-2 lg:col-span-1">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Password</label>
          <input 
            v-model="newUser.password"
            type="password" 
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="•••••••"
          />
        </div>
        <div class="sm:col-span-1 lg:col-span-1">
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Role</label>
          <select 
            v-model="newUser.role"
            class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vibes-500 text-gray-900 dark:text-gray-100"
          >
            <option>Admin</option>
            <option>Editor</option>
            <option>Viewer</option>
          </select>
        </div>
        <Button 
          @click="handleAddUser"
          variant="primary"
          :loading="isAddingUser"
          class="h-[38px] w-full sm:w-auto sm:col-span-1 lg:col-span-1"
        >
          <UserPlus class="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>
    </div>

    <!-- Users List -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <th class="py-3 pl-2 font-bold">User</th>
            <th class="py-3 font-bold">Role</th>
            <th class="py-3 font-bold">Status</th>
            <th class="py-3 pr-2 text-right font-bold">Actions</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <template v-if="usersStore.isLoading">
            <tr v-for="i in 3" :key="'skeleton-'+i" class="border-b border-gray-50 dark:border-gray-700/50">
              <td class="py-3 pl-2">
                <div class="flex items-center">
                  <Shimmer width="2rem" height="2rem" circle class="mr-3" />
                  <div class="flex flex-col gap-1.5">
                    <Shimmer width="6rem" height="1rem" />
                    <Shimmer width="8rem" height="0.75rem" />
                  </div>
                </div>
              </td>
              <td class="py-3"><Shimmer width="4rem" height="1.25rem" class="rounded-full" /></td>
              <td class="py-3"><Shimmer width="4rem" height="1rem" /></td>
              <td class="py-3 pr-2 text-right">
                <div class="flex items-center justify-end gap-2">
                  <Shimmer width="1.5rem" height="1.5rem" class="rounded" />
                  <Shimmer width="1.5rem" height="1.5rem" class="rounded" />
                </div>
              </td>
            </tr>
          </template>
          <tr v-else-if="usersStore.error" class="border-b border-gray-50 dark:border-gray-700/50">
            <td colspan="4" class="py-6 text-center text-red-500">{{ usersStore.error }}</td>
          </tr>
          <tr v-else v-for="user in usersStore.users" :key="user.id" class="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
            <td class="py-3 pl-2">
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full mr-3 bg-vibes-100 dark:bg-vibes-900/50 flex items-center justify-center text-vibes-600 dark:text-vibes-400 font-bold text-xs">
                  {{ user.fullName.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-gray-800 dark:text-gray-100">{{ user.fullName }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td class="py-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vibes-50 dark:bg-vibes-900/30 text-vibes-700 dark:text-vibes-400 border border-blue-100 dark:border-blue-800">
                {{ user.role }}
              </span>
            </td>
            <td class="py-3">
              <span v-if="user.isActive" class="inline-flex items-center text-green-600 dark:text-green-400 text-xs font-bold">
                <span class="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-1.5"></span>
                Active
              </span>
              <span v-else class="inline-flex items-center text-gray-500 dark:text-gray-400 text-xs font-bold">
                <span class="w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
                Inactive
              </span>
            </td>
            <td class="py-3 pr-2 text-right">
              <div class="flex items-center justify-end space-x-2">
                <button 
                  @click="emit('editUser', user)" 
                  :disabled="usersStore.isLoading"
                  class="text-gray-400 dark:text-gray-500 hover:text-vibes-500 dark:hover:text-vibes-400 p-1 rounded hover:bg-vibes-50 dark:hover:bg-vibes-900/30 transition-colors disabled:opacity-50"
                  title="Edit User"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button 
                  @click="removeUser(user.id)" 
                  :disabled="usersStore.isLoading"
                  class="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                  title="Delete User"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
