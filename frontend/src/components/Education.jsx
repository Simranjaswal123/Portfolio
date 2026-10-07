import { useEffect, useState } from 'react'
import { getEducation } from '../services/education.service.js'

// Turns a database date like "2023-08-01" into "Aug 2023".
// Anything else (for example the text "2023") is shown as it is.
function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function Education() {
  const [educationEntries, setEducationEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadEducation() {
      try {
        const data = await getEducation()
        setEducationEntries(data)
      } catch (err) {
        console.error(err)
        setError('Could not load education. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadEducation()
  }, [])

  // The section and heading always render, so the #education link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = <p className="text-gray-600">Loading education...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else if (educationEntries.length === 0) {
    content = <p className="text-gray-600">No education entries yet.</p>
  } else {
    content = (
      <div className="grid gap-6 md:grid-cols-2">
        {educationEntries.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-400 hover:shadow-md"
          >
            <h3 className="text-xl font-semibold text-gray-900">
              {item.degree}
            </h3>
            <p className="mt-1 font-medium text-gray-700">{item.institution}</p>
            <p className="text-gray-500">{item.field}</p>

            <p className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {formatDate(item.start_date)} –{' '}
              {item.end_date ? formatDate(item.end_date) : 'Present'}
            </p>

            <p className="mt-4 text-gray-600">{item.description}</p>
          </article>
        ))}
      </div>
    )
  }

  return (
    <section id="education" className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          Education
        </h2>

        <div className="mt-8">{content}</div>
      </div>
    </section>
  )
}

export default Education
