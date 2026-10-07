import {
  createContactMessage,
  getAllContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '../services/contact.service.js'

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

// GET /api/contact
export async function getContactMessagesController(req, res) {
  try {
    const messages = await getAllContactMessages()
    res.status(200).json(messages)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to fetch contact messages:', error)
    res.status(500).json({ error: 'Failed to fetch contact messages' })
  }
}

// PATCH /api/contact/:id/status
export async function updateContactMessageStatusController(req, res) {
  try {
    const message = await updateContactMessageStatus(req.params.id, req.body?.status)
    res.status(200).json(message)
  } catch (error) {
    // A status that is not "read" or "unread" is the sender's mistake, so it gets a 400.
    if (error.statusCode === 400) {
      return res.status(400).json({ error: error.message })
    }

    // Log the real error on the server only; never send it to the client.
    console.error('Failed to update contact message status:', error)
    res.status(500).json({ error: 'Failed to update contact message status' })
  }
}

// DELETE /api/contact/:id
export async function deleteContactMessageController(req, res) {
  try {
    const message = await deleteContactMessage(req.params.id)
    res.status(200).json(message)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to delete contact message:', error)
    res.status(500).json({ error: 'Failed to delete contact message' })
  }
}
