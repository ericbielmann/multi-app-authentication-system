'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// Client-side API URL - use relative path for nginx, or localhost for direct access
const getClientApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Check if we're accessing via nginx (same origin)
    if (window.location.port === '' || window.location.port === '80') {
      return '/api';
    }
    // Direct access to port 3000
    return 'http://localhost:5001/api';
  }
  return '/api';
};

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const apiUrl = getClientApiUrl()
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleLogout}
      className="border-border hover:bg-muted"
    >
      Sign Out
    </Button>
  )
}
