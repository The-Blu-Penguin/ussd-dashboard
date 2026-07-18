import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { useMerchantsStore } from '~/stores/merchants'
import type { Directory, ApiResponse } from '~/types/api'

interface DirectoryState {
  directories: Directory[]
  isLoading: boolean
  error: string | null
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
  /** The query that produced the current `directories`, or null when they
   *  come from the unfiltered list. Both the Merchants and Allocate pages
   *  share this store, so this lets a page detect that the data belongs to
   *  a search made on the other page and refetch instead of reusing it. */
  activeSearchQuery: string | null
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
    activeSearchQuery: null,
  }),
  actions: {
    async fetchDirectories(forceRefresh = false, page = 0, size = 20): Promise<{ success: boolean; message: string }> {
      // Backend enforces a max page size of 100
      const maxPageSize = 100
      const safeSize = Math.min(size, maxPageSize)

      // If we already have data and aren't forcing a refresh, skip the fetch
      // But allow refetch if page or size changed, or if the current data was
      // produced by a search (it belongs to another page's search, not this list)
      if (this.directories.length > 0 && !forceRefresh && !this.activeSearchQuery && page === this.currentPage && safeSize === this.pageSize) {
        return { success: true, message: 'Directories already loaded' }
      }

      this.isLoading = true
      this.error = null

      try {
        const api = useApi()

        // Fetch directories without fullResponse=true to prevent backend NPE
        const response = await api<any>(`/directory?page=${page}&size=${safeSize}`, {
          method: 'GET',
        })

        if (response.success && response.data) {
          // The response has pagination info in data.content
          const { content, totalPages, totalElements, number, size: pageSize } = response.data

          if (Array.isArray(content)) {
            // Log the first item to debug the exact structure returned by the API
            if (content.length > 0) {
              console.log('[DEBUG] First raw directory item from API:', JSON.stringify(content[0], null, 2))
            }
            // Map the response
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

            // Fetch merchant names in batch to populate names correctly
            const merchantsStore = useMerchantsStore()
            const merchantCodes = this.directories
              .map(dir => dir.merchantCode)
              .filter(Boolean) as string[]

            if (merchantCodes.length > 0) {
              const merchantNames = await merchantsStore.fetchMerchantNamesBatch(merchantCodes)
              this.directories.forEach(dir => {
                if (dir.merchantCode && merchantNames[dir.merchantCode]) {
                  dir.merchantName = merchantNames[dir.merchantCode]
                }
              })
            }

            // Update pagination info
            this.totalPages = totalPages || 0
            this.totalElements = totalElements || 0
            this.currentPage = number || 0
            this.pageSize = safeSize
          } else {
            this.directories = []
          }

          // Data now comes from the unfiltered list, not a search
          this.activeSearchQuery = null
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

        const safeSize = Math.min(size, 100)
        const encodedQuery = encodeURIComponent(query)
        const response = await api<any>(`/directory?search=${encodedQuery}&page=${page}&size=${safeSize}`, {
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

            // Fetch merchant names in batch
            const merchantsStore = useMerchantsStore()
            const merchantCodes = this.directories
              .map(dir => dir.merchantCode)
              .filter(Boolean) as string[]

            if (merchantCodes.length > 0) {
              const merchantNames = await merchantsStore.fetchMerchantNamesBatch(merchantCodes)
              this.directories.forEach(dir => {
                if (dir.merchantCode && merchantNames[dir.merchantCode]) {
                  dir.merchantName = merchantNames[dir.merchantCode]
                }
              })
            }

            this.totalPages = totalPages || 0
            this.totalElements = totalElements || 0
            this.currentPage = number || 0
            this.pageSize = safeSize
          } else {
            this.directories = []
            this.totalElements = 0
          }

          // Remember which query produced these results so that pages sharing
          // this store don't mistake search results for the full list
          this.activeSearchQuery = query
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
    },

    /**
     * Fetches ALL directories across all pages (200 per request) without
     * modifying store state. Used exclusively for full-data CSV exports.
     */
    async fetchAllForExport(): Promise<Directory[]> {
      const PAGE_SIZE = 100
      const api = useApi()
      const allItems: Directory[] = []

      try {
        // First request — get total count and first batch
        const first = await api<any>(`/directory?page=0&size=${PAGE_SIZE}`, { method: 'GET' })
        if (!first.success || !first.data?.content) return []

        const totalPages: number = first.data.totalPages ?? 1

        const mapItem = (item: any): Directory => ({
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
        })

        allItems.push(...first.data.content.map(mapItem))

        // Fetch remaining pages in parallel (batches of 5 to be polite)
        for (let page = 1; page < totalPages; page++) {
          const res = await api<any>(`/directory?page=${page}&size=${PAGE_SIZE}`, { method: 'GET' })
          if (res.success && res.data?.content) {
            allItems.push(...res.data.content.map(mapItem))
          }
        }

        // Batch fetch merchant names for all export items
        const merchantsStore = useMerchantsStore()
        const merchantCodes = allItems
          .map(dir => dir.merchantCode)
          .filter(Boolean) as string[]

        if (merchantCodes.length > 0) {
          const merchantNames = await merchantsStore.fetchMerchantNamesBatch(merchantCodes)
          allItems.forEach(dir => {
            if (dir.merchantCode && merchantNames[dir.merchantCode]) {
              dir.merchantName = merchantNames[dir.merchantCode]
            }
          })
        }

        return allItems
      } catch (error: any) {
        console.error('fetchAllForExport failed:', error)
        return []
      }
    }
  }
})