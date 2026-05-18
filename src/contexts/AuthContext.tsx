'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Usuario } from '@/types'

interface AuthContextType {
  usuario: Usuario | null
  isLoading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('usuario')
    if (stored) {
      try {
        setUsuario(JSON.parse(stored))
      } catch {
        localStorage.removeItem('usuario')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, senha: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Erro ao fazer login')
    }

    const { usuario: user } = await res.json()
    setUsuario(user)
    localStorage.setItem('usuario', JSON.stringify(user))
  }, [])

  const logout = useCallback(() => {
    setUsuario(null)
    localStorage.removeItem('usuario')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        login,
        logout,
        isAdmin: usuario?.perfil === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
