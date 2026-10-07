import { useEffect, useState } from 'react'
import { getProjects, deleteProject } from '../../services/project.service.js'
import EditProjectForm from './EditProjectForm.jsx'

// The Projects section of the admin dashboard: a table with Edit and Delete buttons per row.
// The parent can ask for a reload by passing a new number as "refreshKey".
function ProjectsSection({ refreshKey }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingProject, setEditingProject] = useState(null) // the project being edited
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingId, setDeletingId] = useState(null) // id of the project being deleted
  const [deleteError, setDeleteError] = useState(null)

  // Fetches the latest projects. On a reload the old table stays visible
  // until the new data arrives.
  async function loadProjects() {
    try {
      const data = await getProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Could not load projects. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Runs when the section first appears, and again every time refreshKey changes.
  useEffect(() => {
    loadProjects()
  }, [refreshKey])

  function handleEditClick(project) {
    setSuccessMessage(null)
    setDeleteError(null)
    setEditingProject(project)
  }

  // Called by the edit form after a successful save.
  function handleUpdated() {
    setEditingProject(null) // close the edit form
    setDeleteError(null)
    setSuccessMessage('Project updated successfully.')
    loadProjects() // show the new values right away
  }

  async function handleDeleteClick(project) {
    // Ask first. If the admin cancels, do nothing.
    const confirmed = window.confirm(
      `Delete "${project.title}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(project.id) // disables the Delete buttons until we finish
    setSuccessMessage(null)
    setDeleteError(null)

    try {
      await deleteProject(project.id)

      // If this project's edit form was open, close it.
      if (editingProject && editingProject.id === project.id) {
        setEditingProject(null)
      }

      setSuccessMessage('Project deleted successfully.')
      await loadProjects() // show the updated list right away
    } catch (err) {
      console.error(err)
      setDeleteError('Could not delete project. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  let content

  if (loading) {
    content = <p className="text-gray-600">Loading projects...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else if (projects.length === 0) {
    content = <p className="text-gray-600">No projects yet.</p>
  } else {
    content = (
      // overflow-x-auto lets the table scroll sideways on small screens.
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Technologies</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {project.title}
                </td>
                <td className="px-4 py-3 text-gray-600">{project.slug}</td>
                <td className="px-4 py-3 text-gray-600">
                  {(project.technologies ?? []).join(', ')}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {project.featured ? 'Yes' : 'No'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(project)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(project)}
                      disabled={deletingId !== null}
                      className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === project.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">Projects</h2>

      {successMessage && (
        <p role="status" className="mt-4 text-sm font-medium text-green-700">
          {successMessage}
        </p>
      )}

      {deleteError && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-600">
          {deleteError}
        </p>
      )}

      {/* The key makes the form start fresh if you switch to another project. */}
      {editingProject && (
        <div className="mt-4">
          <EditProjectForm
            key={editingProject.id}
            project={editingProject}
            onUpdated={handleUpdated}
            onCancel={() => setEditingProject(null)}
          />
        </div>
      )}

      <div className="mt-4">{content}</div>
    </section>
  )
}

export default ProjectsSection
