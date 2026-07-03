import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validateEmailWithError,
  validateApiResponse,
  validateUser,
  validateLoginResponse,
  validateArray,
  safeValidateApiResponse,
  ValidationError,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
} from '~/utils/validation'

describe('Type Guards', () => {
  it('isString returns true for strings', () => {
    expect(isString('hello')).toBe(true)
    expect(isString('')).toBe(true)
  })

  it('isString returns false for non-strings', () => {
    expect(isString(123)).toBe(false)
    expect(isString(null)).toBe(false)
    expect(isString(undefined)).toBe(false)
    expect(isString({})).toBe(false)
  })

  it('isNumber returns true for numbers', () => {
    expect(isNumber(42)).toBe(true)
    expect(isNumber(0)).toBe(true)
    expect(isNumber(-1)).toBe(true)
  })

  it('isNumber returns false for non-numbers', () => {
    expect(isNumber('42')).toBe(false)
    expect(isNumber(null)).toBe(false)
  })

  it('isBoolean returns true for booleans', () => {
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean(false)).toBe(true)
  })

  it('isObject returns true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ key: 'value' })).toBe(true)
  })

  it('isObject returns false for arrays and null', () => {
    expect(isObject([])).toBe(false)
    expect(isObject(null)).toBe(false)
  })

  it('isArray returns true for arrays', () => {
    expect(isArray([])).toBe(true)
    expect(isArray([1, 2, 3])).toBe(true)
  })

  it('isArray returns false for non-arrays', () => {
    expect(isArray({})).toBe(false)
    expect(isArray('string')).toBe(false)
  })
})

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.co')).toBe(true)
    expect(validateEmail('user+tag@gmail.com')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('notanemail')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('user @domain.com')).toBe(false)
  })

  it('rejects emails exceeding max length', () => {
    const longEmail = 'a'.repeat(250) + '@b.com'
    expect(validateEmail(longEmail)).toBe(false)
  })

  it('rejects emails with local part exceeding 64 chars', () => {
    const longLocal = 'a'.repeat(65) + '@domain.com'
    expect(validateEmail(longLocal)).toBe(false)
  })
})

describe('validateEmailWithError', () => {
  it('returns error for empty email', () => {
    const result = validateEmailWithError('')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Email is required')
  })

  it('returns error for invalid email', () => {
    const result = validateEmailWithError('notanemail')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Please enter a valid email address')
  })

  it('returns valid for correct email', () => {
    const result = validateEmailWithError('user@example.com')
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })
})

describe('validateApiResponse', () => {
  it('accepts valid API response', () => {
    const response = { success: true, message: 'OK', data: {} }
    expect(validateApiResponse(response)).toBe(true)
  })

  it('throws for non-object', () => {
    expect(() => validateApiResponse('string')).toThrow(ValidationError)
    expect(() => validateApiResponse(null)).toThrow(ValidationError)
  })

  it('throws for missing success field', () => {
    expect(() => validateApiResponse({ message: 'OK' })).toThrow('success')
  })

  it('throws for missing message field', () => {
    expect(() => validateApiResponse({ success: true })).toThrow('message')
  })
})

describe('validateUser', () => {
  it('accepts valid user object', () => {
    const user = { id: '1', fullName: 'John', email: 'john@test.com', role: 'ADMIN' }
    expect(validateUser(user)).toBe(true)
  })

  it('throws for missing required fields', () => {
    expect(() => validateUser({ id: '1' })).toThrow(ValidationError)
  })

  it('throws for invalid role', () => {
    const user = { id: '1', fullName: 'John', email: 'john@test.com', role: 'INVALID' }
    expect(() => validateUser(user)).toThrow('role')
  })
})

describe('validateLoginResponse', () => {
  it('accepts valid login response', () => {
    const data = {
      accessToken: 'token123',
      user: { id: '1', fullName: 'John', email: 'john@test.com', role: 'ADMIN' },
    }
    expect(validateLoginResponse(data)).toBe(true)
  })

  it('throws for missing accessToken', () => {
    expect(() => validateLoginResponse({ user: {} })).toThrow('accessToken')
  })
})

describe('validateArray', () => {
  it('validates array of items', () => {
    const validator = (item: unknown): item is string => typeof item === 'string'
    expect(validateArray(['a', 'b', 'c'], validator)).toBe(true)
  })

  it('throws for non-array', () => {
    const validator = (item: unknown): item is string => typeof item === 'string'
    expect(() => validateArray('notarray', validator)).toThrow('Expected an array')
  })
})

describe('safeValidateApiResponse', () => {
  it('returns valid for correct response', () => {
    const result = safeValidateApiResponse({ success: true, message: 'OK' })
    expect(result.valid).toBe(true)
  })

  it('returns error for invalid response', () => {
    const result = safeValidateApiResponse('invalid')
    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe('ValidationError', () => {
  it('creates error with message and field', () => {
    const error = new ValidationError('Test error', 'email')
    expect(error.message).toBe('Test error')
    expect(error.field).toBe('email')
    expect(error.name).toBe('ValidationError')
  })
})
