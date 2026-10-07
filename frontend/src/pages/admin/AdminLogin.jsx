import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../services/auth.service.js'

// Shared styles for the text fields, so each input stays short.
const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none'

function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    // Start fresh: hide any message from a previous attempt.
    setSubmitting(true)
    setErrorMessage(null)

    try {
      await signIn(email, password)
      navigate('/admin/dashboard') // signed in, so go to the dashboard
    } catch (err) {
      console.error(err)
      // The email and password stay filled in, so the admin can try again.
      setErrorMessage('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Admin Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className={inputClasses}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className={inputClasses}
            />
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default AdminLogin
