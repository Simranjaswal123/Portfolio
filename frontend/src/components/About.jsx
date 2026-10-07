import { useEffect, useState } from 'react'
import { getProfile } from '../services/profile.service.js'

function About() {
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
        setError('Could not load profile. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  // The section and heading always render, so the #about link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = <p>Loading...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else {
    // whitespace-pre-line keeps any line breaks typed into the bio.
    content = <p className="whitespace-pre-line">{profile.bio}</p>
  }

  return (
    <section id="about" className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          About Me
        </h2>

        <div className="mx-auto mt-6 max-w-3xl space-y-4 text-lg text-gray-600 sm:mx-0">
          {content}
        </div>
      </div>
    </section>
  )
}

export default About
