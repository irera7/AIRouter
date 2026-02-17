'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log('🔍 Dashboard layout: Checking authentication...')
    const token = localStorage.getItem('token')
    console.log('Token exists:', !!token)
    
    if (!token) {
      console.log('❌ No token found, redirecting to login...')
      window.location.href = '/login'
    } else {
      console.log('✅ Token found, user is authenticated')
      setIsAuthenticated(true)
    }
    setIsChecking(false)
  }, [])

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <DashboardNav />
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

