import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import type { MenuConfigFlow, CreateMenuConfigRequest, ApiResponse } from '~/types/api'

interface MenuConfigsState {
  configs: MenuConfigFlow[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

export const useMenuConfigsStore = defineStore('menuConfigs', {
  state: (): MenuConfigsState => ({
    configs: [],
    isLoading: false,
    isSaving: false,
    error: null,
  }),
  actions: {
    async fetchConfigs(forceRefresh = false) {
      if (this.configs.length > 0 && !forceRefresh) {
        return { success: true, message: 'Configs already loaded' }
      }

      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()

        const response = await api<ApiResponse<MenuConfigFlow[]>>('/menuConfigFlow', {
          method: 'GET',
        })

        if (response.success && response.data) {
          this.configs = response.data
          return { success: true, message: response.message }
        } else {
          this.error = response.message || 'Failed to fetch menu configs'
          return { success: false, message: this.error }
        }
      } catch (error: any) {
        this.error = error.response?._data?.message || error.message || 'Failed to fetch menu configs'
        return { success: false, message: this.error }
      } finally {
        this.isLoading = false
      }
    },
    
    async getConfigById(id: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()

        const response = await api<ApiResponse<MenuConfigFlow>>(`/menuConfigFlow/${id}`, {
          method: 'GET',
        })

        if (response.success && response.data) {
          return { success: true, message: response.message, data: response.data }
        } else {
          return { success: false, message: response.message || 'Failed to fetch menu config details' }
        }
      } catch (error: any) {
        const message = error.response?._data?.message || error.message || 'Failed to fetch menu config details'
        return { success: false, message }
      } finally {
        this.isLoading = false
      }
    },
    
    async saveConfig(data: CreateMenuConfigRequest) {
      this.isSaving = true
      this.error = null
      
      try {
        const api = useApi()

        const response = await api<ApiResponse<MenuConfigFlow>>('/menuConfigFlow', {
          method: 'POST',
          body: data,
        })

        if (response.success && response.data) {
          // Add the new config to the local state
          this.configs.push(response.data)
          return { success: true, message: response.message || 'Menu config saved successfully', data: response.data }
        } else {
          return { success: false, message: response.message || 'Failed to save menu config' }
        }
      } catch (error: any) {
        const message = error.response?._data?.message || error.message || 'Failed to save menu config'
        return { success: false, message }
      } finally {
        this.isSaving = false
      }
    },
    
    async deleteConfig(id: string) {
      this.isLoading = true
      this.error = null
      
      try {
        const api = useApi()

        const response = await api<ApiResponse<void>>(`/menuConfigFlow/${id}`, {
          method: 'DELETE',
        })

        // If there's no response body (undefined) but it didn't throw an error, it was a 200 OK.
        // Or if there is a body, verify success is not explicitly false.
        if (!response || response.success !== false) {
          // Remove from local state
          this.configs = this.configs.filter(config => config.id !== id)
          return { success: true, message: response?.message || 'Menu config deleted successfully' }
        } else {
          return { success: false, message: response?.message || 'Failed to delete menu config' }
        }
      } catch (error: any) {
        // If it's a 200 OK but failed to parse JSON (empty response body), treat it as success
        if (error.response && error.response.status === 200) {
          this.configs = this.configs.filter(config => config.id !== id)
          return { success: true, message: 'Menu config deleted successfully' }
        }
        
        const message = error.response?._data?.message || error.message || 'Failed to delete menu config'
        return { success: false, message }
      } finally {
        this.isLoading = false
      }
    },

    async updateConfig(id: string, data: Partial<CreateMenuConfigRequest>) {
      this.isSaving = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string
        const authStore = useAuthStore()

        const response = await $fetch<ApiResponse<MenuConfigFlow>>(`${baseUrl}/menuConfigFlow/${id}`, {
          method: 'PATCH',
          body: data,
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        })

        if (response.success && response.data) {
          // Update the config in local state
          const index = this.configs.findIndex(c => c.id === id)
          if (index !== -1) {
            this.configs[index] = response.data
          }
          return { success: true, message: response.message || 'Menu config updated successfully', data: response.data }
        } else {
          return { success: false, message: response.message || 'Failed to update menu config' }
        }
      } catch (error: any) {
        const message = error.response?._data?.message || error.message || 'Failed to update menu config'
        return { success: false, message }
      } finally {
        this.isSaving = false
      }
    }
  }
})
