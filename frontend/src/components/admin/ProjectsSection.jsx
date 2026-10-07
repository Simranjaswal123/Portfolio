import { useEffect, useState } from 'react'
import { getProjects } from '../../services/project.service.js'

// The Projects section of the admin dashboard: a simple read-only table.
// The parent can ask for a reload by passing a new number as "refreshKey".
function ProjectsSection({ refreshKey }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs when the section first appears, and again every time refreshKey changes.
  // On a reload the old table stays visible until the new data arrives.
  useEffect(() => {
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

    loadProjects()
  }, [refreshKey])

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
      <div className="mt-4">{content}</div>
    </section>
  )
}

export default ProjectsSection
