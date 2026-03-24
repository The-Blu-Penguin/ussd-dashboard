import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Directory, ApiResponse, MerchantApiResponse } from '~/types/api'

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
          // Initialize directories
          this.directories = response.data
          
          // Fetch merchant names for each directory concurrently
          const merchantPromises = this.directories.map(async (dir, index) => {
            if (dir.merchantCode) {
              try {
                const merchantResponse = await $fetch<MerchantApiResponse>(`${baseUrl}/merchants/${dir.merchantCode}`, {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${authStore.accessToken}`,
                  },
                })
                
                if (merchantResponse.status === 'success' && merchantResponse.data?.merchant?.merchantName) {
                  if (this.directories[index]) {
                    this.directories[index].merchantName = merchantResponse.data.merchant.merchantName
                  }
                }
              } catch (e) {
                console.error(`Failed to fetch merchant details for code: ${dir.merchantCode}`, e)
              }
            }
          })
          
          // Wait for all merchant details to load before setting isLoading to false
          await Promise.all(merchantPromises)
          
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