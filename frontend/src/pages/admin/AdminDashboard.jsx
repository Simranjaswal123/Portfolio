import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../../services/auth.service.js'
import ProjectForm from '../../components/admin/ProjectForm.jsx'
import ProjectsSection from '../../components/admin/ProjectsSection.jsx'

function AdminDashboard() {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function handleSignOut() {
    setSigningOut(true)
    setErrorMessage(null)

    try {
      await signOut()
      navigate('/admin/login') // signed out, so go back to the login page
    } catch (err) {
      console.error(err)
      setErrorMessage('Could not sign out. Please try again.')
      setSigningOut(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>

      {errorMessage && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <ProjectForm />
      <ProjectsSection />
    </main>
  )
}

export default AdminDashboard
