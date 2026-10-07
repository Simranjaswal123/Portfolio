import { getAllExperience } from '../services/experience.service.js'

// This controller handles the HTTP response for experience requests.
// The database work itself is done by the experience service.

export async function getExperience(req, res) {
  try {
    const experience = await getAllExperience()
    res.status(200).json(experience)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to fetch experience:', error)
    res.status(500).json({ error: 'Failed to fetch experience' })
  }
}
