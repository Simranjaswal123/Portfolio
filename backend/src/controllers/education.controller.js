import {
  getAllEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from '../services/education.service.js'

// This controller handles the HTTP response for education requests.
// The database work itself is done by the education service.

// GET /api/education
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

// POST /api/education
export async function createEducationController(req, res) {
  try {
    const education = await createEducation(req.body)
    res.status(201).json(education)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to create education:', error)
    res.status(500).json({ error: 'Failed to create education' })
  }
}

// PATCH /api/education/:id
export async function updateEducationController(req, res) {
  try {
    const education = await updateEducation(req.params.id, req.body)
    res.status(200).json(education)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to update education:', error)
    res.status(500).json({ error: 'Failed to update education' })
  }
}

// DELETE /api/education/:id
export async function deleteEducationController(req, res) {
  try {
    const education = await deleteEducation(req.params.id)
    res.status(200).json(education)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to delete education:', error)
    res.status(500).json({ error: 'Failed to delete education' })
  }
}
