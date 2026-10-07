// This service fetches education data from the backend API.
// Returns the parsed JSON (an array of education entries), or throws if the request fails.
export async function getEducation() {
  const response = await fetch('http://localhost:5000/api/education')

  if (!response.ok) {
    throw new Error(`Failed to fetch education (status ${response.status})`)
  }

  return await response.json()
}
