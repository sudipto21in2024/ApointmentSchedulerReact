import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'service_provider' | 'tenant_admin' | 'system_admin'
  tenantId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string, role: string) => Promise<void>
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

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          // Verify token with backend and get user info
          // For now, we'll use a mock user
          setUser({
            id: '1',
            email: 'user@example.com',
            name: 'John Doe',
            role: 'customer'
          })
        }
      } catch (_error) {
        console.error('Auth check failed')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, _password: string) => {
    setIsLoading(true)
    try {
      // Mock login - replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        name: 'John Doe',
        role: 'customer'
      }
      setUser(mockUser)
      localStorage.setItem('authToken', 'mock-token')
    } catch (_error) {
      throw new Error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, _password: string, name: string, role: string) => {
    setIsLoading(true)
    try {
      // Mock registration - replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        name,
        role: role as User['role']
      }
      setUser(mockUser)
      localStorage.setItem('authToken', 'mock-token')
    } catch (_error) {
      throw new Error('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
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