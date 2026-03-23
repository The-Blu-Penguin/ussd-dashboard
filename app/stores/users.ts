import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { User, ApiResponse, DeleteUserResponseData, UpdateUserRequest } from '~/types/api'

interface UsersState {
  users: User[]
  isLoading: boolean
  error: string | null
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchUsers() {
      this.isLoading = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string
        const authStore = useAuthStore()

        const response = await $fetch<ApiResponse<User[]>>(`${baseUrl}/users`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        })

        if (response.success && response.data) {
          this.users = response.data
          return { success: true, message: response.message }
        } else {
          this.error = response.message || 'Failed to fetch users'
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.response?._data?.message || error.message || 'Failed to fetch users'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },
    
    async deleteUser(userId: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string
        const authStore = useAuthStore()

        const response = await $fetch<ApiResponse<DeleteUserResponseData>>(`${baseUrl}/users/${userId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        })

        if (response.success) {
          // Remove the user from the local state
          this.users = this.users.filter(user => user.id !== userId)
          return { success: true, message: response.data?.message || response.message || 'User deleted successfully' }
        } else {
          return { success: false, message: response.message || 'Failed to delete user' }
        }
      } catch (error: any) {
        const message = error.response?._data?.message || error.message || 'Failed to delete user'
        return { success: false, message }
      } finally {
        this.isLoading = false
      }
    },

    async updateUser(userId: string, data: UpdateUserRequest) {
      this.isLoading = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string
        const authStore = useAuthStore()

        const response = await $fetch<ApiResponse<User>>(`${baseUrl}/users/${userId}`, {
          method: 'PUT',
          body: data,
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        })

        if (response.success && response.data) {
          // Update the user in the local state
          const index = this.users.findIndex(user => user.id === userId)
          if (index !== -1) {
            this.users[index] = response.data
          }
          
          // If the updated user is the currently logged in user, update the auth store too
          if (authStore.user?.id === userId) {
            authStore.setUser(response.data)
          }
          
          return { success: true, message: response.message || 'User updated successfully' }
        } else {
          return { success: false, message: response.message || 'Failed to update user' }
        }
      } catch (error: any) {
        const message = error.response?._data?.message || error.message || 'Failed to update user'
        return { success: false, message }
      } finally {
        this.isLoading = false
      }
    }
  }
})