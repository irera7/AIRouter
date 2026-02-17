'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [providerStats, setProviderStats] = useState<any>(null)
  const [modelStats, setModelStats] = useState<any>(null)
  const [costBreakdown, setCostBreakdown] = useState<any>(null)
  const [requestLogs, setRequestLogs] = useState<any[]>([])
  const [pagination, setPagination] = useState<any>({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => {
    loadAnalytics()
    loadRequestLogs()
  }, [])

  const loadAnalytics = async () => {
    try {
      // Use last 30 days by default
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      const [metricsData, providersData, modelsData, costData] = await Promise.all([
        apiClient.getAnalyticsMetrics('30d'),
        apiClient.getProviderStats(),
        apiClient.getModelStats(),
        apiClient.getCostBreakdown(),
      ])
      
      setMetrics(metricsData.data)
      setProviderStats(providersData.data)
      setModelStats(modelsData.data)
      setCostBreakdown(costData.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRequestLogs = async (page: number = 1) => {
    try {
      setLogsLoading(true)
      const response = await apiClient.getRequestLogs({ page, limit: 50 })
      setRequestLogs(response.data.requests)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to load request logs:', error)
    } finally {
      setLogsLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      error: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      timeout: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Prepare provider data for pie chart (convert cost from cents to dollars)
  const providerData = providerStats && Array.isArray(providerStats) ? providerStats.map((provider: any) => ({
    name: provider.providerName || 'Unknown',
    value: provider.requests,
    cost: (provider.totalCost || 0) / 100, // Convert cents to dollars
  })) : []

  // Prepare cost trend data (convert from cents to dollars)
  const costTrendData = costBreakdown?.trends?.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: (item.cost || 0) / 100, // Convert cents to dollars
    requests: item.requests,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Detailed insights into your API usage and costs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageLatency?.toFixed(0) || 0}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.cacheHitRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(Math.round((metrics?.cacheHitRate || 0) * (metrics?.totalRequests || 0) / 100))} hits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cost per 1K Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.totalTokens > 0 ? ((metrics?.totalCost / 100) / (metrics?.totalTokens / 1000)) : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across all models
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Provider Distribution</CardTitle>
            <CardDescription>Request distribution across LLM providers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={providerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {providerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Trend</CardTitle>
            <CardDescription>Daily cost over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#3b82f6" name="Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Performance</CardTitle>
          <CardDescription>Comparison of cost and requests by provider</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={providerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Requests" />
              <Bar yAxisId="right" dataKey="cost" fill="#10b981" name="Cost ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Models</CardTitle>
            <CardDescription>Most used AI models</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modelStats && Array.isArray(modelStats) && modelStats.slice(0, 5).map((model: any) => (
                <div key={model.model} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{model.model}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(model.requests)} requests
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency((model.totalCost || 0) / 100)}</span>
                    <span>{formatNumber(model.totalTokens)} tokens</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${metrics?.totalRequests ? (model.requests / metrics.totalRequests) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {(!modelStats || modelStats.length === 0) && (
                <div className="text-center text-muted-foreground py-4">
                  No model data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Input Tokens</span>
                <span className="text-sm font-medium">
                  {formatCurrency((costBreakdown?.inputCost || 0) / 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Output Tokens</span>
                <span className="text-sm font-medium">
                  {formatCurrency((costBreakdown?.outputCost || 0) / 100)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency((costBreakdown?.total || 0) / 100)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Logs</CardTitle>
          <CardDescription>Detailed history of all API requests</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : requestLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No usage data yet. Make some API requests to see them here!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-sm">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Provider / Model</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">App</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Tokens</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Cost</th>
                      <th className="text-right py-3 px-4 font-medium text-sm">Speed</th>
                      <th className="text-center py-3 px-4 font-medium text-sm">Finish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.provider}</span>
                            <span className="text-xs text-muted-foreground">{log.model}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{log.app}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-medium">{formatNumber(log.tokens.total)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatNumber(log.tokens.input)}↑ {formatNumber(log.tokens.output)}↓
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium">
                          {formatCurrency(Number(log.cost) / 100)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm">
                          {log.speed.toLocaleString()}ms
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} requests
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadRequestLogs(pagination.page - 1)}
                      disabled={pagination.page === 1 || logsLoading}
                      className="px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => loadRequestLogs(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages || logsLoading}
                      className="px-3 py-1 text-sm border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

