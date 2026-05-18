'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { usuario, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (usuario) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [usuario, isLoading, router])

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-pulse-subtle text-[var(--text-muted)]">
        Carregando...
      </div>
    </div>
  )
}
