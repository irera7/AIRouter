'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Key, 
  BarChart3, 
  Settings, 
  LogOut,
  Users,
  CreditCard,
  BookOpen,
  ExternalLink,
  FlaskConical
} from 'lucide-react'
import { apiClient } from '@/lib/api'

const userNavigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'API Playground', href: '/dashboard/playground', icon: FlaskConical },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const adminNavigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'API Playground', href: '/dashboard/playground', icon: FlaskConical },
  { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Admin Panel', href: '/dashboard/admin', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string>('user')

  // Check user role from localStorage or API
  useEffect(() => {
    const checkUserRole = () => {
      // Try to get user info from token or API
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        try {
          // Decode JWT to get role (simple base64 decode)
          const payload = JSON.parse(atob(token.split('.')[1]))
          setUserRole(payload.role || 'user')
        } catch (error) {
          console.error('Failed to decode token:', error)
        }
      }
    }
    
    checkUserRole()
  }, [])

  const handleLogout = () => {
    apiClient.clearToken()
    router.push('/login')
  }

  // Choose navigation based on role
  const navigation = (userRole === 'admin' || userRole === 'owner') 
    ? adminNavigation 
    : userNavigation

  return (
    <div className="flex h-screen flex-col justify-between border-r bg-white dark:bg-gray-900">
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold">AIRouter</span>
        </div>

        {/* User Role Badge */}
        <div className="px-2 mb-4">
          <span className={cn(
            "text-xs px-2 py-1 rounded-full",
            (userRole === 'admin' || userRole === 'owner')
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
          )}>
            {userRole === 'owner' ? '👑 Owner' : userRole === 'admin' ? '⚡ Admin' : '👤 User'}
          </span>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}

          {/* Divider */}
          <div className="py-2">
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Documentation Link - Internal */}
          <Link
            href="/docs"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <BookOpen className="h-5 w-5" />
            <span className="flex-1">Documentation</span>
          </Link>

          {/* API Docs Link - Swagger (External) */}
          <a
            href={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/docs'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <BookOpen className="h-5 w-5" />
            <span className="flex-1">Interactive API</span>
            <ExternalLink className="h-4 w-4 opacity-50" />
          </a>
        </nav>
      </div>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}

