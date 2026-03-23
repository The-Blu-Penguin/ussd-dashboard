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
  role?: 'ADMIN' | 'USER' | 'MERCHANT'
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
  role: 'ADMIN' | 'USER' | 'MERCHANT'
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

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: string
}