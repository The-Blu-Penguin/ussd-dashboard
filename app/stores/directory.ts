import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Directory, ApiResponse } from '~/types/api'

interface DirectoryState {
  directories: Directory[]
  isLoading: boolean
  error: string | null
}

export const useDirectoryStore = defineStore('directory', {
  state: (): DirectoryState => ({
    directories: [],
    isLoading: false,
    error: null,
  }),
  actions: {
    async fetchDirectories() {
      this.isLoading = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string
        const authStore = useAuthStore()

        const response = await $fetch<ApiResponse<Directory[]>>(`${baseUrl}/directory`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        })

        if (response.success && response.data) {
          this.directories = response.data
          return { success: true, message: response.message }
        } else {
          this.error = response.message || 'Failed to fetch directories'
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.response?._data?.message || error.message || 'Failed to fetch directories'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    }
  }
})