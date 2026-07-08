<script setup lang="ts">
import { ref } from 'vue'
import ProfileSection from '~/components/settings/ProfileSection.vue'
import PasswordSection from '~/components/settings/PasswordSection.vue'
import UserManagementSection from '~/components/settings/UserManagementSection.vue'
import EditUserModal from '~/components/settings/EditUserModal.vue'
import type { User } from '~/types/api'

const editingUser = ref<User | null>(null)

const openEditModal = (user: User) => {
  editingUser.value = user
}

const closeEditModal = () => {
  editingUser.value = null
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ProfileSection />
      <PasswordSection />
      <UserManagementSection @edit-user="openEditModal" />
    </div>

    <EditUserModal 
      :user="editingUser" 
      @close="closeEditModal" 
      @updated="closeEditModal" 
    />
  </div>
</template>
