// User Role Constants

import type { UserRole } from '~/types/api'

/** Available user roles */
export const USER_ROLES = {
  ADMIN: 'ADMIN' as UserRole,
  EDITOR: 'EDITOR' as UserRole,
  VIEWER: 'VIEWER' as UserRole,
} as const

/** Display labels for roles */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
}

/** Role descriptions */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  ADMIN: 'Full access to all features and settings',
  EDITOR: 'Can create and edit USSD flows and directories',
  VIEWER: 'Read-only access to dashboards and logs',
}

/** Role hierarchy (higher index = more permissions) */
export const ROLE_HIERARCHY: UserRole[] = ['VIEWER', 'EDITOR', 'ADMIN']

/** Map form display role labels to API UserRole values */
export const FORM_ROLE_TO_API: Record<string, UserRole> = {
  Admin: 'ADMIN',
  Editor: 'EDITOR',
  Viewer: 'VIEWER',
}

/** Cookie configuration */
export const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: 'accessToken',
  USER_NAME: 'user',
  TOKEN_EXPIRY_NAME: 'tokenExpiry',
  MAX_AGE: 60 * 60 * 24 * 7, // 7 days in seconds
} as const

/** Public routes that don't require authentication */
export const PUBLIC_ROUTES = ['/login', '/forgot-password'] as const

/** Default redirect after login */
export const DEFAULT_LOGIN_REDIRECT = '/live-sessions'
