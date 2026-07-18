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
    async fetchDirectories(forceRefresh = false, page = 0, size = 20): Promise<{ success: boolean; message: string }> {
      // Backend now supports larger page sizes
      const maxPageSize = 200
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
          return { success: true, message: response.message || 'Directories loaded successfully' }
        } else {
          const errorMsg = response.message || 'Failed to fetch directories'
          this.error = errorMsg
          this.isLoading = false
          return { success: false, message: errorMsg }
        }
      } catch (error: any) {
        const errorMessage = error.response?._data?.message || error.message || 'Failed to fetch directories'
        this.error = errorMessage
        this.isLoading = false
        return { success: false, message: errorMessage }
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
    
    async updateDirectory(id: string, payload: { merchantCode: string; menuConfigFlowId: string }) {
      this.isLoading = true
      this.error = null

      try {
        const api = useApi()

        const response = await api<any>(`/directory/${id}`, {
          method: 'PATCH',
          body: payload,
        })

        if (response.success) {
          await this.fetchDirectories(true)
          return { success: true, message: response.message || 'Directory updated successfully' }
        } else {
          this.error = response.message || 'Failed to update directory'
          this.isLoading = false
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.response?._data?.message || error.message || 'Failed to update directory'
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
    
    async searchDirectories(query: string, page = 0, size = 20) {
      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()
        
        const encodedQuery = encodeURIComponent(query)
        const response = await api<any>(`/directory?search=${encodedQuery}&page=${page}&size=${size}&fullResponse=true`, {
          method: 'GET',
        })

        if (response.success && response.data) {
          const { content, totalPages, totalElements, number, size: pageSize } = response.data
          
          if (Array.isArray(content)) {
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
            
            this.totalPages = totalPages || 0
            this.totalElements = totalElements || 0
            this.currentPage = number || 0
            this.pageSize = pageSize || size
          } else {
            this.directories = []
            this.totalElements = 0
          }

          this.isLoading = false
          return { success: true, message: response.message || 'Search completed' }
        } else {
          this.error = response.message || 'Search failed'
          this.isLoading = false
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.response?._data?.message || error.message || 'Failed to search directories'
        this.isLoading = false
        return { success: false, message: this.error }
      }
    }
  }
})