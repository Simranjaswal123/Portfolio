import { useState } from 'react'
import { updateProject } from '../../services/project.service.js'

// Shared styles for the text fields, so each input stays short.
const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none'
const labelClasses = 'block text-sm font-medium text-gray-700'

// Turns "React, Node.js, Express" into ["React", "Node.js", "Express"].
// Extra spaces and empty items (like a trailing comma) are removed.
function parseTechnologies(text) {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

// Builds the starting form values from an existing project.
// Empty (null) values become empty text, and the technologies array becomes
// comma-separated text.
function projectToFormData(project) {
  return {
    title: project.title ?? '',
    slug: project.slug ?? '',
    description: project.description ?? '',
    long_description: project.long_description ?? '',
    technologies: (project.technologies ?? []).join(', '),
    github_url: project.github_url ?? '',
    live_url: project.live_url ?? '',
    image_url: project.image_url ?? '',
    featured: Boolean(project.featured),
  }
}

// The "Edit Project" form. It opens already filled in with the project's values.
// "onUpdated" is called after a successful save; "onCancel" closes the form.
function EditProjectForm({ project, onUpdated, onCancel }) {
  const [formData, setFormData] = useState(projectToFormData(project))
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Runs on every change. Checkboxes use "checked"; everything else uses "value".
  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    setSubmitting(true)
    setErrorMessage(null)

    // Build the data to send. An optional field that was emptied is sent as
    // null, so clearing a field really removes the old value.
    const projectData = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim(),
      technologies: parseTechnologies(formData.technologies),
      featured: formData.featured,
    }

    const optionalFields = ['long_description', 'github_url', 'live_url', 'image_url']
    optionalFields.forEach((field) => {
      const value = formData[field].trim()
      projectData[field] = value === '' ? null : value
    })

    try {
      await updateProject(project.id, projectData)
      onUpdated() // tell the parent: close this form and refresh the list
    } catch (err) {
      console.error(err)
      // The form data is kept, so the admin can fix it and try again.
      setErrorMessage('Could not update project. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-gray-300 bg-gray-50 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        Edit Project: {project.title}
      </h3>

      <div>
        <label htmlFor="edit-title" className={labelClasses}>
          Title
        </label>
        <input
          id="edit-title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-slug" className={labelClasses}>
          Slug
        </label>
        <input
          id="edit-slug"
          name="slug"
          type="text"
          value={formData.slug}
          onChange={handleChange}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-description" className={labelClasses}>
          Description
        </label>
        <textarea
          id="edit-description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          required
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-long_description" className={labelClasses}>
          Long description (optional)
        </label>
        <textarea
          id="edit-long_description"
          name="long_description"
          rows="5"
          value={formData.long_description}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-technologies" className={labelClasses}>
          Technologies (separate with commas)
        </label>
        <input
          id="edit-technologies"
          name="technologies"
          type="text"
          value={formData.technologies}
          onChange={handleChange}
          placeholder="React, Node.js, Express, Supabase"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-github_url" className={labelClasses}>
          GitHub URL (optional)
        </label>
        <input
          id="edit-github_url"
          name="github_url"
          type="url"
          value={formData.github_url}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-live_url" className={labelClasses}>
          Live demo URL (optional)
        </label>
        <input
          id="edit-live_url"
          name="live_url"
          type="url"
          value={formData.live_url}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="edit-image_url" className={labelClasses}>
          Image URL (optional)
        </label>
        <input
          id="edit-image_url"
          name="image_url"
          type="url"
          value={formData.image_url}
          onChange={handleChange}
          className={inputClasses}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="edit-featured"
          name="featured"
          type="checkbox"
          checked={formData.featured}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="edit-featured" className="text-sm font-medium text-gray-700">
          Featured project
        </label>
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

export default EditProjectForm
