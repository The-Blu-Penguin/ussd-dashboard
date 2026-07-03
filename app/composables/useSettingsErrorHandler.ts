// Settings page context-aware error handler

import { useErrorHandler, type StandardError } from '~/composables/useErrorHandler'
import { useToast } from '~/composables/useToast'

export interface UseSettingsErrorHandlerReturn {
  handlePasswordError: (error: unknown) => StandardError
  handleUserManagementError: (error: unknown) => StandardError
  handleValidationError: (message: string) => void
  handleSuccess: (message: string) => void
}

export const useSettingsErrorHandler = (): UseSettingsErrorHandlerReturn => {
  const errorHandler = useErrorHandler()
  const toast = useToast()

  const handlePasswordError = (error: unknown): StandardError => {
    return errorHandler.handleError(error, { showToast: true })
  }

  const handleUserManagementError = (error: unknown): StandardError => {
    return errorHandler.handleError(error, { showToast: true })
  }

  const handleValidationError = (message: string): void => {
    toast.warning(message)
  }

  const handleSuccess = (message: string): void => {
    toast.success(message)
  }

  return {
    handlePasswordError,
    handleUserManagementError,
    handleValidationError,
    handleSuccess,
  }
}
