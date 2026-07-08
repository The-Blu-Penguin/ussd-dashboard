// Allocate page context-aware error handler

import { useErrorHandler, type StandardError } from '~/composables/useErrorHandler'
import { useToast } from '~/composables/useToast'

export interface UseAllocateErrorHandlerReturn {
  handleAllocationError: (error: unknown) => StandardError
  handleValidationError: (message: string) => void
  handleSuccess: (message: string) => void
}

export const useAllocateErrorHandler = (): UseAllocateErrorHandlerReturn => {
  const errorHandler = useErrorHandler()
  const toast = useToast()

  const handleAllocationError = (error: unknown): StandardError => {
    return errorHandler.handleError(error, { showToast: true })
  }

  const handleValidationError = (message: string): void => {
    toast.error(message)
  }

  const handleSuccess = (message: string): void => {
    toast.success(message)
  }

  return {
    handleAllocationError,
    handleValidationError,
    handleSuccess,
  }
}
