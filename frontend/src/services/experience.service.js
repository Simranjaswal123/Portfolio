// This service fetches experience data from the backend API.
// Returns the parsed JSON (an array of experience entries), or throws if the request fails.
export async function getExperience() {
  const response = await fetch('http://localhost:5000/api/experience')

  if (!response.ok) {
    throw new Error(`Failed to fetch experience (status ${response.status})`)
  }

  return await response.json()
}
