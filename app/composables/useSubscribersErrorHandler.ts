// Subscribers page context-aware error handler

import { useErrorHandler, type StandardError } from '~/composables/useErrorHandler'
import { useToast } from '~/composables/useToast'

export interface UseSubscribersErrorHandlerReturn {
  handleUnsubscribeError: (error: unknown) => StandardError
  handleFetchError: (error: unknown) => StandardError
  handleSuccess: (message: string) => void
}

export const useSubscribersErrorHandler = (): UseSubscribersErrorHandlerReturn => {
  const errorHandler = useErrorHandler()
  const toast = useToast()

  const handleUnsubscribeError = (error: unknown): StandardError => {
    return errorHandler.handleError(error, { showToast: true })
  }

  const handleFetchError = (error: unknown): StandardError => {
    return errorHandler.handleError(error, { showToast: true })
  }

  const handleSuccess = (message: string): void => {
    toast.success(message)
  }

  return {
    handleUnsubscribeError,
    handleFetchError,
    handleSuccess,
  }
}
