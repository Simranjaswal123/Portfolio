import { useEffect, useState } from 'react'
import { getProjects } from '../services/project.service.js'
import ProjectCard from '../components/ProjectCard.jsx'

function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (err) {
        console.error(err)
        setError('Could not load projects. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  // The section and heading always render, so the #projects link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = <p className="text-gray-600">Loading projects...</p>
  } else if (error) {
    content = <p className="text-red-600">{error}</p>
  } else {
    content = (
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    )
  }

  return (
    <section id="projects" className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-left">
          Featured Projects
        </h2>
        <p className="mt-3 text-center text-lg text-gray-600 sm:text-left">
          A selection of projects I've built while learning and practicing
          full-stack development.
        </p>

        <div className="mt-8">{content}</div>
      </div>
    </section>
  )
}

export default Home
