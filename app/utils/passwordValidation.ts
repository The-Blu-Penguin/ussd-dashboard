import type { PasswordValidation, PasswordRequirements, PasswordStrength } from '~/types/api'

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

export const validatePassword = (
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidation => {
  const errors: string[] = []

  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`)
  }

  // Check uppercase
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check lowercase
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Check numbers
  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Check special characters
  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  // Calculate password strength
  const strength = calculatePasswordStrength(password)

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0

  // Length scoring
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++

  // Character variety scoring
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++

  // Pattern penalties
  if (/(.)\1{2,}/.test(password)) score-- // Repeated characters
  if (/^[a-zA-Z]+$/.test(password)) score-- // Only letters
  if (/^\d+$/.test(password)) score-- // Only numbers

  // Map score to strength
  if (score <= 2) return 'weak'
  if (score <= 4) return 'medium'
  if (score <= 6) return 'strong'
  return 'very-strong'
}

export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'bg-red-500'
    case 'medium':
      return 'bg-amber-500'
    case 'strong':
      return 'bg-green-500'
    case 'very-strong':
      return 'bg-emerald-600'
    default: {
      const _exhaustive: never = strength
      return 'bg-gray-500'
    }
  }
}

export const getPasswordStrengthLabel = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'Weak'
    case 'medium':
      return 'Medium'
    case 'strong':
      return 'Strong'
    case 'very-strong':
      return 'Very Strong'
    default: {
      const _exhaustive: never = strength
      return 'Unknown'
    }
  }
}

export const getPasswordStrengthWidth = (strength: PasswordStrength): string => {
  switch (strength) {
    case 'weak':
      return 'w-1/4'
    case 'medium':
      return 'w-1/2'
    case 'strong':
      return 'w-3/4'
    case 'very-strong':
      return 'w-full'
    default: {
      const _exhaustive: never = strength
      return 'w-0'
    }
  }
}
