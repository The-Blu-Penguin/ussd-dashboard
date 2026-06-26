import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { validatePassword } from '~/utils/passwordValidation'
import type { User, ApiResponse, DeleteUserResponseData, UpdateUserRequest, UserRole } from '~/types/api'

export interface RegisterUserRequest {
  email: string
  fullName: string
  password: string
  avatarUrl?: string
  role: UserRole
}

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
    async fetchUsers(forceRefresh = false) {
      if (this.users.length > 0 && !forceRefresh) {
        return { success: true, message: 'Users already loaded' }
      }

      this.isLoading = true
      this.error = null

      try {
        const api = useApi()

        const response = await api<ApiResponse<User[]>>('/users', {
          method: 'GET',
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

    async registerUser(data: RegisterUserRequest) {
      this.isLoading = true
      this.error = null

      const validation = validatePassword(data.password)
      if (!validation.isValid) {
        this.isLoading = false
        return {
          success: false,
          message: 'Password does not meet requirements',
          errors: validation.errors,
        }
      }

      try {
        const api = useApi()

        const response = await api<ApiResponse<User>>('/auth/register', {
          method: 'POST',
          body: data,
        })

        if (response.success && response.data) {
          this.users.push(response.data)
          return { success: true, message: response.message || 'User added successfully', data: response.data }
        }
        return { success: false, message: response.message || 'Failed to add user' }
      } catch (error: any) {
        const message = error.response?._data?.message || error.message || 'Failed to add user'
        this.error = message
        return { success: false, message }
      } finally {
        this.isLoading = false
      }
    },

    async deleteUser(userId: string) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApi()

        const response = await api<ApiResponse<DeleteUserResponseData>>(`/users/${userId}`, {
          method: 'DELETE',
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

    async updateUser(userId: string, data: UpdateUserRequest, onCurrentUserUpdate?: (user: User) => void) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApi()

        const response = await api<ApiResponse<User>>(`/users/${userId}`, {
          method: 'PUT',
          body: data,
        })

        if (response.success && response.data) {
          // Update the user in the local state
          const index = this.users.findIndex(user => user.id === userId)
          if (index !== -1) {
            this.users[index] = response.data
          }

          // Notify caller if this is the current user (via callback)
          if (onCurrentUserUpdate) {
            onCurrentUserUpdate(response.data)
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
  },
})
