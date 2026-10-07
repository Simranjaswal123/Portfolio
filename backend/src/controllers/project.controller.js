import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../services/project.service.js'

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

// PATCH /api/projects/:id
export async function updateProjectController(req, res) {
  try {
    const project = await updateProject(req.params.id, req.body)
    res.status(200).json(project)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to update project:', error)
    res.status(500).json({ error: 'Failed to update project' })
  }
}

// DELETE /api/projects/:id
export async function deleteProjectController(req, res) {
  try {
    const project = await deleteProject(req.params.id)
    res.status(200).json(project)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to delete project:', error)
    res.status(500).json({ error: 'Failed to delete project' })
  }
}
