import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api'

export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('AppSession')
  
  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const apiUrl = getApiUrl()
    const fullUrl = `${apiUrl}/api/auth/session`
    
    const cookieHeader = `AppSession=${sessionCookie.value}`
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return NextResponse.json({ authenticated: false }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Session check failed:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

