import { useEffect, useState } from 'react'
import { getExperience } from '../services/experience.service.js'

// Turns a database date like "2025-06-01" into "Jun 2025".
// Anything else (for example the text "2025") is shown as it is.
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

function Experience() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadExperience() {
      try {
        const data = await getExperience()
        setExperiences(data)
      } catch (err) {
        console.error(err)
        setError('Could not load experience. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadExperience()
  }, [])

  // The section and heading always render, so the #experience link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = <p className="text-gray-600">Loading experience...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else if (experiences.length === 0) {
    content = <p className="text-gray-600">No experience entries yet.</p>
  } else {
    // The left border is the timeline line; each dot marks one entry.
    content = (
      <ol className="ml-2 space-y-8 border-l-2 border-gray-200">
        {experiences.map((item) => (
          <li key={item.id} className="relative pl-6 sm:pl-8">
            <span className="absolute top-6 -left-[9px] h-4 w-4 rounded-full border-2 border-gray-400 bg-white" />

            <div className="rounded-lg border border-gray-200 p-5 shadow-sm hover:border-gray-400 hover:shadow-md">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {item.role}
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  {formatDate(item.start_date)} –{' '}
                  {item.end_date ? formatDate(item.end_date) : 'Present'}
                </p>
              </div>

              <p className="mt-1 font-medium text-gray-700">
                {item.company}
                <span className="font-normal text-gray-500">
                  {' '}
                  · {item.location}
                </span>
              </p>

              <p className="mt-3 text-gray-600">{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <section id="experience" className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          Experience
        </h2>

        <div className="mt-8">{content}</div>
      </div>
    </section>
  )
}

export default Experience
