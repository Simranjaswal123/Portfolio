import { useEffect, useState } from 'react'
import {
  getExperience,
  deleteExperience,
} from '../../services/experience.service.js'
import EditExperienceForm from './EditExperienceForm.jsx'

// The Experience section of the admin dashboard: a table with Edit and Delete buttons per row.
// The parent can ask for a reload by passing a new number as "refreshKey".
function ExperienceSection({ refreshKey }) {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingExperience, setEditingExperience] = useState(null) // the entry being edited
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingId, setDeletingId] = useState(null) // id of the entry being deleted
  const [deleteError, setDeleteError] = useState(null)

  // Fetches the latest experience. On a reload the old table stays visible
  // until the new data arrives.
  async function loadExperience() {
    try {
      const data = await getExperience()
      setExperiences(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Could not load experience. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Runs when the section first appears, and again every time refreshKey changes.
  useEffect(() => {
    loadExperience()
  }, [refreshKey])

  function handleEditClick(experience) {
    setSuccessMessage(null)
    setDeleteError(null)
    setEditingExperience(experience)
  }

  // Called by the edit form after a successful save.
  function handleUpdated() {
    setEditingExperience(null) // close the edit form
    setDeleteError(null)
    setSuccessMessage('Experience updated successfully.')
    loadExperience() // show the new values right away
  }

  async function handleDeleteClick(experience) {
    // Ask first. If the admin cancels, do nothing.
    const confirmed = window.confirm(
      `Delete "${experience.role} at ${experience.company}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(experience.id) // disables the Delete buttons until we finish
    setSuccessMessage(null)
    setDeleteError(null)

    try {
      await deleteExperience(experience.id)

      // If this entry's edit form was open, close it.
      if (editingExperience && editingExperience.id === experience.id) {
        setEditingExperience(null)
      }

      setSuccessMessage('Experience deleted successfully.')
      await loadExperience() // show the updated list right away
    } catch (err) {
      console.error(err)
      setDeleteError('Could not delete experience. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  let content

  if (loading) {
    content = <p className="text-gray-600">Loading experience...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else if (experiences.length === 0) {
    content = <p className="text-gray-600">No experience yet.</p>
  } else {
    content = (
      // overflow-x-auto lets the table scroll sideways on small screens.
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Start Date</th>
              <th className="px-4 py-3 font-semibold">End Date</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {experiences.map((experience) => (
              <tr key={experience.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {experience.company}
                </td>
                <td className="px-4 py-3 text-gray-600">{experience.role}</td>
                <td className="px-4 py-3 text-gray-600">{experience.location}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {experience.start_date}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {experience.end_date || 'Present'}
                </td>
                <td className="max-w-xs px-4 py-3 text-gray-600">
                  <span className="line-clamp-2">{experience.description}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(experience)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(experience)}
                      disabled={deletingId !== null}
                      className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === experience.id ? 'Deleting...' : 'Delete'}
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
      <h2 className="text-xl font-semibold text-gray-900">Experience</h2>

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

      {/* The key makes the form start fresh if you switch to another entry. */}
      {editingExperience && (
        <div className="mt-4">
          <EditExperienceForm
            key={editingExperience.id}
            experience={editingExperience}
            onUpdated={handleUpdated}
            onCancel={() => setEditingExperience(null)}
          />
        </div>
      )}

      <div className="mt-4">{content}</div>
    </section>
  )
}

export default ExperienceSection
