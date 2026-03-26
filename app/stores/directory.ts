import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
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
    async fetchDirectories(forceRefresh = false) {
      // If we already have data and aren't forcing a refresh, skip the fetch
      if (this.directories.length > 0 && !forceRefresh) {
        return { success: true, message: 'Directories already loaded' }
      }

      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()

        const response = await api<ApiResponse<Directory[]>>('/directory', {
          method: 'GET',
        })

        if (response.success && response.data) {
          // Initialize directories
          this.directories = response.data
          // Mark main loading as complete so UI can show the table incrementally
          this.isLoading = false
          
          // Fetch merchant names for each directory concurrently without blocking the UI
          const merchantPromises = this.directories.map(async (dir, index) => {
            if (dir.merchantCode) {
              try {
                const merchantResponse = await api<MerchantApiResponse>(`/merchants/${dir.merchantCode}`, {
                  method: 'GET',
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
          
          // Wait for all merchant details to load silently in background
          await Promise.all(merchantPromises)
          
          return { success: true, message: response.message }
        } else {
          this.error = response.message || 'Failed to fetch directories'
          this.isLoading = false
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.response?._data?.message || error.message || 'Failed to fetch directories'
        this.isLoading = false
        return { success: false, message: this.error }
      }
    },
    
    async allocateCode(payload: {
      merchantCode: string
      codeToAssign: number
      parentCode?: number
      level: string
      methodOfAllocation: string
      menuConfigFlowId: string
    }) {
      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()

        const response = await api<any>('/directory', {
          method: 'POST',
          body: payload,
        })

        if (response.success) {
          // Refresh the list to get the new allocation
          await this.fetchDirectories(true)
          return { success: true, message: response.message || 'Code allocated successfully' }
        } else {
          this.error = response.message || 'Failed to allocate code'
          this.isLoading = false
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.response?._data?.message || error.message || 'Failed to allocate code'
        this.isLoading = false
        return { success: false, message: this.error }
      }
    }
  }
})