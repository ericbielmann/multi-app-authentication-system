'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// Client-side API URL - use relative path for nginx, or localhost for direct access
const getClientApiUrl = () => {
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    // Check if we're accessing via nginx (same origin, no port or port 80)
    if (port === '' || port === '80') {
      return '/api';
    }
    // Direct access to port 3000 - use localhost:5001
    return 'http://localhost:5001/api';
  }
  return '/api';
};

export function LoginForm() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiUrl = getClientApiUrl()
      const fullUrl = `${apiUrl}/auth/login/phone`
      console.log('Login attempt:', { apiUrl, fullUrl, phone, otp })
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ phone, otp }),
      })

      console.log('Login response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Login error response:', errorText)
        try {
          const errorData = JSON.parse(errorText)
          setError(errorData.message || 'Invalid phone or OTP')
        } catch {
          setError(`Server error: ${response.status} ${response.statusText}`)
        }
        return
      }

      const data = await response.json()
      console.log('Login response data:', data)

      if (data.success) {
        console.log('Login successful, redirecting to /')
        // Use window.location for a full page reload to ensure cookies are sent
        window.location.href = '/'
      } else {
        setError(data.message || 'Invalid phone or OTP')
      }
    } catch (err) {
      console.error('Login exception:', err)
      setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 border-border bg-card">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone Number
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="bg-background border-border"
          />
          <p className="text-xs text-muted-foreground">
            Try: +1234567890
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="otp" className="text-sm font-medium text-foreground">
            OTP Code
          </label>
          <Input
            id="otp"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            maxLength={6}
            className="bg-background border-border"
          />
          <p className="text-xs text-muted-foreground">
            Enter OTP: 123456
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Card>
  )
}
