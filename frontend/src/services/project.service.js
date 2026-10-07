// Fetch all projects from the backend API.
// Returns the parsed JSON (an array of projects), or throws if the request fails.
export async function getProjects() {
  const response = await fetch('http://localhost:5000/api/projects')

  if (!response.ok) {
    throw new Error(`Failed to fetch projects (status ${response.status})`)
  }

  return await response.json()
}
