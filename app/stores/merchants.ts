import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { MerchantApiResponse } from '~/types/api'

interface MerchantCache {
  [merchantCode: string]: {
    name: string
    timestamp: number
  }
}

interface MerchantsState {
  cache: MerchantCache
  pendingRequests: Map<string, Promise<string>>
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useMerchantsStore = defineStore('merchants', {
  state: (): MerchantsState => ({
    cache: {},
    pendingRequests: new Map(),
  }),
  
  getters: {
    getMerchantName: (state) => (merchantCode: string): string | null => {
      const cached = state.cache[merchantCode]
      if (!cached) return null
      
      // Check if cache is still valid
      if (Date.now() - cached.timestamp > CACHE_DURATION) {
        delete state.cache[merchantCode]
        return null
      }
      
      return cached.name
    },
  },
  
  actions: {
    async fetchMerchantName(merchantCode: string): Promise<string> {
      // Check cache first
      const cached = this.getMerchantName(merchantCode)
      if (cached) return cached
      
      // Check if request is already pending (deduplication)
      const pending = this.pendingRequests.get(merchantCode)
      if (pending) return pending
      
      // Create new request
      const requestPromise = this._fetchFromApi(merchantCode)
      this.pendingRequests.set(merchantCode, requestPromise)
      
      try {
        const name = await requestPromise
        return name
      } finally {
        this.pendingRequests.delete(merchantCode)
      }
    },
    
    async _fetchFromApi(merchantCode: string): Promise<string> {
      try {
        const api = useApi()
        const response = await api<MerchantApiResponse>(`/merchants/${merchantCode}`, {
          method: 'GET',
        })
        
        let merchantName = 'Unknown Merchant'
        
        if ((response.success || response.status === 'success') && response.data?.merchantName) {
          merchantName = response.data.merchantName
        } else if ((response.success || response.status === 'success') && response.data?.merchant?.merchantName) {
          merchantName = response.data.merchant.merchantName
        }
        
        // Cache the result
        this.cache[merchantCode] = {
          name: merchantName,
          timestamp: Date.now(),
        }
        
        return merchantName
      } catch (e) {
        console.error(`Failed to fetch merchant details for code: ${merchantCode}`, e)
        return 'Unknown Merchant'
      }
    },
    
    async fetchMerchantNamesBatch(merchantCodes: string[]): Promise<Record<string, string>> {
      // Filter out already cached merchants
      const uncachedCodes = merchantCodes.filter(code => !this.getMerchantName(code))
      
      if (uncachedCodes.length === 0) {
        // All merchants are cached
        const result: Record<string, string> = {}
        merchantCodes.forEach(code => {
          result[code] = this.getMerchantName(code) || 'Unknown Merchant'
        })
        return result
      }
      
      // TODO: When backend supports batch endpoint, use it:
      // const api = useApi()
      // const response = await api(`/merchants/batch?codes=${uncachedCodes.join(',')}`)
      
      // For now, fetch in parallel (better than sequential)
      const promises = uncachedCodes.map(code => this.fetchMerchantName(code))
      await Promise.all(promises)
      
      // Return all merchant names
      const result: Record<string, string> = {}
      merchantCodes.forEach(code => {
        result[code] = this.getMerchantName(code) || 'Unknown Merchant'
      })
      return result
    },
    
    clearCache() {
      this.cache = {}
    },
  },
})
