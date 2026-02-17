'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { StripePaymentForm } from '@/components/stripe-payment-form'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  Download,
  X
} from 'lucide-react'

interface BillingEvent {
  id: string
  type: 'credit' | 'debit' | 'refund'
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  createdAt: string
}

export default function BillingPage() {
  const [balance, setBalance] = useState<number>(0)
  const [events, setEvents] = useState<BillingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [showStripeModal, setShowStripeModal] = useState(false)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [pendingAmount, setPendingAmount] = useState<number>(0)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      
      // Get current balance
      const balanceResponse = await apiClient.request<any>('/api/v1/billing/balance')
      if (balanceResponse.success) {
        setBalance(balanceResponse.data.balance)
      }

      // Get billing events
      const eventsResponse = await apiClient.request<any>('/api/v1/billing/events?limit=50')
      if (eventsResponse.success) {
        setEvents(eventsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load billing data:', error)
      // Set default values on error
      setBalance(0)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await apiClient.request<any>('/api/v1/analytics/export', {
        method: 'POST',
        body: JSON.stringify({
          format: 'csv',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        }),
      })

      if (response.success && response.data) {
        // Create blob and download
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `billing-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data')
    }
  }

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      setProcessing(true)
      
      // Create Stripe Payment Intent
      const response = await apiClient.request<any>('/api/v1/billing/payment-intent', {
        method: 'POST',
        body: JSON.stringify({ amount })
      })
      
      if (response.success && response.data.clientSecret) {
        setClientSecret(response.data.clientSecret)
        setPendingAmount(amount)
        setShowStripeModal(true)
      } else {
        throw new Error('Failed to create payment intent')
      }
    } catch (error) {
      console.error('Payment setup failed:', error)
      alert(`Payment setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = async () => {
    setShowStripeModal(false)
    setClientSecret('')
    setPaymentAmount('')
    setPendingAmount(0)
    
    // Reload billing data after successful payment
    await loadBillingData()
    
    alert(`Successfully added $${pendingAmount} to your account!`)
  }

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`)
  }

  const handleCloseModal = () => {
    setShowStripeModal(false)
    setClientSecret('')
    setPendingAmount(0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'credit': return 'text-green-600'
      case 'debit': return 'text-red-600'
      case 'refund': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'credit': return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'debit': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
      case 'refund': return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      {/* Stripe Payment Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-6">
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={pendingAmount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground mt-2">
            Manage your credits, view usage, and add funds to your account
          </p>
        </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available credits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total spent this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Daily Cost
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 7 days average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Credit Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Credits
          </CardTitle>
          <CardDescription>
            Add funds to your account to continue using AI services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCredit} className="flex gap-4 max-w-md">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="Amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="pl-7"
                required
              />
            </div>
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Add Credit'
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4">
            💳 Supported payment methods: Credit Card, Debit Card, PayPal
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your billing transactions and usage charges
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-muted rounded-full">
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getEventColor(event.type)}`}>
                      {event.type === 'debit' ? '-' : '+'}
                      {formatCurrency(event.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Balance: {formatCurrency(event.balanceAfter)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Details Link */}
      <Card>
        <CardHeader>
          <CardTitle>Need detailed usage reports?</CardTitle>
          <CardDescription>
            View comprehensive analytics and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/dashboard/analytics">
            <Button variant="outline">
              View Analytics Dashboard
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </CardContent>
      </Card>
      </div>
    </>
  )
}

