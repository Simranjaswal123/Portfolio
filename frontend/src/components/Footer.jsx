import { useEffect, useState } from 'react'
import { getProfile } from '../services/profile.service.js'

function Footer() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile()
        setProfile(data)
      } catch (err) {
        console.error(err)
        setError('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  // The footer always shows. If the profile failed to load, we have no name
  // or links, so we fall back to "My Portfolio" and show no social links.
  const name = error ? 'My Portfolio' : profile?.name
  const githubUrl = profile?.github_url
  const linkedinUrl = profile?.linkedin_url

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-sm text-gray-600 sm:flex-row sm:justify-between">
        <p>{loading ? 'Loading...' : `© 2026 ${name}. All rights reserved.`}</p>

        {(githubUrl || linkedinUrl) && (
          <ul className="flex gap-6">
            {githubUrl && (
              <li>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-black"
                >
                  GitHub
                </a>
              </li>
            )}
            {linkedinUrl && (
              <li>
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-black"
                >
                  LinkedIn
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
    </footer>
  )
}

export default Footer
