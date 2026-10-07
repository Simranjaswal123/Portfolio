import { useState } from 'react'
import { updateExperience } from '../../services/experience.service.js'

// Shared styles for the text fields, so each input stays short.
const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none'
const labelClasses = 'block text-sm font-medium text-gray-700'

// A date input needs "YYYY-MM-DD". This keeps just those first 10 characters,
// so it also works if the database sends a full timestamp.
function toDateInputValue(value) {
  return value ? value.slice(0, 10) : ''
}

// Builds the starting form values from an existing experience entry.
// Empty (null) values become empty text.
function experienceToFormData(experience) {
  return {
    company: experience.company ?? '',
    role: experience.role ?? '',
    location: experience.location ?? '',
    start_date: toDateInputValue(experience.start_date),
    end_date: toDateInputValue(experience.end_date),
    description: experience.description ?? '',
  }
}

// The "Edit Experience" form. It opens already filled in with the entry's values.
// "onUpdated" is called after a successful save; "onCancel" closes the form.
function EditExperienceForm({ experience, onUpdated, onCancel }) {
  const [formData, setFormData] = useState(experienceToFormData(experience))
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Runs on every change. The input's "name" tells us which field to update.
  function handleChange(event) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    setSubmitting(true)
    setErrorMessage(null)

    // An emptied end date is sent as null (meaning "Present"), so clearing it
    // really removes the old date.
    const experienceData = {
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location.trim(),
      start_date: formData.start_date,
      end_date: formData.end_date === '' ? null : formData.end_date,
      description: formData.description.trim(),
    }

    try {
      await updateExperience(experience.id, experienceData)
      onUpdated() // tell the parent: close this form and refresh the list
    } catch (err) {
      console.error(err)
      // The form data is kept, so the admin can fix it and try again.
      setErrorMessage('Could not update experience. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-300 bg-gray-50 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        Edit Experience: {experience.role} at {experience.company}
      </h3>

      <div>
        <label htmlFor="edit-experience-company" className={labelClasses}>
          Company
        </label>
        <input
          id="edit-experience-company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-experience-role" className={labelClasses}>
          Role
        </label>
        <input
          id="edit-experience-role"
          name="role"
          type="text"
          value={formData.role}
          onChange={handleChange}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-experience-location" className={labelClasses}>
          Location
        </label>
        <input
          id="edit-experience-location"
          name="location"
          type="text"
          value={formData.location}
          onChange={handleChange}
          required
          className={inputClasses}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-experience-start_date" className={labelClasses}>
            Start date
          </label>
          <input
            id="edit-experience-start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="edit-experience-end_date" className={labelClasses}>
            End date (leave empty if current)
          </label>
          <input
            id="edit-experience-end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="edit-experience-description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="edit-experience-description"
          name="description"
          rows="4"
          value={formData.description}
          onChange={handleChange}
          required
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

export default EditExperienceForm
