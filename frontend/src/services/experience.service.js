// This service fetches experience data from the backend API.
// Returns the parsed JSON (an array of experience entries), or throws if the request fails.
export async function getExperience() {
  const response = await fetch('http://localhost:5000/api/experience')

  if (!response.ok) {
    throw new Error(`Failed to fetch experience (status ${response.status})`)
  }

  return await response.json()
}

// Create a new experience entry through the backend API.
// Returns the created entry, or throws if the request fails.
export async function createExperience(experienceData) {
  const response = await fetch('http://localhost:5000/api/experience', {
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
  const response = await fetch(`http://localhost:5000/api/experience/${id}`, {
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
  const response = await fetch(`http://localhost:5000/api/experience/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete experience (status ${response.status})`)
  }

  return await response.json()
}
