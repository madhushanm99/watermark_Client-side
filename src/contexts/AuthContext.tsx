'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi, type User as ApiUser } from '../lib/api'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  subscription_tier: 'free' | 'professional'
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for stored auth token and validate it
    const initializeAuth = async () => {
      try {
        const token = authApi.getToken()
        const storedUser = localStorage.getItem('user')
        
        if (token && storedUser) {
          // First restore user from localStorage
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          
          // Then optionally validate token by getting current user
          try {
            const currentUser = await authApi.getCurrentUser()
            // Update user data if the API call succeeds
            const userData: User = {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              subscription_tier: currentUser.subscription_tier,
              email_verified_at: (currentUser as any).email_verified_at,
                              created_at: (currentUser as any).created_at,
                updated_at: (currentUser as any).updated_at,
            }
            setUser(userData)
            localStorage.setItem('user', JSON.stringify(userData))
          } catch (validationError) {
            // If validation fails, keep the stored user data
            // Only clear if it's a 401 (unauthorized) error
            if (validationError instanceof Error && (validationError as any).status === 401) {
              authApi.clearAuthToken()
              localStorage.removeItem('user')
              setUser(null)
            }
            // For other errors (network issues, etc.), keep the user logged in
            console.warn('Token validation failed, but keeping user logged in:', validationError)
          }
        } else if (token || storedUser) {
          // If we have only token or only stored user, clear everything
          authApi.clearAuthToken()
          localStorage.removeItem('user')
          setUser(null)
        }
      } catch (error) {
        // Clear everything if there's an error parsing stored data
        authApi.clearAuthToken()
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ email, password })
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        subscription_tier: response.user.subscription_tier,
        email_verified_at: (response.user as any).email_verified_at,
        created_at: (response.user as any).created_at,
        updated_at: (response.user as any).updated_at,
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    setIsLoading(true)
    try {
      const response = await authApi.register({ 
        name, 
        email, 
        password, 
        password_confirmation: passwordConfirmation 
      })
      
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        subscription_tier: response.user.subscription_tier,
        email_verified_at: (response.user as any).email_verified_at,
        created_at: (response.user as any).created_at,
        updated_at: (response.user as any).updated_at,
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      navigate('/dashboard')
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
      setIsLoading(false)
      navigate('/')
    }
  }

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}