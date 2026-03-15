<script setup>
import { ref } from 'vue'
import { Camera, Lock } from 'lucide-vue-next'

const profileImage = ref('https://i.pravatar.cc/150?img=11')
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handlePasswordChange = () => {
  // Logic to change password
  console.log('Password change requested', passwordForm.value)
  // Reset form
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Profile Picture Section -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Profile Picture</h2>
        <div class="flex flex-col items-center">
          <div class="relative w-32 h-32 mb-6 group">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
              <img :src="profileImage" alt="Profile" class="w-full h-full object-cover" />
            </div>
            <label class="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
              <Camera class="w-5 h-5" />
              <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
            </label>
          </div>
          <p class="text-sm text-gray-500 text-center max-w-xs">
            Upload a new avatar. Recommended size 150x150px. JPG, PNG or GIF allowed.
          </p>
        </div>
      </div>

      <!-- Change Password Section -->
      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <div class="flex items-center mb-4">
          <Lock class="w-5 h-5 text-gray-400 mr-2" />
          <h2 class="text-lg font-bold text-gray-800">Change Password</h2>
        </div>
        
        <form @submit.prevent="handlePasswordChange">
          <div class="mb-4">
            <label class="block text-gray-700 text-xs font-bold mb-2" for="current-password">
              Current Password
            </label>
            <input
              id="current-password"
              v-model="passwordForm.currentPassword"
              class="appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="password"
              placeholder="•••••••"
            >
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-xs font-bold mb-2" for="new-password">
              New Password
            </label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              class="appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="password"
              placeholder="•••••••"
            >
          </div>
          
          <div class="mb-6">
            <label class="block text-gray-700 text-xs font-bold mb-2" for="confirm-password">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              class="appearance-none border border-gray-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              type="password"
              placeholder="•••••••"
            >
          </div>
          
          <div class="flex justify-end">
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 shadow-sm text-sm" type="submit">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
