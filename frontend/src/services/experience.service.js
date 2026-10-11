import { authenticatedFetch } from './api.js'
import { authenticatedUpload } from './upload.js'
import { API_URL } from '../config/api.js'

// This service fetches experience data from the backend API.
// Returns the parsed JSON (an array of experience entries), or throws if the request fails.
export async function getExperience() {
  const response = await fetch(`${API_URL}/api/experience`)

  if (!response.ok) {
    throw new Error(`Failed to fetch experience (status ${response.status})`)
  }

  return await response.json()
}

// Create a new experience entry through the backend API.
// Returns the created entry, or throws if the request fails.
export async function createExperience(experienceData) {
  const response = await authenticatedFetch(`${API_URL}/api/experience`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(experienceData),
  })

  if (!response.ok) {
    throw new Error(`Failed to create experience (status ${response.status})`)
  }

  return await response.json()
}

// Update an existing experience entry through the backend API.
// Returns the updated entry, or throws if the request fails.
export async function updateExperience(id, experienceData) {
  const response = await authenticatedFetch(`${API_URL}/api/experience/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(experienceData),
  })

  if (!response.ok) {
    throw new Error(`Failed to update experience (status ${response.status})`)
  }

  return await response.json()
}

// Delete an experience entry through the backend API.
// Returns the deleted entry, or throws if the request fails.
export async function deleteExperience(id) {
  const response = await authenticatedFetch(`${API_URL}/api/experience/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete experience (status ${response.status})`)
  }

  return await response.json()
}

// ---- Experience photos (admin only) -------------------------------------------

// Add one photo. Resolves with the new image row { id, image_url, alt_text, display_order }.
export async function uploadExperienceImage(id, file, onProgress) {
  return authenticatedUpload(`${API_URL}/api/experience/${id}/images`, file, { method: 'POST', onProgress })
}

// Delete one photo.
export async function deleteExperienceImage(id, imageId) {
  const response = await authenticatedFetch(`${API_URL}/api/experience/${id}/images/${imageId}`, { method: 'DELETE' })

  if (!response.ok) {
    throw new Error(`Failed to delete image (status ${response.status})`)
  }

  return await response.json()
}

// Save a new photo order. `order` lists every image id. Resolves with the images in order.
export async function reorderExperienceImages(id, order) {
  const response = await authenticatedFetch(`${API_URL}/api/experience/${id}/images/order`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  })

  if (!response.ok) {
    throw new Error(`Failed to reorder images (status ${response.status})`)
  }

  return await response.json()
}
