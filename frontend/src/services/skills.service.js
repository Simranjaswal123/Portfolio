// This service fetches skills data from the backend API.
// Returns the parsed JSON (an array of skills), or throws if the request fails.
export async function getSkills() {
  const response = await fetch('http://localhost:5000/api/skills')

  if (!response.ok) {
    throw new Error(`Failed to fetch skills (status ${response.status})`)
  }

  return await response.json()
}
