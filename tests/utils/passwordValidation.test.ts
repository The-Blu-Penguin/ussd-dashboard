import { describe, it, expect } from 'vitest'
import {
  validatePassword,
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
  getPasswordStrengthWidth,
  DEFAULT_PASSWORD_REQUIREMENTS,
} from '~/utils/passwordValidation'

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    const result = validatePassword('StrongP@ss1')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('rejects password too short', () => {
    const result = validatePassword('Ab1!')
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('at least'))).toBe(true)
  })

  it('rejects password without uppercase', () => {
    const result = validatePassword('lowercase1!')
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('uppercase'))).toBe(true)
  })

  it('rejects password without lowercase', () => {
    const result = validatePassword('UPPERCASE1!')
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('lowercase'))).toBe(true)
  })

  it('rejects password without numbers', () => {
    const result = validatePassword('NoNumbers!')
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('number'))).toBe(true)
  })

  it('rejects password without special characters', () => {
    const result = validatePassword('NoSpecial1')
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('special character'))).toBe(true)
  })

  it('uses custom requirements', () => {
    const customReqs = {
      minLength: 4,
      requireUppercase: false,
      requireLowercase: false,
      requireNumbers: false,
      requireSpecialChars: false,
    }
    const result = validatePassword('abcd', customReqs)
    expect(result.isValid).toBe(true)
  })

  it('returns password strength', () => {
    const result = validatePassword('StrongP@ss1')
    expect(result.strength).toBeDefined()
    expect(['weak', 'medium', 'strong', 'very-strong']).toContain(result.strength)
  })
})

describe('calculatePasswordStrength', () => {
  it('returns weak for short simple passwords', () => {
    expect(calculatePasswordStrength('abc')).toBe('weak')
  })

  it('returns medium for moderate passwords', () => {
    const strength = calculatePasswordStrength('Abcdef1!')
    expect(['medium', 'strong']).toContain(strength)
  })

  it('returns strong or very-strong for complex passwords', () => {
    const strength = calculatePasswordStrength('C0mpl3x!P@ssw0rd')
    expect(['strong', 'very-strong']).toContain(strength)
  })

  it('penalizes repeated characters', () => {
    const strength1 = calculatePasswordStrength('aaa')
    const strength2 = calculatePasswordStrength('abc')
    expect(strength1).toBe('weak')
  })

  it('penalizes only-letter passwords', () => {
    expect(calculatePasswordStrength('abcdefghijkl')).toBe('weak')
  })

  it('penalizes only-number passwords', () => {
    expect(calculatePasswordStrength('123456789012')).toBe('weak')
  })
})

describe('getPasswordStrengthColor', () => {
  it('returns correct colors', () => {
    expect(getPasswordStrengthColor('weak')).toBe('bg-red-500')
    expect(getPasswordStrengthColor('medium')).toBe('bg-amber-500')
    expect(getPasswordStrengthColor('strong')).toBe('bg-green-500')
    expect(getPasswordStrengthColor('very-strong')).toBe('bg-emerald-600')
  })
})

describe('getPasswordStrengthLabel', () => {
  it('returns correct labels', () => {
    expect(getPasswordStrengthLabel('weak')).toBe('Weak')
    expect(getPasswordStrengthLabel('medium')).toBe('Medium')
    expect(getPasswordStrengthLabel('strong')).toBe('Strong')
    expect(getPasswordStrengthLabel('very-strong')).toBe('Very Strong')
  })
})

describe('getPasswordStrengthWidth', () => {
  it('returns correct widths', () => {
    expect(getPasswordStrengthWidth('weak')).toBe('w-1/4')
    expect(getPasswordStrengthWidth('medium')).toBe('w-1/2')
    expect(getPasswordStrengthWidth('strong')).toBe('w-3/4')
    expect(getPasswordStrengthWidth('very-strong')).toBe('w-full')
  })
})

describe('DEFAULT_PASSWORD_REQUIREMENTS', () => {
  it('has expected default values', () => {
    expect(DEFAULT_PASSWORD_REQUIREMENTS.minLength).toBe(8)
    expect(DEFAULT_PASSWORD_REQUIREMENTS.requireUppercase).toBe(true)
    expect(DEFAULT_PASSWORD_REQUIREMENTS.requireLowercase).toBe(true)
    expect(DEFAULT_PASSWORD_REQUIREMENTS.requireNumbers).toBe(true)
    expect(DEFAULT_PASSWORD_REQUIREMENTS.requireSpecialChars).toBe(true)
  })
})
