import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useToast } from '~/composables/useToast'

// Mock useLogger
vi.mock('~/composables/useLogger', () => ({
  useLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    api: { error: vi.fn(), request: vi.fn(), response: vi.fn() },
  }),
}))

import { useErrorHandler } from '~/composables/useErrorHandler'

describe('useErrorHandler', () => {
  beforeEach(() => {
    // Clear toasts
    const toast = useToast()
    toast.toasts.value = []
  })

  describe('parseError', () => {
    it('parses API error with response object', () => {
      const handler = useErrorHandler()
      const error = {
        response: {
          status: 400,
          _data: { message: 'Invalid input' },
        },
      }

      const result = handler.parseError(error)
      expect(result.statusCode).toBe(400)
      expect(result.message).toBe('Invalid input')
    })

    it('returns user-friendly message for 401', () => {
      const handler = useErrorHandler()
      const error = {
        response: { status: 401, _data: {} },
      }

      const result = handler.parseError(error)
      expect(result.message).toBe('Unauthorized. Please log in again.')
      expect(result.statusCode).toBe(401)
    })

    it('returns user-friendly message for 403', () => {
      const handler = useErrorHandler()
      const error = {
        response: { status: 403, _data: {} },
      }

      const result = handler.parseError(error)
      expect(result.message).toContain('forbidden')
    })

    it('returns user-friendly message for 404', () => {
      const handler = useErrorHandler()
      const error = {
        response: { status: 404, _data: {} },
      }

      const result = handler.parseError(error)
      expect(result.message).toContain('not found')
    })

    it('marks 500 errors as retryable', () => {
      const handler = useErrorHandler()
      const error = {
        response: { status: 500, _data: {} },
      }

      const result = handler.parseError(error)
      expect(result.isRetryable).toBe(true)
    })

    it('marks 429 errors as retryable', () => {
      const handler = useErrorHandler()
      const error = {
        response: { status: 429, _data: {} },
      }

      const result = handler.parseError(error)
      expect(result.isRetryable).toBe(true)
      expect(result.message).toContain('Too many requests')
    })

    it('marks 408 errors as retryable', () => {
      const handler = useErrorHandler()
      const error = {
        response: { status: 408, _data: {} },
      }

      const result = handler.parseError(error)
      expect(result.isRetryable).toBe(true)
    })

    it('handles network errors (no response)', () => {
      const handler = useErrorHandler()
      const error = { message: 'Network error' }

      const result = handler.parseError(error)
      expect(result.message).toContain('Unable to connect')
      expect(result.isRetryable).toBe(true)
    })

    it('handles unknown errors', () => {
      const handler = useErrorHandler()
      const error = {}

      const result = handler.parseError(error)
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.isRetryable).toBe(false)
    })

    it('extracts validation errors', () => {
      const handler = useErrorHandler()
      const error = {
        response: {
          status: 422,
          _data: {
            message: 'Validation failed',
            errors: { email: ['Invalid email'], password: ['Too short'] },
          },
        },
      }

      const result = handler.parseError(error)
      expect(result.errors).toBeDefined()
      expect(result.errors?.email).toEqual(['Invalid email'])
    })
  })

  describe('handleError', () => {
    it('shows toast when showToast is true (default)', () => {
      const handler = useErrorHandler()
      const toast = useToast()
      const error = { message: 'Test error' }

      handler.handleError(error)
      expect(toast.toasts.value).toHaveLength(1)
      expect(toast.toasts.value[0]?.type).toBe('error')
    })

    it('does not show toast when showToast is false', () => {
      const handler = useErrorHandler()
      const toast = useToast()
      const error = { message: 'Test error' }

      handler.handleError(error, { showToast: false })
      expect(toast.toasts.value).toHaveLength(0)
    })

    it('returns StandardError object', () => {
      const handler = useErrorHandler()
      const error = {
        response: { status: 400, _data: { message: 'Bad request' } },
      }

      const result = handler.handleError(error, { showToast: false })
      expect(result.message).toBe('Bad request')
      expect(result.statusCode).toBe(400)
    })
  })

  describe('getValidationErrors', () => {
    it('returns empty array when no errors', () => {
      const handler = useErrorHandler()
      const result = handler.getValidationErrors({ message: 'test', isRetryable: false })
      expect(result).toEqual([])
    })

    it('flattens validation errors', () => {
      const handler = useErrorHandler()
      const result = handler.getValidationErrors({
        message: 'test',
        isRetryable: false,
        errors: { email: ['Required', 'Invalid'], name: ['Too short'] },
      })
      expect(result).toEqual(['email: Required', 'email: Invalid', 'name: Too short'])
    })
  })
})
