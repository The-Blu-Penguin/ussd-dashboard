import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { Directory, ApiResponse } from '~/types/api'

interface DirectoryState {
  directories: Directory[]
  isLoading: boolean
  error: string | null
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

export const useDirectoryStore = defineStore('directory', {
  state: (): DirectoryState => ({
    directories: [],
    isLoading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    pageSize: 20,
  }),
  actions: {
    async fetchDirectories(forceRefresh = false, page = 0, size = 20) {
      // Backend has a maximum page size of 20
      const maxPageSize = 20
      const safeSize = Math.min(size, maxPageSize)
      
      // If we already have data and aren't forcing a refresh, skip the fetch
      // But allow refetch if page or size changed
      if (this.directories.length > 0 && !forceRefresh && page === this.currentPage && safeSize === this.pageSize) {
        return { success: true, message: 'Directories already loaded' }
      }

      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()

        // Use the new endpoint with fullResponse=true to get merchant names directly
        const response = await api<any>(`/directory?page=${page}&size=${safeSize}&fullResponse=true`, {
          method: 'GET',
        })

        if (response.success && response.data) {
          // The response has pagination info in data.content
          const { content, totalPages, totalElements, number, size: pageSize } = response.data
          
          if (Array.isArray(content)) {
            // Map the response to extract merchant names from merchantData
            this.directories = content.map((item: any) => ({
              id: item.id,
              merchantCode: item.merchantData?.merchant?.merchantCode || item.merchantCode,
              merchantName: item.merchantData?.merchant?.merchantName || 'Unknown',
              assignedCode: item.assignedCode,
              ussdCode: item.ussdCode,
              menuConfig: item.menuConfig,
              menuConfigFlowId: item.menuConfigFlow?.id || item.menuConfigFlowId,
              parentDirectoryId: item.parentDirectoryId,
              parentUssdCode: item.parentUssdCode,
              path: item.path,
              level: item.level,
              status: item.status,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              childrenCount: item.childrenCount || 0,
              createdBy: item.createdBy,
            }))
            
            // Update pagination info
            this.totalPages = totalPages || 0
            this.totalElements = totalElements || 0
            this.currentPage = number || 0
            this.pageSize = safeSize
          } else {
            this.directories = []
          }

          this.isLoading = false
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
    },
    
    async searchByUssdCode(ussdCode: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()
        
        // Encode the USSD code for URL (handles special characters like # and *)
        const encodedCode = encodeURIComponent(ussdCode)
        const response = await api<any>(`/directory/ussd?code=${encodedCode}`, {
          method: 'GET',
        })

        if (response.success && response.data) {
          // Transform single result to match directory format
          const directory: Directory = {
            id: response.data.id,
            merchantCode: response.data.merchantData?.merchant?.merchantCode || '',
            merchantName: response.data.merchantData?.merchant?.merchantName || 'Unknown',
            assignedCode: response.data.assignedCode,
            ussdCode: response.data.ussdCode,
            menuConfig: response.data.menuConfig,
            menuConfigFlowId: response.data.menuConfigFlow?.id || '',
            parentDirectoryId: response.data.parentDirectoryId,
            parentUssdCode: response.data.parentUssdCode,
            path: response.data.path,
            level: response.data.level,
            status: response.data.status,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
            childrenCount: 0,
            createdBy: response.data.menuConfigFlow?.createdBy,
          }
          
          this.isLoading = false
          return { success: true, data: directory, message: response.message }
        } else {
          this.error = response.message || 'USSD code not found'
          this.isLoading = false
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.response?._data?.message || error.message || 'Failed to search by USSD code'
        this.isLoading = false
        return { success: false, message: this.error }
      }
    }
  }
})