import { authenticatedFetch } from './api.js'

// This service fetches education data from the backend API.
// Returns the parsed JSON (an array of education entries), or throws if the request fails.
export async function getEducation() {
  const response = await fetch('http://localhost:5000/api/education')

  if (!response.ok) {
    throw new Error(`Failed to fetch education (status ${response.status})`)
  }

  return await response.json()
}

// Create a new education record through the backend API.
// Returns the created record, or throws if the request fails.
export async function createEducation(educationData) {
  const response = await authenticatedFetch('http://localhost:5000/api/education', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(educationData),
  })

  if (!response.ok) {
    throw new Error(`Failed to create education (status ${response.status})`)
  }

  return await response.json()
}

// Update an existing education record through the backend API.
// Returns the updated record, or throws if the request fails.
export async function updateEducation(id, educationData) {
  const response = await authenticatedFetch(`http://localhost:5000/api/education/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(educationData),
  })

  if (!response.ok) {
    throw new Error(`Failed to update education (status ${response.status})`)
  }

  return await response.json()
}

// Delete an education record through the backend API.
// Returns the deleted record, or throws if the request fails.
export async function deleteEducation(id) {
  const response = await authenticatedFetch(`http://localhost:5000/api/education/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete education (status ${response.status})`)
  }

  return await response.json()
}
