import { useState } from 'react'
import { createProject } from '../../services/project.service.js'

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  long_description: '',
  technologies: '', // typed as comma-separated text, converted before sending
  github_url: '',
  live_url: '',
  image_url: '',
  featured: false,
}

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

// The "Add Project" form of the admin dashboard.
function ProjectForm() {
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // Runs on every change. Checkboxes use "checked"; everything else uses "value".
  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    setSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    // Build the data to send. Optional fields that were left empty are left
    // out, so the database uses its own default for them.
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
      if (value !== '') {
        projectData[field] = value
      }
    })

    try {
      await createProject(projectData)
      setSuccessMessage('Project added successfully.')
      setFormData(emptyForm) // clear the form only after a successful save
    } catch (err) {
      console.error(err)
      // The form data is kept, so the admin can fix it and try again.
      setErrorMessage('Could not add project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">Add Project</h2>

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-4 rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <div>
          <label htmlFor="title" className={labelClasses}>
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="slug" className={labelClasses}>
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="my-project-name"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClasses}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="long_description" className={labelClasses}>
            Long description (optional)
          </label>
          <textarea
            id="long_description"
            name="long_description"
            rows="5"
            value={formData.long_description}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="technologies" className={labelClasses}>
            Technologies (separate with commas)
          </label>
          <input
            id="technologies"
            name="technologies"
            type="text"
            value={formData.technologies}
            onChange={handleChange}
            placeholder="React, Node.js, Express, Supabase"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="github_url" className={labelClasses}>
            GitHub URL (optional)
          </label>
          <input
            id="github_url"
            name="github_url"
            type="url"
            value={formData.github_url}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="live_url" className={labelClasses}>
            Live demo URL (optional)
          </label>
          <input
            id="live_url"
            name="live_url"
            type="url"
            value={formData.live_url}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="image_url" className={labelClasses}>
            Image URL (optional)
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            value={formData.image_url}
            onChange={handleChange}
            className={inputClasses}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Featured project
          </label>
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
          {submitting ? 'Adding...' : 'Add Project'}
        </button>
      </form>
    </section>
  )
}

export default ProjectForm
