import type { ApiError } from '~/types/api'
import { isApiError } from '~/types/api'
import { useToast } from '~/composables/useToast'
import { useLogger } from '~/composables/useLogger'

export interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  retryable?: boolean
}

export interface StandardError {
  message: string
  statusCode?: number
  errors?: Record<string, string[]>
  isRetryable: boolean
}

export interface UseErrorHandlerReturn {
  handleError: (error: unknown, options?: ErrorHandlerOptions) => StandardError
  parseError: (error: unknown) => StandardError
  getValidationErrors: (error: StandardError) => string[]
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const toast = useToast()
  const logger = useLogger()

  const parseError = (error: unknown): StandardError => {
    // Default error structure
    const standardError: StandardError = {
      message: 'An unexpected error occurred',
      isRetryable: false,
    }

    const err = error as any

    // Handle API response errors
    if (err.response) {
      const status = err.response.status
      standardError.statusCode = status

      // Extract message from response
      const responseData = err.response._data
      if (responseData?.message) {
        standardError.message = responseData.message
      }

      // Extract validation errors
      if (responseData?.errors) {
        standardError.errors = responseData.errors
      }

      // Determine if error is retryable
      standardError.isRetryable = status >= 500 || status === 408 || status === 429

      // Provide user-friendly messages
      switch (status) {
        case 400:
          standardError.message = responseData?.message || 'Invalid request. Please check your input.'
          break
        case 401:
          standardError.message = 'Unauthorized. Please log in again.'
          break
        case 403:
          standardError.message = 'Access forbidden. You do not have permission to perform this action.'
          break
        case 404:
          standardError.message = 'Resource not found.'
          break
        case 408:
          standardError.message = 'Request timeout. Please try again.'
          break
        case 422:
          standardError.message = responseData?.message || 'Validation error. Please check your inputs.'
          break
        case 429:
          standardError.message = 'Too many requests. Please wait a moment and try again.'
          break
        case 500:
          standardError.message = 'Server error. Please try again later.'
          break
        case 502:
        case 503:
          standardError.message = 'Service temporarily unavailable. Please try again later.'
          break
        case 504:
          standardError.message = 'Gateway timeout. Please try again.'
          break
      }
    } else if (err.message) {
      // Handle network errors
      standardError.message = 'Unable to connect. Please check your internet connection.'
      standardError.isRetryable = true
    }

    return standardError
  }

  const handleError = (
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): StandardError => {
    const { showToast = true, logError = true } = options

    const standardError = parseError(error)

    // Log error to structured logger
    if (logError) {
      logger.error(standardError.message, {
        category: 'api',
        metadata: {
          statusCode: standardError.statusCode,
          errors: standardError.errors,
          isRetryable: standardError.isRetryable,
        },
        error: error instanceof Error ? error : new Error(String(error)),
        silent: !showToast, // if toast is off, also suppress logger toast
      })
    }

    // Show toast notification
    if (showToast) {
      toast.error(standardError.message)
    }

    return standardError
  }

  const getValidationErrors = (error: StandardError): string[] => {
    if (!error.errors) return []

    return Object.entries(error.errors).flatMap(([field, messages]) =>
      messages.map(msg => `${field}: ${msg}`)
    )
  }

  return {
    handleError,
    parseError,
    getValidationErrors,
  }
}
