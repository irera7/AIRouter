'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="your@email.com" disabled />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Manage your organization settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Name</label>
            <Input placeholder="Your organization" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Plan</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium px-3 py-2 bg-primary/10 text-primary rounded">
                Pro Plan
              </span>
              <Button variant="outline" size="sm">Upgrade</Button>
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Manage your billing and credits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Current Balance</p>
              <p className="text-2xl font-bold text-primary">$100,000</p>
            </div>
            <Button>Add Credits</Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Payment Method</p>
            <div className="flex items-center gap-2 p-3 border rounded">
              <svg className="h-8 w-12" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="4" fill="#1434CB"/>
                <text x="24" y="20" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">VISA</text>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/25</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

