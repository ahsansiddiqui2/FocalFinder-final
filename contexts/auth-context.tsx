"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "client" | "photographer" | "admin"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: "client" | "photographer"
    specialty?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      console.log("[v0] Refreshing user data...")

      const testResponse = await apiClient.testConnection()
      console.log("[v0] API test response:", testResponse)

      const response = await apiClient.getCurrentUser()
      console.log("[v0] getCurrentUser response:", response)

      if (response.data?.user) {
        setUser(response.data.user)
        console.log("[v0] User set:", response.data.user)
      } else {
        console.log("[v0] No user data, setting to null")
        setUser(null)
      }
    } catch (error) {
      console.error("[v0] Failed to refresh user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      if (response.data?.user) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.error || "Login failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const signup = async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: "client" | "photographer"
    specialty?: string
  }) => {
    try {
      const response = await apiClient.signup(userData)
      if (response.data?.user) {
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.error || "Signup failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error occurred" }
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
