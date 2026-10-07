import { useEffect, useState } from 'react'
import { getSkills } from '../services/skills.service.js'

// The API returns a flat list: [{ name: 'React', category: 'Frontend' }, ...]
// This turns it into one group per category, in the order categories first appear:
// [{ title: 'Frontend', skills: [...] }, { title: 'Backend', skills: [...] }]
function groupByCategory(skills) {
  const groups = {}

  skills.forEach((skill) => {
    const title = skill.category || 'Other'

    if (!groups[title]) {
      groups[title] = { title, skills: [] }
    }

    groups[title].skills.push(skill)
  })

  return Object.values(groups)
}

function Skills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await getSkills()
        setSkills(data)
      } catch (err) {
        console.error(err)
        setError('Could not load skills. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadSkills()
  }, [])

  // The section and heading always render, so the #skills link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = <p className="text-gray-600">Loading skills...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else if (skills.length === 0) {
    content = <p className="text-gray-600">No skills added yet.</p>
  } else {
    content = (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {groupByCategory(skills).map((category) => (
          <div
            key={category.title}
            className="rounded-lg border border-gray-200 p-5 shadow-sm hover:border-gray-400 hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {category.title}
            </h3>

            <ul className="mt-4 flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <li
                  key={skill.name}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-900 hover:text-white"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
  }

  return (
    <section id="skills" className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          Skills
        </h2>

        <div className="mt-8">{content}</div>
      </div>
    </section>
  )
}

export default Skills
