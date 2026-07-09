<script setup lang="ts">
import { ref, computed } from 'vue'
import { Camera } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useUsersStore } from '~/stores/users'

const authStore = useAuthStore()
const usersStore = useUsersStore()

const profileImage = ref<string | null>(authStore.user?.avatarUrl || null)

const userInitials = computed(() => {
  const name = authStore.user?.fullName || ''
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const avatarColor = computed(() => {
  const name = authStore.user?.fullName || 'User'
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
})

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      if (e.target?.result) {
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
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-transparent dark:border-gray-700">
    <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Profile Avatar</h2>
    <div class="flex flex-col items-center">
      <div class="relative w-32 h-32 mb-6 group">
        <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center" :class="profileImage ? '' : avatarColor">
          <img v-if="profileImage" :src="profileImage" alt="Profile" class="w-full h-full object-cover" />
          <span v-else class="text-4xl font-bold text-white select-none">{{ userInitials }}</span>
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
</template>
