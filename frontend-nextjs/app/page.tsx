import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/logout-button'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getApiUrl } from '@/lib/api'

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('AppSession')
  
  if (!sessionCookie) {
    return null
  }

  try {
    const apiUrl = getApiUrl()
    const fullUrl = `${apiUrl}/api/auth/session`
    console.log('Checking session:', { apiUrl, fullUrl, hasCookie: !!sessionCookie, cookieValue: sessionCookie?.value?.substring(0, 20) + '...' })
    
    // Build cookie header properly - escape the cookie value if needed
    const cookieHeader = `AppSession=${sessionCookie.value}`
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader
      },
      cache: 'no-store',
      // Next.js server-side fetch may need this
      next: { revalidate: 0 }
    })
    
    console.log('Session check response:', response.status, response.statusText, response.url)
    
    if (!response.ok) {
      const text = await response.text()
      console.log('Error response body:', text.substring(0, 200))
      return null
    }

    const data = await response.json()
    console.log('Session data:', data)
    return data.authenticated ? data : null
  } catch (error) {
    console.error('Session check failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack)
    }
    return null
  }

  return null
}

export default async function Home() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Application Hub</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {session.name}
            </h2>
            <p className="text-muted-foreground">
              {session.userType === 'admin' ? session.email : session.phone}
            </p>
          </div>

          <Card className="p-8 border-border bg-card">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Your Application
                  </h3>
                  <p className="text-muted-foreground">
                    Continue where you left off. Your progress has been saved and is ready to resume.
                  </p>
                </div>
                <Link href="http://localhost:4200" target="_blank">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Resume Application
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-6 border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground">Documents</h4>
              </div>
              <p className="text-sm text-muted-foreground">View and manage your uploaded documents</p>
            </Card>

            <Card className="p-6 border-border bg-card hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-foreground">Settings</h4>
              </div>
              <p className="text-sm text-muted-foreground">Update your profile and preferences</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
