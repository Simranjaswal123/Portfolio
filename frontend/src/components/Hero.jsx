import { useEffect, useState } from 'react'
import { getProfile } from '../services/profile.service.js'

function Hero() {
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

  // Only the text changes while loading or on error.
  // The buttons below always show, because they don't depend on the profile.
  let content

  if (loading) {
    content = <p className="text-lg text-gray-600">Loading...</p>
  } else if (error) {
    content = <p className="text-lg text-red-600">{error}</p>
  } else {
    content = (
      <>
        <p className="text-lg font-medium text-gray-600">Hi, I'm {profile.name}</p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          {profile.headline}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:mx-0">
          {profile.bio}
        </p>
      </>
    )
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24 sm:text-left">
        {content}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="#projects"
            className="rounded-lg bg-gray-900 px-6 py-3 text-center font-medium text-white hover:bg-gray-700"
          >
            View My Projects
          </a>
          <a
            href="#contact"
            className="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-900 hover:bg-gray-100"
          >
            Contact Me
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
