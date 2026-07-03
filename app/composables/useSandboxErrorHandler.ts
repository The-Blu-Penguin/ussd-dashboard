// Sandbox page context-aware error handler

import { useErrorHandler, type StandardError } from '~/composables/useErrorHandler'
import { useToast } from '~/composables/useToast'

export interface UseSandboxErrorHandlerReturn {
  handleSessionError: (error: unknown) => StandardError
  handleInputError: (error: unknown) => StandardError
}

export const useSandboxErrorHandler = (): UseSandboxErrorHandlerReturn => {
  const errorHandler = useErrorHandler()
  const toast = useToast()

  const handleSessionError = (error: unknown): StandardError => {
    return errorHandler.handleError(error, { showToast: true })
  }

  const handleInputError = (error: unknown): StandardError => {
    return errorHandler.handleError(error, { showToast: true })
  }

  return {
    handleSessionError,
    handleInputError,
  }
}
