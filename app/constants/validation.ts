// Validation Constants

/** Email validation regex (RFC 5322 simplified) */
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/** Maximum email length */
export const MAX_EMAIL_LENGTH = 254

/** Maximum local part length (before @) */
export const MAX_EMAIL_LOCAL_LENGTH = 64

/** Password requirements */
export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
} as const

/** Special characters regex */
export const SPECIAL_CHARS_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/

/** USSD code patterns */
export const USSD = {
  CODE_REGEX: /[*#]/,
  MAX_CODE_LENGTH: 20,
  BASE_CODE: '*820',
} as const
