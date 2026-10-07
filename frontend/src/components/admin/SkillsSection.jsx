import { useEffect, useState } from 'react'
import { getSkills, deleteSkill } from '../../services/skills.service.js'
import EditSkillForm from './EditSkillForm.jsx'

// The Skills section of the admin dashboard: a table with Edit and Delete buttons per row.
// The parent can ask for a reload by passing a new number as "refreshKey".
function SkillsSection({ refreshKey }) {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingSkill, setEditingSkill] = useState(null) // the skill being edited
  const [successMessage, setSuccessMessage] = useState(null)
  const [deletingId, setDeletingId] = useState(null) // id of the skill being deleted
  const [deleteError, setDeleteError] = useState(null)

  // Fetches the latest skills. On a reload the old table stays visible
  // until the new data arrives.
  async function loadSkills() {
    try {
      const data = await getSkills()
      setSkills(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Could not load skills. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Runs when the section first appears, and again every time refreshKey changes.
  useEffect(() => {
    loadSkills()
  }, [refreshKey])

  function handleEditClick(skill) {
    setSuccessMessage(null)
    setDeleteError(null)
    setEditingSkill(skill)
  }

  // Called by the edit form after a successful save.
  function handleUpdated() {
    setEditingSkill(null) // close the edit form
    setDeleteError(null)
    setSuccessMessage('Skill updated successfully.')
    loadSkills() // show the new values right away
  }

  async function handleDeleteClick(skill) {
    // Ask first. If the admin cancels, do nothing.
    const confirmed = window.confirm(
      `Delete "${skill.name}"? This cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(skill.id) // disables the Delete buttons until we finish
    setSuccessMessage(null)
    setDeleteError(null)

    try {
      await deleteSkill(skill.id)

      // If this skill's edit form was open, close it.
      if (editingSkill && editingSkill.id === skill.id) {
        setEditingSkill(null)
      }

      setSuccessMessage('Skill deleted successfully.')
      await loadSkills() // show the updated list right away
    } catch (err) {
      console.error(err)
      setDeleteError('Could not delete skill. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  let content

  if (loading) {
    content = <p className="text-gray-600">Loading skills...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else if (skills.length === 0) {
    content = <p className="text-gray-600">No skills yet.</p>
  } else {
    content = (
      // overflow-x-auto lets the table scroll sideways on small screens.
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Icon</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {skills.map((skill) => (
              <tr key={skill.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {skill.name}
                </td>
                <td className="px-4 py-3 text-gray-600">{skill.category}</td>
                <td className="px-4 py-3 text-gray-600">{skill.icon}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditClick(skill)}
                      className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-900 focus:outline-none"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(skill)}
                      disabled={deletingId !== null}
                      className="rounded-lg border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-600 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === skill.id ? 'Deleting...' : 'Delete'}
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
      <h2 className="text-xl font-semibold text-gray-900">Skills</h2>

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

      {/* The key makes the form start fresh if you switch to another skill. */}
      {editingSkill && (
        <div className="mt-4">
          <EditSkillForm
            key={editingSkill.id}
            skill={editingSkill}
            onUpdated={handleUpdated}
            onCancel={() => setEditingSkill(null)}
          />
        </div>
      )}

      <div className="mt-4">{content}</div>
    </section>
  )
}

export default SkillsSection
