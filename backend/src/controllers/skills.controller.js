import { getAllSkills } from '../services/skills.service.js'

// This controller handles the HTTP response for skills requests.
// The database work itself is done by the skills service.

export async function getSkills(req, res) {
  try {
    const skills = await getAllSkills()
    res.status(200).json(skills)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to fetch skills:', error)
    res.status(500).json({ error: 'Failed to fetch skills' })
  }
}
