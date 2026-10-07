import { getAllProjects, createProject } from '../services/project.service.js'

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

// POST /api/projects
export async function createProjectController(req, res) {
  try {
    const project = await createProject(req.body)
    res.status(201).json(project)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to create project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
}
