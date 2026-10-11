import { useState } from 'react'
import { createExperience, uploadExperienceImage } from '../../services/experience.service.js'
import ExperienceImagesPanel from './images/ExperienceImagesPanel.jsx'
import ProgressBar from './images/ProgressBar.jsx'
import StagedImagePicker from './images/StagedImagePicker.jsx'

const emptyForm = {
  company: '',
  role: '',
  location: '',
  start_date: '',
  end_date: '',
  description: '',
}

// Shared styles for the text fields, so each input stays short.
const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 hover:border-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 focus:outline-none'
const labelClasses = 'block text-sm font-medium text-gray-700'

// The "Add Experience" form of the admin dashboard.
// "onExperienceCreated" is called after an entry is saved, so the parent can react.
function ExperienceForm({ onExperienceCreated }) {
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [createdEntry, setCreatedEntry] = useState(null) // the entry just added, while its photos are being added
  const [photoFiles, setPhotoFiles] = useState([]) // photos chosen now, uploaded right after the entry is created
  const [uploadStatus, setUploadStatus] = useState(null) // { text, percent } while the photos upload

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
    const experienceData = {
      company: formData.company.trim(),
      role: formData.role.trim(),
      location: formData.location.trim(),
      start_date: formData.start_date,
      description: formData.description.trim(),
    }

    if (formData.end_date !== '') {
      experienceData.end_date = formData.end_date
    }

    try {
      const created = await createExperience(experienceData)
      setFormData(emptyForm) // the entry exists now, so the form can be cleared

      // Upload the photos that were chosen above, one after another. A failed photo
      // never undoes the entry: it is listed, and can be retried in the panel below.
      let entry = { ...created, images: [] }
      const failures = []
      const total = photoFiles.length
      const report = (percent, index) =>
        setUploadStatus({ text: `Uploading photographs (${index + 1} of ${total})`, percent })

      for (const [index, file] of photoFiles.entries()) {
        report(0, index)
        try {
          const row = await uploadExperienceImage(created.id, file, (percent) => report(percent, index))
          entry = { ...entry, images: [...entry.images, row] }
        } catch (err) {
          console.error(err)
          failures.push(`${file.name} (${err.message})`)
        }
      }

      setUploadStatus(null)
      setPhotoFiles([])
      setCreatedEntry(entry) // the photo panel for the new entry, with what was saved
      onExperienceCreated() // tell the parent, so it can refresh the list

      if (failures.length === 0) {
        setSuccessMessage(total > 0 ? 'Experience and photographs added successfully.' : 'Experience added successfully.')
      } else {
        setSuccessMessage('Experience added.')
        setErrorMessage(`These photographs could not be uploaded: ${failures.join(', ')}. You can add them again below.`)
      }
    } catch (err) {
      console.error(err)
      // The form data is kept, so the admin can fix it and try again.
      setErrorMessage('Could not add experience. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900">Add Experience</h2>

      <form
        onSubmit={handleSubmit}
        className="mt-4 space-y-4 rounded-lg border border-gray-200 p-6 shadow-sm"
      >
        <div>
          <label htmlFor="experience-company" className={labelClasses}>
            Company
          </label>
          <input
            id="experience-company"
            name="company"
            type="text"
            value={formData.company}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="experience-role" className={labelClasses}>
            Role
          </label>
          <input
            id="experience-role"
            name="role"
            type="text"
            value={formData.role}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="experience-location" className={labelClasses}>
            Location
          </label>
          <input
            id="experience-location"
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
            <label htmlFor="experience-start_date" className={labelClasses}>
              Start date
            </label>
            <input
              id="experience-start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="experience-end_date" className={labelClasses}>
              End date (leave empty if current)
            </label>
            <input
              id="experience-end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="experience-description" className={labelClasses}>
            Description
          </label>
          <textarea
            id="experience-description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <StagedImagePicker
            id="new-experience-photos"
            label="Photographs"
            hint="Shown with this entry on the public site. You can pick several at once."
            multiple
            files={photoFiles}
            onChange={setPhotoFiles}
            disabled={submitting}
          />
          <p className="mt-3 text-xs text-gray-500">The photographs are uploaded when you press “Add Experience”.</p>
        </div>

        {uploadStatus && (
          <div role="status">
            <p className="text-sm font-medium text-gray-700">{uploadStatus.text}</p>
            <ProgressBar value={uploadStatus.percent ?? 0} label="Uploading experience photographs" className="mt-1" />
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
          {submitting ? (uploadStatus ? 'Uploading photographs...' : 'Adding...') : 'Add Experience'}
        </button>
      </form>

      {/* Photos need the entry to exist first, so they are added right after it is created. */}
      {createdEntry && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-gray-900">
            “{createdEntry.role} at {createdEntry.company}” was added. You can add its photographs now (optional).
          </p>
          <div className="mt-4">
            <ExperienceImagesPanel key={createdEntry.id} experience={createdEntry} onChanged={onExperienceCreated} />
          </div>
          <button
            type="button"
            onClick={() => setCreatedEntry(null)}
            className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
          >
            Done
          </button>
        </div>
      )}
    </section>
  )
}

export default ExperienceForm
