import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false as boolean,
  }),
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      this.updateDocumentClass()
    },
    updateDocumentClass() {
      if (import.meta.client) {
        if (this.isDark) {
          document.documentElement.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        } else {
          document.documentElement.classList.remove('dark')
          localStorage.setItem('theme', 'light')
        }
      }
    },
    initTheme() {
      if (import.meta.client) {
        const savedTheme = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
          this.isDark = true
          document.documentElement.classList.add('dark')
        } else {
          this.isDark = false
          document.documentElement.classList.remove('dark')
        }
      }
    },
  },
})