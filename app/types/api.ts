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
  status: string
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
