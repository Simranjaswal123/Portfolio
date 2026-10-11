import { authenticatedFetch } from './api.js'
import { authenticatedUpload } from './upload.js'

// This service fetches the profile from the backend API.
// Returns the parsed JSON (one profile object), or throws if the request fails.
export async function getProfile() {
  const response = await fetch('http://localhost:5000/api/profile')

  if (!response.ok) {
    throw new Error(`Failed to fetch profile (status ${response.status})`)
  }

  return await response.json()
}

// Upload (or replace) the profile photo. The file is sent as the request body.
// Resolves with { image_url }. Admin only.
export async function uploadProfileImage(file, onProgress) {
  return authenticatedUpload('http://localhost:5000/api/profile/image', file, { method: 'PUT', onProgress })
}

// Remove the profile photo. Resolves with { image_url: null }. Admin only.
export async function removeProfileImage() {
  const response = await authenticatedFetch('http://localhost:5000/api/profile/image', { method: 'DELETE' })

  if (!response.ok) {
    throw new Error(`Failed to remove profile image (status ${response.status})`)
  }

  return await response.json()
}
