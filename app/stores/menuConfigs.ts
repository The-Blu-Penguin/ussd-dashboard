import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
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
    async fetchConfigs() {
      this.isLoading = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string
        const authStore = useAuthStore()

        const response = await $fetch<ApiResponse<MenuConfigFlow[]>>(`${baseUrl}/menuConfigFlow`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
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
    
    async saveConfig(data: CreateMenuConfigRequest) {
      this.isSaving = true
      this.error = null
      
      try {
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string
        const authStore = useAuthStore()

        const response = await $fetch<ApiResponse<MenuConfigFlow>>(`${baseUrl}/menuConfigFlow`, {
          method: 'POST',
          body: data,
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
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
        const config = useRuntimeConfig()
        const baseUrl = config.public.apiBaseUrl as string
        const authStore = useAuthStore()

        const response = await $fetch<ApiResponse>(`${baseUrl}/menuConfigFlow/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        })

        if (response.success) {
          // Remove from local state
          this.configs = this.configs.filter(config => config.id !== id)
          return { success: true, message: response.message || 'Menu config deleted successfully' }
        } else {
          return { success: false, message: response.message || 'Failed to delete menu config' }
        }
      } catch (error: any) {
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