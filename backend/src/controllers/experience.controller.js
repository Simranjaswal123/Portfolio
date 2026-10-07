import {
  getAllExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../services/experience.service.js'

// This controller handles the HTTP response for experience requests.
// The database work itself is done by the experience service.

// GET /api/experience
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

// POST /api/experience
export async function createExperienceController(req, res) {
  try {
    const experience = await createExperience(req.body)
    res.status(201).json(experience)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to create experience:', error)
    res.status(500).json({ error: 'Failed to create experience' })
  }
}

// PATCH /api/experience/:id
export async function updateExperienceController(req, res) {
  try {
    const experience = await updateExperience(req.params.id, req.body)
    res.status(200).json(experience)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to update experience:', error)
    res.status(500).json({ error: 'Failed to update experience' })
  }
}

// DELETE /api/experience/:id
export async function deleteExperienceController(req, res) {
  try {
    const experience = await deleteExperience(req.params.id)
    res.status(200).json(experience)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to delete experience:', error)
    res.status(500).json({ error: 'Failed to delete experience' })
  }
}
