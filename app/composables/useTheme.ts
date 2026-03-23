import { useThemeStore } from '~/stores/theme'

export const useTheme = () => {
  const themeStore = useThemeStore()

  const toggleTheme = () => {
    themeStore.toggleTheme()
  }

  const initTheme = () => {
    themeStore.initTheme()
  }

  return {
    isDark: computed(() => themeStore.isDark),
    toggleTheme,
    initTheme,
  }
}
