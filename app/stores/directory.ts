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

        // Use fullResponse=true so the backend includes full merchant details (name) in each item
        const response = await api<any>(`/directory?page=${page}&size=${safeSize}&fullResponse=true`, {
          method: 'GET',
        })

        if (response.success && response.data) {
          // The response has pagination info in data.content
          const { content, totalPages, totalElements, number, size: pageSize } = response.data

          if (Array.isArray(content)) {
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

            // Backfill only the merchant names the directory response didn't include
            // (fullResponse=true provides most names, so this avoids N+1 fetches)
            const merchantsStore = useMerchantsStore()
            const missingCodes = this.directories
              .filter(dir => dir.merchantCode && dir.merchantName === 'Unknown')
              .map(dir => dir.merchantCode) as string[]

            if (missingCodes.length > 0) {
              const merchantNames = await merchantsStore.fetchMerchantNamesBatch(missingCodes)
              this.directories.forEach(dir => {
                const name = dir.merchantCode ? merchantNames[dir.merchantCode] : undefined
                if (name && name !== 'Unknown Merchant') {
                  dir.merchantName = name
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
        const response = await api<any>(`/directory?search=${encodedQuery}&page=${page}&size=${safeSize}&fullResponse=true`, {
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

            // Backfill only missing merchant names (avoids N+1 fetches)
            const merchantsStore = useMerchantsStore()
            const missingCodes = this.directories
              .filter(dir => dir.merchantCode && dir.merchantName === 'Unknown')
              .map(dir => dir.merchantCode) as string[]

            if (missingCodes.length > 0) {
              const merchantNames = await merchantsStore.fetchMerchantNamesBatch(missingCodes)
              this.directories.forEach(dir => {
                const name = dir.merchantCode ? merchantNames[dir.merchantCode] : undefined
                if (name && name !== 'Unknown Merchant') {
                  dir.merchantName = name
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
     * Fetches ALL directories across all pages (25 per request, fetched in
     * parallel batches, with a 5-row sub-page fallback for pages the backend
     * fails to serve) without modifying store state. Used exclusively for
     * full-data CSV exports.
     */
    async fetchAllForExport(): Promise<Directory[]> {
      // Verified live: fullResponse=true is REQUIRED (light rows omit
      // merchantData entirely → empty MID/Unknown names), but the backend
      // intermittently 500s after a fixed ~11s timeout — instantly at
      // size=998, and on deep-offset pages even at size=25. Strategy:
      // small pages, no client-side retries (each failed attempt already
      // costs ~11s server-side), and failed pages are retried as 5-row
      // sub-pages before the export gives up.
      const PAGE_SIZE = 25
      const FALLBACK_SIZE = 5
      const CHUNKS = PAGE_SIZE / FALLBACK_SIZE
      const api = useApi()
      const allItems: Directory[] = []

      // retry: 0 — a 500 here takes ~11s, so the default 2 automatic
      // retries would triple the wait without a better outcome
      const fetchPageSafe = async (page: number, size: number): Promise<any | null> => {
        try {
          const res = await api<any>(`/directory?page=${page}&size=${size}&fullResponse=true`, { method: 'GET', retry: 0 })
          return res.success && res.data?.content ? res : null
        } catch {
          return null
        }
      }

      /** Fetch one PAGE_SIZE page; on failure retry it as 5-row sub-pages. */
      const fetchPageWithFallback = async (page: number): Promise<{ content: any[]; meta: any } | null> => {
        const full = await fetchPageSafe(page, PAGE_SIZE)
        if (full) return { content: full.data.content, meta: full.data }

        const items: any[] = []
        let meta: any = null
        for (let c = 0; c < CHUNKS; c++) {
          const sub = await fetchPageSafe(page * CHUNKS + c, FALLBACK_SIZE)
          if (!sub) return null
          items.push(...sub.data.content)
          meta = meta ?? sub.data
        }
        return { content: items, meta }
      }

      try {
        // First request — get total count and first batch
        const first = await fetchPageWithFallback(0)
        if (!first) {
          throw new Error('Export fetch failed: the API could not serve the directory (HTTP 500) even at 5 rows per request. This looks like a backend issue — please try again later.')
        }

        const totalElements: number = first.meta?.totalElements ?? first.content.length
        const totalPages = Math.max(Math.ceil(totalElements / PAGE_SIZE), 1)

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

        allItems.push(...first.content.map(mapItem))

        // Fetch remaining pages concurrently in batches of 5 (keeps server
        // load polite while still being far faster than sequential paging)
        const remainingPages = Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => i + 1)
        const BATCH_SIZE = 5
        for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
          const batch = remainingPages.slice(i, i + BATCH_SIZE)
          const results = await Promise.all(batch.map(page => fetchPageWithFallback(page)))
          for (let r = 0; r < results.length; r++) {
            const result = results[r]
            if (!result) {
              throw new Error(`Export fetch failed: the API could not serve page ${batch[r]} even at ${FALLBACK_SIZE} rows per request (HTTP 500). This looks like a backend issue — please try again later.`)
            }
            allItems.push(...result.content.map(mapItem))
          }
        }

        // Backfill only missing merchant names for export items
        const merchantsStore = useMerchantsStore()
        const missingCodes = [...new Set(
          allItems
            .filter(dir => dir.merchantCode && dir.merchantName === 'Unknown')
            .map(dir => dir.merchantCode) as string[]
        )]

        if (missingCodes.length > 0) {
          const merchantNames = await merchantsStore.fetchMerchantNamesBatch(missingCodes)
          allItems.forEach(dir => {
            const name = dir.merchantCode ? merchantNames[dir.merchantCode] : undefined
            if (name && name !== 'Unknown Merchant') {
              dir.merchantName = name
            }
          })
        }

        return allItems
      } catch (error: any) {
        console.error('fetchAllForExport failed:', error)
        // Re-throw so callers surface the real API error instead of a
        // generic "no data" fallback
        throw error
      }
    }
  }
})