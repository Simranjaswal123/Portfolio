import { useState } from 'react'
import { createProject, uploadProjectCover, uploadProjectImage } from '../../services/project.service.js'
import ProjectImagesPanel from './images/ProjectImagesPanel.jsx'
import ProgressBar from './images/ProgressBar.jsx'
import StagedImagePicker from './images/StagedImagePicker.jsx'

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  long_description: '',
  technologies: '', // typed as comma-separated text, converted before sending
  github_url: '',
  live_url: '',
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
// "onProjectCreated" is called after a project is saved, so the parent can react.
function ProjectForm({ onProjectCreated }) {
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [createdProject, setCreatedProject] = useState(null) // the project just added, while its images are being added
  const [coverFile, setCoverFile] = useState([]) // images chosen now, uploaded right after the project is created
  const [screenshotFiles, setScreenshotFiles] = useState([])
  const [uploadStatus, setUploadStatus] = useState(null) // { text, percent } while the images upload

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

    const optionalFields = ['long_description', 'github_url', 'live_url']
    optionalFields.forEach((field) => {
      const value = formData[field].trim()
      if (value !== '') {
        projectData[field] = value
      }
    })

    try {
      const created = await createProject(projectData)
      setFormData(emptyForm) // the project exists now, so the form can be cleared

      // Upload the images that were chosen above, one after another. A failed image
      // never undoes the project: it is listed, and can be retried in the panel below.
      let project = { ...created, images: [] }
      const failures = []
      const total = coverFile.length + screenshotFiles.length
      let finished = 0
      const report = (percent) =>
        setUploadStatus({ text: `Uploading images (${Math.min(finished + 1, total)} of ${total})`, percent })

      if (coverFile[0]) {
        report(0)
        try {
          const result = await uploadProjectCover(created.id, coverFile[0], report)
          project = { ...project, image_url: result.image_url }
        } catch (err) {
          console.error(err)
          failures.push(`cover image (${err.message})`)
        }
        finished += 1
      }

      for (const file of screenshotFiles) {
        report(0)
        try {
          const row = await uploadProjectImage(created.id, file, report)
          project = { ...project, images: [...project.images, row] }
        } catch (err) {
          console.error(err)
          failures.push(`${file.name} (${err.message})`)
        }
        finished += 1
      }

      setUploadStatus(null)
      setCoverFile([])
      setScreenshotFiles([])
      setCreatedProject(project) // the image panel for the new project, with what was saved
      onProjectCreated() // tell the parent, so it can refresh the project list

      if (failures.length === 0) {
        setSuccessMessage(total > 0 ? 'Project and images added successfully.' : 'Project added successfully.')
      } else {
        setSuccessMessage('Project added.')
        setErrorMessage(`These images could not be uploaded: ${failures.join(', ')}. You can add them again below.`)
      }
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

        <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Images</p>
          <StagedImagePicker
            id="new-cover-image"
            label="Cover image"
            hint="Shown at the top of the project card."
            files={coverFile}
            onChange={setCoverFile}
            disabled={submitting}
          />
          <StagedImagePicker
            id="new-screenshots"
            label="Screenshots"
            hint="Shown in the project's gallery. You can pick several at once."
            multiple
            files={screenshotFiles}
            onChange={setScreenshotFiles}
            disabled={submitting}
          />
          <p className="text-xs text-gray-500">The images are uploaded when you press “Add Project”.</p>
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

        {uploadStatus && (
          <div role="status">
            <p className="text-sm font-medium text-gray-700">{uploadStatus.text}</p>
            <ProgressBar value={uploadStatus.percent ?? 0} label="Uploading project images" className="mt-1" />
          </div>
        )}

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
          {submitting ? (uploadStatus ? 'Uploading images...' : 'Adding...') : 'Add Project'}
        </button>
      </form>

      {/* Images need the project to exist first, so they are added right after it is created. */}
      {createdProject && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-gray-900">
            “{createdProject.title}” was added. You can add its images now (optional).
          </p>
          <div className="mt-4">
            <ProjectImagesPanel key={createdProject.id} project={createdProject} onChanged={onProjectCreated} />
          </div>
          <button
            type="button"
            onClick={() => setCreatedProject(null)}
            className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            Done
          </button>
        </div>
      )}
    </section>
  )
}

export default ProjectForm
