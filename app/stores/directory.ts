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

        console.log('[DirectoryStore] Fetching /directory…')

        const response = await api<ApiResponse<Directory[]>>('/directory', {
          method: 'GET',
        })

        console.log('[DirectoryStore] Raw API response:', JSON.parse(JSON.stringify(response)))
        console.log('[DirectoryStore] response.success:', response.success, '| typeof response.data:', typeof response.data, '| isArray:', Array.isArray(response.data))

        if (response.success && response.data) {
          // Normalise: API may return an array directly, or wrap it in an object
          const raw = response.data as any

          // Log the actual keys so we know what the API is returning
          if (!Array.isArray(raw)) {
            console.log('[DirectoryStore] response.data is an object. Keys:', Object.keys(raw))
            console.log('[DirectoryStore] response.data full value:', JSON.parse(JSON.stringify(raw)))
          }

          // Try every common wrapper key in order
          const ARRAY_KEYS = ['directories', 'data', 'content', 'items', 'result', 'list', 'records'] as const
          let resolved: Directory[] = []

          if (Array.isArray(raw)) {
            resolved = raw
          } else {
            for (const key of ARRAY_KEYS) {
              if (Array.isArray(raw[key])) {
                console.log(`[DirectoryStore] Found array under key "${key}"`)
                resolved = raw[key]
                break
              }
            }
          }

          this.directories = resolved

          console.log('[DirectoryStore] Normalised directories count:', this.directories.length)
          console.log('[DirectoryStore] First directory entry (if any):', this.directories[0] ?? 'EMPTY')

          // Mark main loading as complete so UI can show the table incrementally
          this.isLoading = false
          
          // Fetch merchant names using the merchant store (with caching and deduplication)
          const merchantsStore = useMerchantsStore()
          const merchantCodes = this.directories
            .map(dir => dir.merchantCode)
            .filter(Boolean) as string[]
          
          console.log('[DirectoryStore] Merchant codes to enrich:', merchantCodes)

          if (merchantCodes.length > 0) {
            // Fetch all merchant names in batch (or parallel with deduplication)
            const merchantNames = await merchantsStore.fetchMerchantNamesBatch(merchantCodes)

            console.log('[DirectoryStore] Merchant names returned:', merchantNames)
            
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

            console.log('[DirectoryStore] Directories after merchant-name enrichment:', this.directories.map(d => ({ id: d.id, ussdCode: d.ussdCode, merchantName: d.merchantName })))
          } else {
            console.warn('[DirectoryStore] No merchant codes found — merchant names will not be enriched.')
          }
          
          return { success: true, message: response.message }
        } else {
          console.error('[DirectoryStore] Fetch failed — success:', response.success, '| message:', response.message, '| data:', response.data)
          this.error = response.message || 'Failed to fetch directories'
          this.isLoading = false
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        console.error('[DirectoryStore] Exception during fetch:', error)
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