import type { ApiError } from '~/types/api'
import { useToast } from '~/composables/useToast'

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

export const useErrorHandler = () => {
  const toast = useToast()

  const parseError = (error: any): StandardError => {
    // Default error structure
    const standardError: StandardError = {
      message: 'An unexpected error occurred',
      isRetryable: false,
    }

    // Handle API response errors
    if (error.response) {
      const status = error.response.status
      standardError.statusCode = status

      // Extract message from response
      const responseData = error.response._data
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
    } else if (error.message) {
      // Handle network errors
      standardError.message = 'Unable to connect. Please check your internet connection.'
      standardError.isRetryable = true
    }

    return standardError
  }

  const handleError = (
    error: any,
    options: ErrorHandlerOptions = {}
  ): StandardError => {
    const { showToast = true, logError = true } = options

    const standardError = parseError(error)

    // Log error to console in development
    if (logError && import.meta.dev) {
      console.error('[Error Handler]', {
        message: standardError.message,
        statusCode: standardError.statusCode,
        errors: standardError.errors,
        originalError: error,
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
