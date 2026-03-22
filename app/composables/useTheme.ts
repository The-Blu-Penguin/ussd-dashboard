import { useState } from '#imports'

export const useTheme = () => {
  const isDark = useState<boolean>('theme-dark', () => false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme(isDark.value)
  }

  const updateTheme = (dark: boolean) => {
    if (import.meta.client) {
      if (dark) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    }
  }

  const initTheme = () => {
    if (import.meta.client) {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        isDark.value = true
        document.documentElement.classList.add('dark')
      } else {
        isDark.value = false
        document.documentElement.classList.remove('dark')
      }
    }
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}