import { vi } from 'vitest'

// Mock Nuxt auto-imports
global.useCookie = vi.fn((name: string, options?: any) => {
  const value = { value: null }
  return value
})

global.useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBaseUrl: '/api',
  },
}))

global.useNuxtApp = vi.fn(() => ({
  runWithContext: vi.fn((fn: any) => fn()),
}))

global.navigateTo = vi.fn()

global.defineStore = vi.fn((name: string, config: any) => {
  return config
})

// Mock console methods to reduce noise in tests
const originalConsole = { ...console }
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}
