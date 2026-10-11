import { useEffect, useState } from 'react'
import { getProfile, removeProfileImage, uploadProfileImage } from '../../services/profile.service.js'
import SingleImageField from './images/SingleImageField.jsx'

// The Profile section of the admin dashboard: the personal photo shown in the
// About section of the public site.
function ProfileImageSection() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once, when the section first appears on the page.
  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(await getProfile())
      } catch (err) {
        console.error(err)
        setError('Could not load the profile. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  let content

  if (loading) {
    content = <p className="text-gray-600">Loading profile...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else {
    content = (
      <SingleImageField
        label="Profile photo"
        imageUrl={profile.profile_image_url}
        alt={`Profile photo of ${profile.name}`}
        onUpload={(file, onProgress) => uploadProfileImage(file, onProgress)}
        onRemove={() => removeProfileImage()}
        onChanged={(result) => setProfile({ ...profile, profile_image_url: result.image_url })}
      />
    )
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
      <p className="mt-1 text-sm text-gray-500">Your photo appears in the About section of the public site.</p>
      <div className="mt-4 rounded-lg border border-gray-200 p-6 shadow-sm">{content}</div>
    </section>
  )
}

export default ProfileImageSection
