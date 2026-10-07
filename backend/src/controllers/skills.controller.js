import {
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../services/skills.service.js'

// This controller handles the HTTP response for skills requests.
// The database work itself is done by the skills service.

// GET /api/skills
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

// POST /api/skills
export async function createSkillController(req, res) {
  try {
    const skill = await createSkill(req.body)
    res.status(201).json(skill)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to create skill:', error)
    res.status(500).json({ error: 'Failed to create skill' })
  }
}

// PATCH /api/skills/:id
export async function updateSkillController(req, res) {
  try {
    const skill = await updateSkill(req.params.id, req.body)
    res.status(200).json(skill)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to update skill:', error)
    res.status(500).json({ error: 'Failed to update skill' })
  }
}

// DELETE /api/skills/:id
export async function deleteSkillController(req, res) {
  try {
    const skill = await deleteSkill(req.params.id)
    res.status(200).json(skill)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to delete skill:', error)
    res.status(500).json({ error: 'Failed to delete skill' })
  }
}
