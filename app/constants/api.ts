// API Constants

/** Base URL for API requests */
export const API_BASE_URL = '/api'

/** Default request timeout in milliseconds */
export const API_TIMEOUT = 30000

/** Number of retry attempts for failed requests */
export const API_RETRY_ATTEMPTS = 2

/** Delay between retry attempts in milliseconds */
export const API_RETRY_DELAY = 1000

/** Cache TTL for GET requests in milliseconds (1 minute) */
export const API_CACHE_TTL = 60000

/** API endpoints (must match the Blu Penguin backend contract) */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    // Requires the user id: `/auth/${id}/change-password`
    CHANGE_PASSWORD: '/auth/:id/change-password',
  },
  USERS: '/users',
  DIRECTORIES: '/directory',
  MENU_CONFIGS: '/menuConfigFlow',
  MERCHANTS: '/merchants',
  SSE: '/sse',
  SANDBOX: '/ussd/sandbox',
} as const

/** Endpoints that should skip API response validation */
export const SKIP_VALIDATION_PATTERNS = [
  '/merchants/',
  '/directory/available-codes',
] as const

/** HTTP methods that change state */
export const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const
