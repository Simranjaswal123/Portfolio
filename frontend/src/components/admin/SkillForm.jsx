import { useState } from 'react'
import { createSkill } from '../../services/skills.service.js'

const emptyForm = {
  name: '',
  category: '',
  icon: '',
}

// Shared styles for the text fields, so each input stays short.
const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none'
const labelClasses = 'block text-sm font-medium text-gray-700'

// The "Add Skill" form of the admin dashboard.
// "onSkillCreated" is called after a skill is saved, so the parent can react.
function SkillForm({ onSkillCreated }) {
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // Runs on every keystroke. The input's "name" tells us which field to update.
  function handleChange(event) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    setSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    // Build the data to send. The optional icon is left out when empty,
    // so the database uses its own default for it.
    const skillData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
    }

    const icon = formData.icon.trim()
    if (icon !== '') {
      skillData.icon = icon
    }

    try {
      await createSkill(skillData)
      setSuccessMessage('Skill added successfully.')
      setFormData(emptyForm) // clear the form only after a successful save
      onSkillCreated() // tell the parent, so it can refresh the skills list
    } catch (err) {
      console.error(err)
      // The form data is kept, so the admin can fix it and try again.
      setErrorMessage('Could not add skill. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">Add Skill</h2>

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-4 rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <div>
          <label htmlFor="skill-name" className={labelClasses}>
            Name
          </label>
          <input
            id="skill-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="React"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="skill-category" className={labelClasses}>
            Category
          </label>
          <input
            id="skill-category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="Frontend"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="skill-icon" className={labelClasses}>
            Icon (optional)
          </label>
          <input
            id="skill-icon"
            name="icon"
            type="text"
            value={formData.icon}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        {successMessage && (
          <p role="status" className="text-sm font-medium text-green-700">
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Adding...' : 'Add Skill'}
        </button>
      </form>
    </section>
  )
}

export default SkillForm
