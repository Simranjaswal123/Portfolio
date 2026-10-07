import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import supabase from '../config/supabase.js'

// Wraps a page that only a signed-in admin should see.
// Usage: <ProtectedRoute><AdminDashboard /></ProtectedRoute>
function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check once, when the page first loads, whether a session already exists.
    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
      } catch (err) {
        console.error(err)
        setSession(null) // if the check fails, treat the visitor as signed out
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Keep listening, so signing out (even in another tab) updates this page.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  // Wait for the first check to finish, so the page never flashes before we know.
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute
