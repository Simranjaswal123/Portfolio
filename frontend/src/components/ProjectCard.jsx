import { useRef, useState } from 'react'
import ProjectCarousel from './ProjectCarousel.jsx'
import ProjectGallery from './ProjectGallery.jsx'
import Reveal from './Reveal.jsx'

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-iris'

// Only ever link to http(s) addresses.
function safeUrl(url) {
  try {
    const parsed = new URL(String(url).trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null
  } catch {
    return null
  }
}

// Text typed into the admin form, as paragraphs (blank lines separate them).
function toParagraphs(text) {
  return (text ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

// One project, given its own space. `index` sets the number and which side the image is on.
// Its images (the cover, then its own screenshots) sit in a carousel; any of them can be
// opened in the large viewer. Both only ever see this project's images.
function ProjectCard({ project, index }) {
  const [viewerIndex, setViewerIndex] = useState(null) // which image the large viewer shows, or null
  const openerRef = useRef(null)
  const screenshots = (project.images ?? []).filter((image) => image.image_url)
  const paragraphs = toParagraphs(project.long_description)
  const technologies = (project.technologies ?? []).map((tech) => String(tech).trim()).filter(Boolean)
  const githubUrl = project.github_url ? safeUrl(project.github_url) : null
  const liveUrl = project.live_url ? safeUrl(project.live_url) : null
  const imageOnRight = index % 2 === 1
  const titleId = `project-${project.id}-title`

  const coverAlt = project.description ? `Cover image for ${project.title}: ${project.description}` : `Cover image for ${project.title}`
  const slides = [
    ...(project.image_url ? [{ id: 'cover', image_url: project.image_url, alt: coverAlt }] : []),
    ...screenshots.map((image, i) => ({ id: image.id, image_url: image.image_url, alt: image.alt_text || `${project.title}, screenshot ${i + 1}` })),
  ]
  const firstScreenshot = project.image_url ? 1 : 0

  function openViewer(at, opener) {
    openerRef.current = opener
    setViewerIndex(at)
  }

  function closeViewer() {
    setViewerIndex(null)
    openerRef.current?.focus()
  }

  return (
    <article aria-labelledby={titleId} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
      {/* ---- The image ---- */}
      <Reveal delay={60} className={`min-w-0 lg:col-span-7 ${imageOnRight ? 'lg:order-2' : ''}`}>
        <div className="scroll-settle">
          <ProjectCarousel title={project.title} slides={slides} onEnlarge={openViewer} />
        </div>
      </Reveal>

      {/* ---- The words ---- */}
      <div className={`min-w-0 lg:col-span-5 ${imageOnRight ? 'lg:order-1' : ''}`}>
        <Reveal>
          <p className="flex items-center gap-4 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
            <span className="text-iris">{String(index + 1).padStart(2, '0')}</span>
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-iris" />
            {project.featured ? 'Featured project' : 'Project'}
          </p>
        </Reveal>

        <Reveal delay={70}>
          <h3 id={titleId} className="mt-6 font-display text-[clamp(2.3rem,4.6vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-bone">
            {project.title}
          </h3>
        </Reveal>

        {project.description && (
          <Reveal delay={140}>
            <p className="mt-5 font-ui text-lg leading-snug text-bone sm:text-xl">{project.description}</p>
          </Reveal>
        )}

        {paragraphs.length > 0 && (
          <Reveal delay={200} className="mt-5 space-y-4">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="font-ui text-base leading-relaxed whitespace-pre-line text-bone/70">
                {paragraph}
              </p>
            ))}
          </Reveal>
        )}

        {technologies.length > 0 && (
          <Reveal as="ul" delay={260} aria-label={`Technologies used in ${project.title}`} className="mt-7 flex flex-wrap gap-2">
            {technologies.map((tech, i) => (
              <li
                key={`${tech}-${i}`}
                className="rounded-full border border-white/15 px-3.5 py-1.5 font-label text-[0.7rem] tracking-[0.06em] text-bone/75 transition-colors duration-200 hover:border-iris/60 hover:text-iris"
              >
                {tech}
              </li>
            ))}
          </Reveal>
        )}

        {(githubUrl || liveUrl || screenshots.length > 0) && (
          <Reveal delay={320} className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 font-ui text-sm font-semibold text-night transition-all duration-300 hover:bg-iris motion-safe:hover:-translate-y-0.5 ${focusRing}`}
              >
                Live demo <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-ui text-sm font-semibold text-bone transition-all duration-300 hover:border-iris hover:text-iris motion-safe:hover:-translate-y-0.5 ${focusRing}`}
              >
                GitHub <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            {screenshots.length > 0 && (
              <button
                type="button"
                onClick={(event) => openViewer(firstScreenshot, event.currentTarget)}
                aria-haspopup="dialog"
                className={`group/explore inline-flex items-center gap-2 font-ui text-sm font-semibold text-iris transition-colors duration-200 hover:text-bone ${focusRing}`}
              >
                <span className="border-b border-iris/40 pb-0.5 transition-colors group-hover/explore:border-bone/60">
                  Explore screenshots ({screenshots.length})
                </span>
                <span aria-hidden="true">→</span>
              </button>
            )}
          </Reveal>
        )}
      </div>

      {viewerIndex !== null && slides.length > 0 && (
        <ProjectGallery
          title={project.title}
          images={slides.map((slide) => ({ id: slide.id, image_url: slide.image_url, alt_text: slide.alt }))}
          startIndex={Math.min(viewerIndex, slides.length - 1)}
          onClose={closeViewer}
        />
      )}
    </article>
  )
}

export default ProjectCard
