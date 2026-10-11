import { useEffect, useState } from 'react'
import { getProfile } from '../services/profile.service.js'

function About() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [photoFailed, setPhotoFailed] = useState(false)

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

  // The photo is cropped to a fixed frame (never stretched). If it is not set, or
  // it fails to load, it is simply left out and the text takes the full width.
  const photoUrl = !loading && !error && !photoFailed ? profile.profile_image_url : null

  return (
    <section id="about" className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          About Me
        </h2>

        <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={`Photo of ${profile.name}`}
              loading="lazy"
              decoding="async"
              onError={() => setPhotoFailed(true)}
              className="aspect-[4/5] w-44 shrink-0 rounded-lg border border-gray-200 bg-gray-100 object-cover shadow-sm sm:w-52"
            />
          )}
          <div className="max-w-3xl space-y-4 text-lg text-gray-600">{content}</div>
        </div>
      </div>
    </section>
  )
}

export default About
