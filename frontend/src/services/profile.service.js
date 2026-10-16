import { authenticatedFetch } from './api.js'
import { authenticatedUpload } from './upload.js'
import { API_URL } from '../config/api.js'

// The request currently on its way, if any. The hero, About, Contact and the footer
// all ask for the profile as the page opens; they share this one request instead of
// sending four. It is forgotten as soon as it finishes, so a later call (for example
// after the admin changes the photo) always fetches fresh data.
let pendingProfile = null

// This service fetches the profile from the backend API.
// Returns the parsed JSON (one profile object), or throws if the request fails.
export function getProfile() {
  if (!pendingProfile) {
    pendingProfile = fetchProfile().finally(() => {
      pendingProfile = null
    })
  }

  return pendingProfile
}

async function fetchProfile() {
  const response = await fetch(`${API_URL}/api/profile`)

  if (!response.ok) {
    throw new Error(`Failed to fetch profile (status ${response.status})`)
  }

  return await response.json()
}

// Upload (or replace) the profile photo. The file is sent as the request body.
// Resolves with { image_url }. Admin only.
export async function uploadProfileImage(file, onProgress) {
  return authenticatedUpload(`${API_URL}/api/profile/image`, file, { method: 'PUT', onProgress })
}

// Remove the profile photo. Resolves with { image_url: null }. Admin only.
export async function removeProfileImage() {
  const response = await authenticatedFetch(`${API_URL}/api/profile/image`, { method: 'DELETE' })

  if (!response.ok) {
    throw new Error(`Failed to remove profile image (status ${response.status})`)
  }

  return await response.json()
}
