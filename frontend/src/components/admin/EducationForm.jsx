import { useState } from 'react'
import { createEducation } from '../../services/education.service.js'

const emptyForm = {
  institution: '',
  degree: '',
  field: '',
  start_date: '',
  end_date: '',
  description: '',
}

// Shared styles for the text fields, so each input stays short.
const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none'
const labelClasses = 'block text-sm font-medium text-gray-700'

// The "Add Education" form of the admin dashboard.
// "onEducationCreated" is called after a record is saved, so the parent can react.
function EducationForm({ onEducationCreated }) {
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // Runs on every change. The input's "name" tells us which field to update.
  function handleChange(event) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    setSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    // Build the data to send. The optional end date is left out when empty
    // (meaning "Present"), so the database uses its own default for it.
    const educationData = {
      institution: formData.institution.trim(),
      degree: formData.degree.trim(),
      field: formData.field.trim(),
      start_date: formData.start_date,
      description: formData.description.trim(),
    }

    if (formData.end_date !== '') {
      educationData.end_date = formData.end_date
    }

    try {
      await createEducation(educationData)
      setSuccessMessage('Education added successfully.')
      setFormData(emptyForm) // clear the form only after a successful save
      onEducationCreated() // tell the parent, so it can refresh the list
    } catch (err) {
      console.error(err)
      // The form data is kept, so the admin can fix it and try again.
      setErrorMessage('Could not add education. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">Add Education</h2>

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-4 rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <div>
          <label htmlFor="education-institution" className={labelClasses}>
            Institution
          </label>
          <input
            id="education-institution"
            name="institution"
            type="text"
            value={formData.institution}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="education-degree" className={labelClasses}>
            Degree
          </label>
          <input
            id="education-degree"
            name="degree"
            type="text"
            value={formData.degree}
            onChange={handleChange}
            required
            placeholder="Bachelor of Technology (B.Tech)"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="education-field" className={labelClasses}>
            Field of study
          </label>
          <input
            id="education-field"
            name="field"
            type="text"
            value={formData.field}
            onChange={handleChange}
            required
            placeholder="Computer Science and Engineering"
            className={inputClasses}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="education-start_date" className={labelClasses}>
              Start date
            </label>
            <input
              id="education-start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="education-end_date" className={labelClasses}>
              End date (leave empty if current)
            </label>
            <input
              id="education-end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="education-description" className={labelClasses}>
            Description
          </label>
          <textarea
            id="education-description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
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
          {submitting ? 'Adding...' : 'Add Education'}
        </button>
      </form>
    </section>
  )
}

export default EducationForm
