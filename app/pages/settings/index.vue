<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Camera, Lock, UserPlus, Trash2, Mail, Shield, Eye, EyeOff, Edit2, X } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'
import { useAuthStore } from '~/stores/auth'
import { useUsersStore } from '~/stores/users'
import type { User } from '~/types/api'

const authStore = useAuthStore()
const usersStore = useUsersStore()

const profileImage = ref('https://i.pravatar.cc/150?img=11')
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const isUpdatingPassword = ref(false)
const passwordMessage = ref('')
const passwordError = ref(false)

const isAddingUser = ref(false)

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'Viewer'
})

const editingUser = ref<User | null>(null)
const editUserForm = ref({
  fullName: '',
  role: 'ADMIN' as 'ADMIN' | 'USER' | 'MERCHANT'
})
const isUpdatingUser = ref(false)

onMounted(() => {
  usersStore.fetchUsers()
})

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      if (e.target?.result) {
        // Just setting local preview for now, but also updating the API
        // In a real app you might want to upload the file to a storage service first
        // and then save the URL
        const base64Image = e.target.result as string
        profileImage.value = base64Image
        
        if (authStore.user?.id) {
          await usersStore.updateUser(authStore.user.id, {
            avatarUrl: base64Image
          })
        }
      }
    }
    reader.readAsDataURL(file)
  }
}

const handlePasswordChange = async () => {
  passwordMessage.value = ''
  passwordError.value = false

  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    passwordMessage.value = 'Please fill in all password fields.'
    passwordError.value = true
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'New passwords do not match.'
    passwordError.value = true
    return
  }

  isUpdatingPassword.value = true
  
  const result = await authStore.changePassword({
    currentPassword: passwordForm.value.currentPassword,
    newPassword: passwordForm.value.newPassword
  })
  
  if (result.success) {
    passwordMessage.value = result.message || 'Password changed successfully!'
    passwordError.value = false
    // Reset form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } else {
    passwordMessage.value = result.message || 'Failed to change password.'
    passwordError.value = true
  }
  
  isUpdatingPassword.value = false
}

const handleAddUser = async () => {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) return
  
  isAddingUser.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // TODO: Add API endpoint for creating user when available
  
  newUser.value = { name: '', email: '', password: '', role: 'Viewer' }
  isAddingUser.value = false
}

const openEditModal = (user: User) => {
  editingUser.value = user
  editUserForm.value = {
    fullName: user.fullName,
    role: user.role
  }
}

const closeEditModal = () => {
  editingUser.value = null
}

const handleUpdateUser = async () => {
  if (!editingUser.value || !editUserForm.value.fullName) return
  
  isUpdatingUser.value = true
  
  const result = await usersStore.updateUser(editingUser.value.id, {
    fullName: editUserForm.value.fullName,
    role: editUserForm.value.role
  })
  
  if (result.success) {
    closeEditModal()
  } else {
    alert(result.message)
  }
  
  isUpdatingUser.value = false
}

const removeUser = async (id: string) => {
  if (confirm('Are you sure you want to delete this user?')) {
    await usersStore.deleteUser(id)
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Profile Picture Section -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-700">
        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Profile Picture</h2>
        <div class="flex flex-col items-center">
          <div class="relative w-32 h-32 mb-6 group">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-sm">
              <img :src="profileImage" alt="Profile" class="w-full h-full object-cover" />
            </div>
            <label class="absolute bottom-0 right-0 bg-vibes-600 text-white p-2 rounded-full cursor-pointer hover:bg-vibes-700 transition-colors shadow-md">
              <Camera class="w-5 h-5" />
              <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
            </label>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
            Upload a new avatar. Recommended size 150x150px. JPG, PNG or GIF allowed.
          </p>
        </div>
      </div>

      <!-- Change Password Section -->
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
          
          <div class="flex items-center justify-between mt-6">
            <p v-if="passwordMessage" class="text-sm font-medium" :class="passwordError ? 'text-red-500' : 'text-green-500'">
              {{ passwordMessage }}
            </p>
            <div v-else class="flex-1"></div>
            
            <Button 
              type="submit" 
              variant="primary"
              :loading="isUpdatingPassword"
              class="shadow-sm ml-auto"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
      <!-- User Management Section -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm md:col-span-2 border border-transparent dark:border-gray-700">
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
              <tr v-if="usersStore.isLoading" class="border-b border-gray-50 dark:border-gray-700/50">
                <td colspan="4" class="py-6 text-center text-gray-500">Loading users...</td>
              </tr>
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
                      @click="openEditModal(user)" 
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
    </div>

    <!-- Edit User Modal -->
    <div v-if="editingUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="closeEditModal"></div>
      
      <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100 dark:border-gray-700">
        <!-- Modal Header -->
        <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">Edit User</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleUpdateUser" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
            <input 
              type="text" 
              :value="editingUser.email"
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
              <option value="MERCHANT">MERCHANT</option>
              <option value="USER">USER</option>
            </select>
          </div>

          <!-- Modal Footer -->
          <div class="pt-4 flex justify-end space-x-3">
            <button type="button" @click="closeEditModal" class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
  </div>
</template>
