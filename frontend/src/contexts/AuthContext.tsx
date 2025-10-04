import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

// Import API service and types
import { userApi } from '../services'
import type { User, UserLoginData, UserCreateData } from '../types/user'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
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
  const [refreshTokenTimeout, setRefreshTokenTimeout] = useState<NodeJS.Timeout | null>(null)

  // Function to schedule token refresh
  const scheduleTokenRefresh = (expiresInMinutes: number = 14) => {
    // Clear existing timeout
    if (refreshTokenTimeout) {
      clearTimeout(refreshTokenTimeout)
    }

    // Schedule refresh 1 minute before expiration
    const refreshTime = (expiresInMinutes - 1) * 60 * 1000
    const timeout = setTimeout(async () => {
      try {
        await refreshAccessToken()
      } catch (error) {
        console.error('Token refresh failed:', error)
        // If refresh fails, logout user
        logout()
      }
    }, refreshTime)

    setRefreshTokenTimeout(timeout)
  }

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      const response = await userApi.refreshToken()
      localStorage.setItem('authToken', response.token)

      // Schedule next refresh (assuming 15-minute token expiry)
      scheduleTokenRefresh(15)
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw error
    }
  }

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          // Verify token with backend and get current user info
          const userData = await userApi.getCurrentUser()
          setUser(userData)

          // Schedule token refresh
          scheduleTokenRefresh(15) // Assuming 15-minute token expiry
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid token
        localStorage.removeItem('authToken')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Cleanup timeout on unmount
    return () => {
      if (refreshTokenTimeout) {
        clearTimeout(refreshTokenTimeout)
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const loginData: UserLoginData = { email, password }
      const response = await userApi.login(loginData)

      // Store the token and set user data
      localStorage.setItem('authToken', response.token)
      setUser(response.user)

      // Schedule automatic token refresh
      scheduleTokenRefresh(15) // Assuming 15-minute token expiry
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string, role: string = 'customer') => {
    setIsLoading(true)
    try {
      const registerData: UserCreateData = {
        email,
        password,
        firstName,
        lastName,
        role: role as User['role'],
        acceptedTerms: new Date().toISOString(),
        marketingConsent: false
      }

      const userData = await userApi.register(registerData)

      // For registration, we typically need to login after successful registration
      // or the API might return a token. For now, we'll assume registration doesn't auto-login
      // and the user needs to login separately.
      console.log('Registration successful for user:', userData.email)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear refresh token timeout
    if (refreshTokenTimeout) {
      clearTimeout(refreshTokenTimeout)
      setRefreshTokenTimeout(null)
    }

    setUser(null)
    localStorage.removeItem('authToken')
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}