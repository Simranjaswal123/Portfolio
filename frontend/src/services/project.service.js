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
  const response = await fetch('http://localhost:5000/api/projects', {
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
  const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  })

  if (!response.ok) {
    throw new Error(`Failed to update project (status ${response.status})`)
  }

  return await response.json()
}
