export interface LoginRequest {
  email: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateUserRequest {
  fullName?: string
  role?: UserRole
  avatarUrl?: string
}

export interface UserPermissions {
  additionalProp1?: Record<string, any>
  additionalProp2?: Record<string, any>
  additionalProp3?: Record<string, any>
}

export interface User {
  id: string
  fullName: string
  email: string
  role: UserRole
  avatarUrl?: string
  permissions: UserPermissions
  isActive: boolean
  lastLogin: string
  createdAt: string
}

export interface LoginResponseData {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface DeleteUserResponseData {
  message: string
}

export interface MenuConfigCreator {
  id: string
  email: string
  fullName: string
}

export interface MenuConfigFlow {
  id: string
  name: string
  type: string
  hasReference: boolean
  description: string
  menuConfig: Record<string, any>
  createdAt: string
  updatedAt: string
  createdBy: MenuConfigCreator
}

export interface CreateMenuConfigRequest {
  name: string
  type: string
  hasReference: boolean
  description: string
  menuConfig: Record<string, any>
}

export interface DirectoryCreator {
  id: string
  email: string
  fullName: string
}

export interface Directory {
  id: string
  merchantCode: string
  assignedCode: string
  ussdCode: string
  menuConfig: Record<string, any>
  menuConfigFlowId: string
  parentDirectoryId: string | null
  parentUssdCode: string | null
  path: string
  level: string
  status: DirectoryStatus
  createdAt: string
  updatedAt: string
  childrenCount: number
  createdBy: DirectoryCreator
  merchantName?: string // Client-side added property
}

export interface MerchantDetails {
  uuid: string
  merchantCode: string
  merchantName: string
}

export interface MerchantResponseData {
  merchant?: MerchantDetails
  merchantName?: string
  accessToken?: string
  [key: string]: any
}

export interface MerchantApiResponse {
  success?: boolean
  status?: string
  message: string
  data: MerchantResponseData
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

// Transaction and Log Types
export interface Transaction {
  id: string
  msisdn: string
  sessionId: string
  merchantCode: string
  amount: number
  status: TransactionStatus
  timestamp: string
  metadata?: Record<string, any>
}

export interface ServiceLog {
  id: string
  level: LogLevel
  message: string
  timestamp: string
  statusCode?: number
  metadata?: Record<string, any>
}

// Modal Props Interfaces
export interface TransactionDetailsModalProps {
  transaction: Transaction | null
  isOpen: boolean
}

export interface LogDetailsModalProps {
  log: ServiceLog | null
  isOpen: boolean
}

// Merchant Types
export interface MappedMerchant {
  uuid: string
  merchantCode: string
  merchantName: string
}

// Union Types for Status Values
export type TransactionStatus = 'Success' | 'Failed' | 'Pending'
export type LogLevel = 'Info' | 'Warning' | 'Error' | 'Critical'
export type UserRole = 'ADMIN' | 'USER' | 'MERCHANT'
export type DirectoryStatus = 'Active' | 'Inactive' | 'Suspended'

// Error Response Interface
export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
  statusCode: number
}

// Password Validation
export interface PasswordValidation {
  isValid: boolean
  errors: string[]
  strength: PasswordStrength
}

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
}
