<script setup lang="ts">
import { ref } from 'vue'
import { Camera, Lock, UserPlus, Trash2, Mail, Shield } from 'lucide-vue-next'
import Button from '~/components/ui/Button.vue'

const profileImage = ref('https://i.pravatar.cc/150?img=11')
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const isUpdatingPassword = ref(false)
const isAddingUser = ref(false)

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'Viewer'
})

const users = ref([
  { id: 1, name: 'Admin User', email: 'admin@vibes.com', role: 'Admin', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: 'Support Agent', email: 'support@vibes.com', role: 'Viewer', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, name: 'Developer', email: 'dev@vibes.com', role: 'Editor', avatar: 'https://i.pravatar.cc/150?img=3' },
])

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        profileImage.value = e.target.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

const handlePasswordChange = async () => {
  isUpdatingPassword.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Logic to change password
  console.log('Password change requested', passwordForm.value)
  // Reset form
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  isUpdatingPassword.value = false
}

const handleAddUser = async () => {
  if (!newUser.value.name || !newUser.value.email || !newUser.value.password) return
  
  isAddingUser.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  
  users.value.push({
    id: Date.now(),
    name: newUser.value.name,
    email: newUser.value.email,
    role: newUser.value.role,
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
  })
  
  newUser.value = { name: '', email: '', password: '', role: 'Viewer' }
  isAddingUser.value = false
}

const removeUser = (id: number) => {
  users.value = users.value.filter(u => u.id !== id)
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
            <label class="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
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
            <input
              id="current-password"
              v-model="passwordForm.currentPassword"
              class="appearance-none border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="password"
              placeholder="•••••••"
            >
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-2" for="new-password">
              New Password
            </label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              class="appearance-none border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="password"
              placeholder="•••••••"
            >
          </div>
          
          <div class="mb-6">
            <label class="block text-gray-700 dark:text-gray-300 text-xs font-bold mb-2" for="confirm-password">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              class="appearance-none border border-gray-200 dark:border-gray-700 dark:bg-gray-900/50 rounded-lg w-full py-2.5 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="password"
              placeholder="•••••••"
            >
          </div>
          
          <div class="flex justify-end">
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
                class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="John Doe"
              />
            </div>
            <div class="sm:col-span-2 lg:col-span-1">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
              <input 
                v-model="newUser.email"
                type="email" 
                class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="john@example.com"
              />
            </div>
            <div class="sm:col-span-2 lg:col-span-1">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Password</label>
              <input 
                v-model="newUser.password"
                type="password" 
                class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="•••••••"
              />
            </div>
            <div class="sm:col-span-1 lg:col-span-1">
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Role</label>
              <select 
                v-model="newUser.role"
                class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
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
              <tr v-for="user in users" :key="user.id" class="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors group">
                <td class="py-3 pl-2">
                  <div class="flex items-center">
                    <img :src="user.avatar" class="w-8 h-8 rounded-full mr-3 object-cover" />
                    <div>
                      <p class="font-bold text-gray-800 dark:text-gray-100">{{ user.name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                    {{ user.role }}
                  </span>
                </td>
                <td class="py-3">
                  <span class="inline-flex items-center text-green-600 dark:text-green-400 text-xs font-bold">
                    <span class="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full mr-1.5"></span>
                    Active
                  </span>
                </td>
                <td class="py-3 pr-2 text-right">
                  <button @click="removeUser(user.id)" class="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
