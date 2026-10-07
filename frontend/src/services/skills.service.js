import { authenticatedFetch } from './api.js'

// This service fetches skills data from the backend API.
// Returns the parsed JSON (an array of skills), or throws if the request fails.
export async function getSkills() {
  const response = await fetch('http://localhost:5000/api/skills')

  if (!response.ok) {
    throw new Error(`Failed to fetch skills (status ${response.status})`)
  }

  return await response.json()
}

// Create a new skill through the backend API.
// Returns the created skill, or throws if the request fails.
export async function createSkill(skillData) {
  const response = await authenticatedFetch('http://localhost:5000/api/skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(skillData),
  })

  if (!response.ok) {
    throw new Error(`Failed to create skill (status ${response.status})`)
  }

  return await response.json()
}

// Update an existing skill through the backend API.
// Returns the updated skill, or throws if the request fails.
export async function updateSkill(id, skillData) {
  const response = await authenticatedFetch(`http://localhost:5000/api/skills/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(skillData),
  })

  if (!response.ok) {
    throw new Error(`Failed to update skill (status ${response.status})`)
  }

  return await response.json()
}

// Delete a skill through the backend API.
// Returns the deleted skill, or throws if the request fails.
export async function deleteSkill(id) {
  const response = await authenticatedFetch(`http://localhost:5000/api/skills/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete skill (status ${response.status})`)
  }

  return await response.json()
}
