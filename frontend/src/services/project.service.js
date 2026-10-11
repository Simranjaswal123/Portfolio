import { authenticatedFetch } from './api.js'
import { authenticatedUpload } from './upload.js'

// Fetch all projects from the backend API.
// Returns the parsed JSON (an array of projects), or throws if the request fails.
export async function getProjects() {
  const response = await fetch('http://localhost:5000/api/projects')

  if (!response.ok) {
    throw new Error(`Failed to fetch projects (status ${response.status})`)
  }

  return await response.json()
}

// Create a new project through the backend API.
// Returns the created project, or throws if the request fails.
export async function createProject(projectData) {
  const response = await authenticatedFetch('http://localhost:5000/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  })

  if (!response.ok) {
    throw new Error(`Failed to create project (status ${response.status})`)
  }

  return await response.json()
}

// Update an existing project through the backend API.
// Returns the updated project, or throws if the request fails.
export async function updateProject(id, projectData) {
  const response = await authenticatedFetch(`http://localhost:5000/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  })

  if (!response.ok) {
    throw new Error(`Failed to update project (status ${response.status})`)
  }

  return await response.json()
}

// Delete a project through the backend API.
// Returns the deleted project, or throws if the request fails.
export async function deleteProject(id) {
  const response = await authenticatedFetch(`http://localhost:5000/api/projects/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete project (status ${response.status})`)
  }

  return await response.json()
}

// ---- Project images (admin only) ----------------------------------------------

// Upload (or replace) the cover image. Resolves with { image_url }.
export async function uploadProjectCover(id, file, onProgress) {
  return authenticatedUpload(`http://localhost:5000/api/projects/${id}/cover-image`, file, { method: 'PUT', onProgress })
}

// Remove the cover image. Resolves with { image_url: null }.
export async function removeProjectCover(id) {
  const response = await authenticatedFetch(`http://localhost:5000/api/projects/${id}/cover-image`, { method: 'DELETE' })

  if (!response.ok) {
    throw new Error(`Failed to remove cover image (status ${response.status})`)
  }

  return await response.json()
}

// Add one screenshot. Resolves with the new image row { id, image_url, alt_text, display_order }.
export async function uploadProjectImage(id, file, onProgress) {
  return authenticatedUpload(`http://localhost:5000/api/projects/${id}/images`, file, { method: 'POST', onProgress })
}

// Delete one screenshot.
export async function deleteProjectImage(id, imageId) {
  const response = await authenticatedFetch(`http://localhost:5000/api/projects/${id}/images/${imageId}`, { method: 'DELETE' })

  if (!response.ok) {
    throw new Error(`Failed to delete image (status ${response.status})`)
  }

  return await response.json()
}

// Save a new screenshot order. `order` lists every image id. Resolves with the images in order.
export async function reorderProjectImages(id, order) {
  const response = await authenticatedFetch(`http://localhost:5000/api/projects/${id}/images/order`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  })

  if (!response.ok) {
    throw new Error(`Failed to reorder images (status ${response.status})`)
  }

  return await response.json()
}
