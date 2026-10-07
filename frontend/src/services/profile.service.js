// This service fetches the profile from the backend API.
// Returns the parsed JSON (one profile object), or throws if the request fails.
export async function getProfile() {
  const response = await fetch('http://localhost:5000/api/profile')

  if (!response.ok) {
    throw new Error(`Failed to fetch profile (status ${response.status})`)
  }

  return await response.json()
}
