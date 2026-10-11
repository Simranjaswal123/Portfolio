import { useCallback, useEffect, useRef, useState } from 'react'
import { getProjects } from '../services/project.service.js'
import ProjectCard from '../components/ProjectCard.jsx'
import Reveal from '../components/Reveal.jsx'

// The API does not promise an order, so the numbering is fixed here: featured projects
// first, then the newest.
function sortProjects(projects) {
  return [...projects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || new Date(b.created_at) - new Date(a.created_at),
  )
}

// If the visitor comes back to this tab after at least this long, the list is quietly
// refreshed, so edits made in the admin dashboard show up without a manual reload.
const REFRESH_AFTER_MS = 30_000

// "03 / Projects": the section heading, then each project as a showcase, alternating the
// side its image sits on. Each project carries its own image carousel.
function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const lastLoadedRef = useRef(0)

  const loadProjects = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) {
      setLoading(true)
      setError(null)
    }

    try {
      setProjects(sortProjects(await getProjects()))
      setError(null)
    } catch (err) {
      console.error(err)

      if (!quiet) {
        setError('Could not load projects. Please try again later.')
      }
    } finally {
      lastLoadedRef.current = Date.now()
      setLoading(false)
    }
  }, [])

  // Load when the section first appears, and again when the visitor returns to the tab.
  useEffect(() => {
    loadProjects()

    function handleVisibility() {
      if (document.visibilityState === 'visible' && Date.now() - lastLoadedRef.current > REFRESH_AFTER_MS) {
        loadProjects({ quiet: true })
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [loadProjects])

  // The section and heading always render, so the #projects link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = (
      <div>
        <p role="status" className="font-label text-xs tracking-[0.14em] text-ash uppercase">
          Loading projects…
        </p>
        <div aria-hidden="true" className="mt-8 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="aspect-[2/1] rounded-2xl border border-white/[0.07] bg-white/[0.02] lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5">
            <div className="h-3 w-24 rounded-full bg-white/[0.06]" />
            <div className="h-12 w-3/4 rounded-lg bg-white/[0.06]" />
            <div className="h-4 w-full rounded-full bg-white/[0.04]" />
            <div className="h-4 w-5/6 rounded-full bg-white/[0.04]" />
          </div>
        </div>
      </div>
    )
  } else if (error) {
    content = (
      <div role="alert" className="flex flex-wrap items-center gap-5">
        <p className="font-ui text-base text-ash">{error}</p>
        <button
          type="button"
          onClick={() => loadProjects()}
          className="rounded-full border border-white/20 px-5 py-2.5 font-ui text-sm font-semibold text-bone transition-colors duration-200 hover:border-iris hover:text-iris focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-iris"
        >
          Try again
        </button>
      </div>
    )
  } else if (projects.length === 0) {
    content = <p className="font-ui text-base text-ash">No projects added yet.</p>
  } else {
    content = (
      <div>
        {projects.map((project, index) => (
          <div key={project.id} className={index === 0 ? '' : 'mt-24 border-t border-white/10 pt-24 lg:mt-32 lg:pt-32'}>
            <ProjectCard project={project} index={index} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="relative isolate overflow-hidden border-t border-white/10 bg-night text-bone"
    >
      {/* Barely-there violet atmosphere and film grain, as in the other sections */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(45%_30%_at_8%_8%,rgb(111_93_242/0.1),transparent_70%),radial-gradient(40%_30%_at_95%_70%,rgb(111_93_242/0.08),transparent_72%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="px-6 py-24 lg:px-12 lg:py-36 xl:px-20">
        <Reveal>
          <p className="flex items-center gap-4 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
            <span className="text-iris">03</span>
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-iris" />
            Projects
          </p>
        </Reveal>

        <Reveal delay={90}>
          <h2
            id="projects-title"
            className="mt-8 font-display text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.035em] text-bone"
          >
            Selected <span className="text-iris">Work</span>
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 max-w-md font-ui text-base leading-relaxed text-bone/70 sm:text-lg">
            Things I’ve built. Open any project to see it up close.
          </p>
        </Reveal>

        <div className="mt-16 lg:mt-24">{content}</div>
      </div>
    </section>
  )
}

export default Home
