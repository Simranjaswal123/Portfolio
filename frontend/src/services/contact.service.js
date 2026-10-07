import { authenticatedFetch } from './api.js'

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

// Fetch all contact messages (newest first) from the backend API.
// Returns the parsed JSON (an array of messages), or throws if the request fails.
export async function getContactMessages() {
  const response = await authenticatedFetch('http://localhost:5000/api/contact')

  if (!response.ok) {
    throw new Error(`Failed to fetch contact messages (status ${response.status})`)
  }

  return await response.json()
}

// Set a message's status to "read" or "unread" through the backend API.
// Returns the updated message, or throws if the request fails.
export async function updateContactMessageStatus(id, status) {
  const response = await authenticatedFetch(`http://localhost:5000/api/contact/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error(`Failed to update contact message status (status ${response.status})`)
  }

  return await response.json()
}

// Delete a contact message through the backend API.
// Returns the deleted message, or throws if the request fails.
export async function deleteContactMessage(id) {
  const response = await authenticatedFetch(`http://localhost:5000/api/contact/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to delete contact message (status ${response.status})`)
  }

  return await response.json()
}
