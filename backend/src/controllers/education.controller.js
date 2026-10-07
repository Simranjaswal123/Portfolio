import { getAllEducation } from '../services/education.service.js'

// This controller handles the HTTP response for education requests.
// The database work itself is done by the education service.

export async function getEducation(req, res) {
  try {
    const education = await getAllEducation()
    res.status(200).json(education)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to fetch education:', error)
    res.status(500).json({ error: 'Failed to fetch education' })
  }
}
