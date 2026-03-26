import type { ApiResponse, User, LoginResponseData, MenuConfigFlow, Directory } from '~/types/api'

/**
 * Simple runtime validation for API responses
 * This provides basic type checking without external dependencies
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Type guards for runtime validation
export const isString = (value: unknown): value is string => typeof value === 'string'
export const isNumber = (value: unknown): value is number => typeof value === 'number'
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'
export const isObject = (value: unknown): value is Record<string, any> => 
  typeof value === 'object' && value !== null && !Array.isArray(value)
export const isArray = (value: unknown): value is any[] => Array.isArray(value)

/**
 * Validate API response structure
 */
export function validateApiResponse<T>(data: unknown): data is ApiResponse<T> {
  if (!isObject(data)) {
    throw new ValidationError('Response must be an object')
  }
  
  if (!('success' in data) || !isBoolean(data.success)) {
    throw new ValidationError('Response must have a boolean "success" field')
  }
  
  if (!('message' in data) || !isString(data.message)) {
    throw new ValidationError('Response must have a string "message" field')
  }
  
  // data field is optional but if present should exist
  if ('data' in data && data.data === undefined) {
    throw new ValidationError('Response "data" field cannot be undefined if present')
  }
  
  return true
}

/**
 * Validate User object
 */
export function validateUser(data: unknown): data is User {
  if (!isObject(data)) {
    throw new ValidationError('User must be an object')
  }
  
  const required = ['id', 'fullName', 'email', 'role']
  for (const field of required) {
    if (!(field in data) || !isString(data[field])) {
      throw new ValidationError(`User must have a string "${field}" field`, field)
    }
  }
  
  if (!['ADMIN', 'USER', 'MERCHANT'].includes(data.role)) {
    throw new ValidationError('User role must be ADMIN, USER, or MERCHANT', 'role')
  }
  
  return true
}

/**
 * Validate Login Response Data
 */
export function validateLoginResponse(data: unknown): data is LoginResponseData {
  if (!isObject(data)) {
    throw new ValidationError('Login response must be an object')
  }
  
  if (!('accessToken' in data) || !isString(data.accessToken)) {
    throw new ValidationError('Login response must have a string "accessToken" field')
  }
  
  if (!('user' in data)) {
    throw new ValidationError('Login response must have a "user" field')
  }
  
  validateUser(data.user)
  
  return true
}

/**
 * Validate array of items
 */
export function validateArray<T>(
  data: unknown,
  itemValidator: (item: unknown) => item is T
): data is T[] {
  if (!isArray(data)) {
    throw new ValidationError('Expected an array')
  }
  
  data.forEach((item, index) => {
    try {
      itemValidator(item)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Item at index ${index}: ${error.message}`, error.field)
      }
      throw error
    }
  })
  
  return true
}

/**
 * Safe API response validator with error handling
 */
export function safeValidateApiResponse<T>(
  data: unknown,
  dataValidator?: (data: unknown) => data is T
): { valid: boolean; error?: string } {
  try {
    validateApiResponse(data)
    
    if (dataValidator && 'data' in (data as any)) {
      dataValidator((data as any).data)
    }
    
    return { valid: true }
  } catch (error) {
    if (error instanceof ValidationError) {
      return { valid: false, error: error.message }
    }
    return { valid: false, error: 'Unknown validation error' }
  }
}

/**
 * Email validation (RFC 5322 compliant)
 */
export function validateEmail(email: string): boolean {
  // More comprehensive email regex (RFC 5322 simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!emailRegex.test(email)) {
    return false
  }
  
  // Additional checks
  if (email.length > 254) return false // Max email length
  
  const [local, domain] = email.split('@')
  if (!local || !domain) return false
  if (local.length > 64) return false // Max local part length
  
  return true
}

/**
 * Validate email with detailed error message
 */
export function validateEmailWithError(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' }
  }
  
  if (!validateEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  
  return { valid: true }
}
