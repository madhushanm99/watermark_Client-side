import { apiClient } from './client'
import { endpoints } from './config'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  subscription_tier: 'free' | 'professional'
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginResponse {
  user: User
  token: string
  token_type: string
  expires_at: string
}

export interface RegisterResponse {
  user: User
  token: string
  token_type: string
  expires_at: string
}

export const authApi = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(endpoints.auth.login, credentials)
    
    // Store auth token
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token)
    }
    
    return response.data
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(endpoints.auth.register, userData)
    
    // Store auth token
    if (response.data.token) {
      apiClient.setAuthToken(response.data.token)
    }
    
    return response.data
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(endpoints.auth.logout)
    } finally {
      // Always clear token, even if logout request fails
      apiClient.clearAuthToken()
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(endpoints.auth.user)
    return response.data.user
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(endpoints.auth.forgotPassword, { email })
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!apiClient.getAuthToken()
  },

  // Get stored token
  getToken: (): string | null => {
    return apiClient.getAuthToken()
  },

  // Clear auth token
  clearAuthToken: (): void => {
    apiClient.clearAuthToken()
  },
}

export default authApi 