// This service sends a contact message to the backend API.
// Returns the parsed JSON (the saved message), or throws if the request fails.
export async function createContactMessage(messageData) {
  const response = await fetch('http://localhost:5000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData),
  })

  if (!response.ok) {
    throw new Error(`Failed to send contact message (status ${response.status})`)
  }

  return await response.json()
}
