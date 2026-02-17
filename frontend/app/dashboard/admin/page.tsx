'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Users, Building2, Zap, DollarSign, Activity, Server, AlertTriangle } from 'lucide-react'

export default function AdminPanelPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [orgs, setOrgs] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role !== 'admin' && payload.role !== 'owner') {
          // Not admin, redirect to dashboard
          router.push('/dashboard')
          return
        }
        setIsAdmin(true)
      } catch (error) {
        console.error('Token decode error:', error)
        router.push('/dashboard')
        return
      }
    }

    loadAdminData()
  }, [router])

  const loadAdminData = async () => {
    try {
      const [statsData, usersData, orgsData, providersData] = await Promise.all([
        apiClient.getSystemStats().catch(() => ({ data: null })),
        apiClient.getUsers().catch(() => ({ data: [] })),
        apiClient.getOrganizations().catch(() => ({ data: [] })),
        apiClient.getProviders().catch(() => ({ data: [] })),
      ])
      
      setStats(statsData.data)
      setUsers(usersData.data || [])
      setOrgs(orgsData.data || [])
      setProviders(providersData.data || [])
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>⚡</span> Admin Panel
          </h1>
          <p className="text-muted-foreground">
            System-wide statistics and management
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <Users className="h-4 w-4 text-purple-700 dark:text-purple-300" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Admin Access
          </span>
        </div>
      </div>

      {/* Warning Banner if needed */}
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Admin Panel Access
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                You have full system access. Please be careful with administrative actions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats?.activeUsers || 0)} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalOrgs || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Across all plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalRequests || 0)}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalCost || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Total spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageLatency?.toFixed(0) || 0}ms</div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.errorRate?.toFixed(2) || 0}%</div>
            <p className="text-xs text-muted-foreground">
              System health
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>{users.length} total users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user.name || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>{orgs.length} total organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orgs.slice(0, 5).map((org: any) => (
                <div key={org.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{org.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {org.users?.length || 0} members
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(org.creditBalance)}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      org.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                      org.plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                      org.plan === 'starter' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {org.plan}
                    </span>
                  </div>
                </div>
              ))}
              {orgs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No organizations found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LLM Providers</CardTitle>
          <CardDescription>Provider status and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider: any) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{provider.displayName}</h3>
                    {provider.isActive ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-medium">{formatNumber(provider.metrics?.totalRequests || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{provider.metrics?.successRate?.toFixed(1) || 0}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Latency</p>
                      <p className="font-medium">{provider.metrics?.averageLatency?.toFixed(0) || 0}ms</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {providers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No providers configured
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
