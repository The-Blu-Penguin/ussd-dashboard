import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { useMerchantsStore } from '~/stores/merchants'
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
          
          // Fetch merchant names using the merchant store (with caching and deduplication)
          const merchantsStore = useMerchantsStore()
          const merchantCodes = this.directories
            .map(dir => dir.merchantCode)
            .filter(Boolean) as string[]
          
          if (merchantCodes.length > 0) {
            // Fetch all merchant names in batch (or parallel with deduplication)
            const merchantNames = await merchantsStore.fetchMerchantNamesBatch(merchantCodes)
            
            // Update directories with merchant names
            this.directories.forEach((dir, index) => {
              if (dir.merchantCode) {
                const merchantName = merchantNames[dir.merchantCode]
                const directory = this.directories[index]
                if (merchantName && directory) {
                  directory.merchantName = merchantName
                }
              }
            })
          }
          
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
          // Only refresh the list if the allocation was truly successful
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
    },
    
    async deleteDirectory(id: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()

        const response = await api<ApiResponse<any>>(`/directory/${id}`, {
          method: 'DELETE',
        })

        if (response.success || response.success !== false) {
          // Remove from local state
          this.directories = this.directories.filter(dir => dir.id !== id)
          this.isLoading = false
          return { success: true, message: response.message || 'Directory deleted successfully' }
        } else {
          this.error = response.message || 'Failed to delete directory'
          this.isLoading = false
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        // If it's a 200 OK but failed to parse JSON (empty response body), treat it as success
        if (error.response && error.response.status === 200) {
          this.directories = this.directories.filter(dir => dir.id !== id)
          this.isLoading = false
          return { success: true, message: 'Directory deleted successfully' }
        }
        
        this.error = error.response?._data?.message || error.message || 'Failed to delete directory'
        this.isLoading = false
        return { success: false, message: this.error }
      }
    }
  }
})