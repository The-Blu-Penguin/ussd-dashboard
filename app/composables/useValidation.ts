// Validation Composable - Centralized validation logic for forms

import { EMAIL_REGEX, MAX_EMAIL_LENGTH, MAX_EMAIL_LOCAL_LENGTH, PASSWORD } from '~/constants/validation'

export interface ValidationResult {
  valid: boolean
  error?: string
}

export interface ValidationRule {
  field: string
  value: any
  rules: ((value: any) => string | null)[]
}

export interface UseValidationReturn {
  validateEmail: (email: string) => ValidationResult
  validateRequired: (value: any, fieldName: string) => ValidationResult
  validatePassword: (password: string) => ValidationResult
  validatePasswordMatch: (password: string, confirmPassword: string) => ValidationResult
  validateForm: (fields: ValidationRule[]) => ValidationResult
}

export const useValidation = (): UseValidationReturn => {
  const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === '') {
      return { valid: false, error: 'Email is required' }
    }

    if (!EMAIL_REGEX.test(email)) {
      return { valid: false, error: 'Please enter a valid email address' }
    }

    if (email.length > MAX_EMAIL_LENGTH) {
      return { valid: false, error: 'Email is too long' }
    }

    const [local] = email.split('@')
    if (local && local.length > MAX_EMAIL_LOCAL_LENGTH) {
      return { valid: false, error: 'Email local part is too long' }
    }

    return { valid: true }
  }

  const validateRequired = (value: any, fieldName: string): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: `${fieldName} is required` }
    }
    return { valid: true }
  }

  const validatePassword = (password: string): ValidationResult => {
    if (!password) {
      return { valid: false, error: 'Password is required' }
    }

    if (password.length < PASSWORD.MIN_LENGTH) {
      return { valid: false, error: `Password must be at least ${PASSWORD.MIN_LENGTH} characters long` }
    }

    return { valid: true }
  }

  const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
    if (password !== confirmPassword) {
      return { valid: false, error: 'Passwords do not match' }
    }
    return { valid: true }
  }

  const validateForm = (fields: ValidationRule[]): ValidationResult => {
    for (const field of fields) {
      for (const rule of field.rules) {
        const error = rule(field.value)
        if (error) {
          return { valid: false, error }
        }
      }
    }
    return { valid: true }
  }

  return {
    validateEmail,
    validateRequired,
    validatePassword,
    validatePasswordMatch,
    validateForm,
  }
}
