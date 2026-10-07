import { useEffect, useState } from 'react'
import {
  getEducation,
  deleteEducation,
} from '../../services/education.service.js'
import EditEducationForm from './EditEducationForm.jsx'

// The Education section of the admin dashboard: a table with Edit and Delete buttons per row.
// The parent can ask for a reload by passing a new number as "refreshKey".
function EducationSection({ refreshKey }) {
  const [educationEntries, setEducationEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingEducation, setEditingEducation] = useState(null) // the record being edited
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingId, setDeletingId] = useState(null) // id of the record being deleted
  const [deleteError, setDeleteError] = useState(null)

  // Fetches the latest education records. On a reload the old table stays
  // visible until the new data arrives.
  async function loadEducation() {
    try {
      const data = await getEducation()
      setEducationEntries(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Could not load education. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Runs when the section first appears, and again every time refreshKey changes.
  useEffect(() => {
    loadEducation()
  }, [refreshKey])

  function handleEditClick(education) {
    setSuccessMessage(null)
    setDeleteError(null)
    setEditingEducation(education)
  }

  // Called by the edit form after a successful save.
  function handleUpdated() {
    setEditingEducation(null) // close the edit form
    setDeleteError(null)
    setSuccessMessage('Education updated successfully.')
    loadEducation() // show the new values right away
  }

  async function handleDeleteClick(education) {
    // Ask first. If the admin cancels, do nothing.
    const confirmed = window.confirm(
      `Delete "${education.degree} at ${education.institution}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(education.id) // disables the Delete buttons until we finish
    setSuccessMessage(null)
    setDeleteError(null)

    try {
      await deleteEducation(education.id)

      // If this record's edit form was open, close it.
      if (editingEducation && editingEducation.id === education.id) {
        setEditingEducation(null)
      }

      setSuccessMessage('Education deleted successfully.')
      await loadEducation() // show the updated list right away
    } catch (err) {
      console.error(err)
      setDeleteError('Could not delete education. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  let content

  if (loading) {
    content = <p className="text-gray-600">Loading education...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else if (educationEntries.length === 0) {
    content = <p className="text-gray-600">No education yet.</p>
  } else {
    content = (
      // overflow-x-auto lets the table scroll sideways on small screens.
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Institution</th>
              <th className="px-4 py-3 font-semibold">Degree</th>
              <th className="px-4 py-3 font-semibold">Field</th>
              <th className="px-4 py-3 font-semibold">Start Date</th>
              <th className="px-4 py-3 font-semibold">End Date</th>
              <th className="px-4 py-3 font-semibold">Description</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {educationEntries.map((education) => (
              <tr key={education.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {education.institution}
                </td>
                <td className="px-4 py-3 text-gray-600">{education.degree}</td>
                <td className="px-4 py-3 text-gray-600">{education.field}</td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {education.start_date}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                  {education.end_date || 'Present'}
                </td>
                <td className="max-w-xs px-4 py-3 text-gray-600">
                  <span className="line-clamp-2">{education.description}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(education)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(education)}
                      disabled={deletingId !== null}
                      className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === education.id ? 'Deleting...' : 'Delete'}
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
      <h2 className="text-xl font-semibold text-gray-900">Education</h2>

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

      {/* The key makes the form start fresh if you switch to another record. */}
      {editingEducation && (
        <div className="mt-4">
          <EditEducationForm
            key={editingEducation.id}
            education={editingEducation}
            onUpdated={handleUpdated}
            onCancel={() => setEditingEducation(null)}
          />
        </div>
      )}

      <div className="mt-4">{content}</div>
    </section>
  )
}

export default EducationSection
