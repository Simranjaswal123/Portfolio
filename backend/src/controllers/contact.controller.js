import { createContactMessage } from '../services/contact.service.js'

// This controller handles the HTTP response for contact requests.
// The database work itself is done by the contact service.

export async function createContact(req, res) {
  try {
    const message = await createContactMessage(req.body)
    res.status(201).json(message)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to send contact message:', error)
    res.status(500).json({ error: 'Failed to send contact message' })
  }
}
