import { useState } from 'react'
import { updateSkill } from '../../services/skills.service.js'

// Shared styles for the text fields, so each input stays short.
const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none'
const labelClasses = 'block text-sm font-medium text-gray-700'

// Builds the starting form values from an existing skill.
// Empty (null) values become empty text.
function skillToFormData(skill) {
  return {
    name: skill.name ?? '',
    category: skill.category ?? '',
    icon: skill.icon ?? '',
  }
}

// The "Edit Skill" form. It opens already filled in with the skill's values.
// "onUpdated" is called after a successful save; "onCancel" closes the form.
function EditSkillForm({ skill, onUpdated, onCancel }) {
  const [formData, setFormData] = useState(skillToFormData(skill))
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Runs on every keystroke. The input's "name" tells us which field to update.
  function handleChange(event) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    setSubmitting(true)
    setErrorMessage(null)

    // An emptied icon is sent as null, so clearing it really removes the old value.
    const icon = formData.icon.trim()
    const skillData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      icon: icon === '' ? null : icon,
    }

    try {
      await updateSkill(skill.id, skillData)
      onUpdated() // tell the parent: close this form and refresh the list
    } catch (err) {
      console.error(err)
      // The form data is kept, so the admin can fix it and try again.
      setErrorMessage('Could not update skill. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-300 bg-gray-50 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        Edit Skill: {skill.name}
      </h3>

      <div>
        <label htmlFor="edit-skill-name" className={labelClasses}>
          Name
        </label>
        <input
          id="edit-skill-name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-skill-category" className={labelClasses}>
          Category
        </label>
        <input
          id="edit-skill-category"
          name="category"
          type="text"
          value={formData.category}
          onChange={handleChange}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-skill-icon" className={labelClasses}>
          Icon (optional)
        </label>
        <input
          id="edit-skill-icon"
          name="icon"
          type="text"
          value={formData.icon}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-900 hover:bg-gray-100 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default EditSkillForm
