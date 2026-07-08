// UI Constants

/** Toast notification durations (ms) */
export const TOAST_DURATIONS = {
  SUCCESS: 3000,
  ERROR: 4000,
  INFO: 3000,
  WARNING: 3500,
} as const

/** Pagination options */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100, 200],
  MAX_LOGS_IN_MEMORY: 500,
  LOG_PAGE_SIZE: 100,
} as const

/** Animation durations (ms) */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  FLOAT_MIN: 5000,
  FLOAT_MAX: 10000,
} as const

/** Breakpoints (px) */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const

/** Z-index layers */
export const Z_INDEX = {
  DROPDOWN: 10,
  MODAL: 50,
  TOAST: 100,
} as const
