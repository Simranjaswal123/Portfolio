import { useState } from 'react'
import ImageGallery from './ImageGallery.jsx'

// Displays a single project. The project object is passed in as a prop.
// It shows the cover image (project.image_url) at the top and, when the project has
// screenshots (project.images), a button that opens them as a gallery.
function ProjectCard({ project }) {
  const hasLinks = project.github_url || project.live_url
  const screenshots = project.images ?? []
  const [coverFailed, setCoverFailed] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const galleryId = `gallery-${project.id}`

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:border-gray-400 hover:shadow-md">
      {/* Cropped to 16:9, never stretched. Left out if it fails to load. */}
      {project.image_url && !coverFailed && (
        <img
          src={project.image_url}
          alt={`Cover image for ${project.title}`}
          loading="lazy"
          decoding="async"
          onError={() => setCoverFailed(true)}
          className="mb-4 aspect-video w-full rounded-lg border border-gray-200 bg-gray-100 object-cover"
        />
      )}

      <h2 className="text-xl font-semibold text-gray-900">{project.title}</h2>
      <p className="mt-2 text-gray-600">{project.description}</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        {(project.technologies ?? []).map((tech) => (
          <li
            key={tech}
            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
          >
            {tech}
          </li>
        ))}
      </ul>

      {screenshots.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setGalleryOpen((open) => !open)}
            aria-expanded={galleryOpen}
            aria-controls={galleryId}
            className="text-sm font-medium text-gray-700 underline hover:text-gray-900"
          >
            {galleryOpen ? 'Hide screenshots' : `View screenshots (${screenshots.length})`}
          </button>
          {galleryOpen && (
            <div id={galleryId} className="mt-3">
              <ImageGallery images={screenshots} label={`Screenshots of ${project.title}`} />
            </div>
          )}
        </div>
      )}

      {hasLinks && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100"
            >
              GitHub
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-700"
            >
              Live Demo
            </a>
          )}
        </div>
      )}
    </article>
  )
}

export default ProjectCard
