import { getAllProjects } from '../services/project.service.js'

// GET /api/projects
export async function getProjects(req, res) {
  try {
    const projects = await getAllProjects()
    res.status(200).json(projects)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to fetch projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
}
