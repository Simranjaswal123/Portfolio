import { useEffect, useRef, useState } from 'react'
import { getExperience } from '../services/experience.service.js'
import ProjectGallery from './ProjectGallery.jsx'
import Reveal from './Reveal.jsx'

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-iris'

// Turns a database date like "2025-06-01" into "Jun 2025".
// Anything else (for example the text "2025") is shown as it is.
function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(value ?? '')) {
    return value
  }

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// "2025-06-01" -> "2025" (or null when the value is not a date).
const yearOf = (value) => (/^\d{4}/.test(value ?? '') ? value.slice(0, 4) : null)

// Text typed into the admin form, as paragraphs (blank lines separate them).
function toParagraphs(text) {
  return (text ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

// Most recent first. Entries without a start date go last.
function sortExperience(items) {
  return [...items].sort((a, b) => String(b.start_date ?? '').localeCompare(String(a.start_date ?? '')))
}

// The visual side of a chapter when the entry has photographs: one large photo in a
// thin offset frame, the rest as a small row beneath. Any of them opens the viewer.
// If none of them load, `fallback` is shown instead.
function Photographs({ item, photos, onOpen, fallback = null }) {
  const [failed, setFailed] = useState(() => new Set())
  const shown = photos.filter((photo) => !failed.has(photo.id))

  if (shown.length === 0) {
    return fallback
  }

  const [lead, ...rest] = shown
  const markFailed = (id) => setFailed((set) => new Set(set).add(id))

  return (
    <div>
      <figure className="relative">
        {/* The frame: a hairline offset behind the photo */}
        <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-md border border-iris/25 sm:translate-x-4 sm:translate-y-4" />
        <button
          type="button"
          onClick={(event) => onOpen(photos.indexOf(lead), event.currentTarget)}
          aria-haspopup="dialog"
          className={`spotlight-photo group/photo relative block aspect-[3/2] w-full cursor-zoom-in overflow-hidden rounded-md bg-night-2 shadow-[0_40px_70px_-40px_rgb(0_0_0/0.95)] ${focusRing}`}
        >
          <img
            src={lead.image_url}
            alt={lead.alt}
            loading="lazy"
            decoding="async"
            onError={() => markFailed(lead.id)}
            className="h-full w-full object-cover brightness-[0.88] saturate-[0.82] transition-[filter,scale] duration-500 group-hover/photo:brightness-100 group-hover/photo:saturate-100 motion-safe:group-hover/photo:scale-[1.03]"
          />
          {/* A soft vignette that settles the photo into the dark page */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgb(11_11_14/0.55))]" />
          <span className="sr-only"> (view larger)</span>
        </button>
      </figure>

      {rest.length > 0 && (
        <ul aria-label={`More photographs from ${item.role} at ${item.company}`} className="mt-8 grid grid-cols-3 gap-3 sm:mt-9">
          {rest.slice(0, 3).map((photo) => (
            <li key={photo.id}>
              <button
                type="button"
                onClick={(event) => onOpen(photos.indexOf(photo), event.currentTarget)}
                aria-haspopup="dialog"
                className={`group/thumb block aspect-[3/2] w-full cursor-zoom-in overflow-hidden rounded-sm border border-white/10 bg-night-2 transition-colors duration-300 hover:border-iris/50 ${focusRing}`}
              >
                <img
                  src={photo.image_url}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  onError={() => markFailed(photo.id)}
                  className="h-full w-full object-cover brightness-75 saturate-[0.8] transition-[filter] duration-300 group-hover/thumb:brightness-100 group-hover/thumb:saturate-100"
                />
                <span className="sr-only"> (view larger)</span>
              </button>
            </li>
          ))}
          {rest.length > 3 && (
            <li className="col-span-3 font-label text-[0.68rem] tracking-[0.14em] text-ash uppercase">
              +{rest.length - 3} more in the viewer
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

// The visual side when there are no photographs: the dates themselves, set large.
function DateComposition({ item }) {
  const startYear = yearOf(item.start_date)
  const endYear = item.end_date ? yearOf(item.end_date) : null

  if (!startYear) {
    return null
  }

  const sameYear = !item.end_date || startYear === endYear

  return (
    <div aria-hidden="true" className="border-y border-white/10 py-10 sm:py-12">
      <p className="font-display text-[clamp(4rem,10vw,8.5rem)] leading-[0.85] font-extrabold tracking-[-0.045em] text-bone/90">
        {startYear}
        {!sameYear && endYear && <span className="block text-iris/80">{endYear}</span>}
        {!item.end_date && <span className="block text-[0.42em] tracking-[-0.03em] text-iris/80">to now</span>}
      </p>
    </div>
  )
}

// One experience as a chapter: a huge faint number behind it, a soft stage light from
// above, the role set large, and photographs (or the dates) on the other side.
function Chapter({ item, index }) {
  const [viewerIndex, setViewerIndex] = useState(null)
  const openerRef = useRef(null)
  const flip = index % 2 === 1
  const number = String(index + 1).padStart(2, '0')
  const titleId = `experience-${item.id}-title`
  const paragraphs = toParagraphs(item.description)
  const photos = (item.images ?? [])
    .filter((image) => image.image_url)
    .map((image, i) => ({ id: image.id, image_url: image.image_url, alt: image.alt_text || `${item.role} at ${item.company}, photograph ${i + 1}` }))
  const dates = item.start_date ? `${formatDate(item.start_date)} – ${item.end_date ? formatDate(item.end_date) : 'Present'}` : null
  const hasVisual = photos.length > 0 || Boolean(yearOf(item.start_date))

  function openViewer(at, opener) {
    openerRef.current = opener
    setViewerIndex(at)
  }

  function closeViewer() {
    setViewerIndex(null)
    openerRef.current?.focus()
  }

  return (
    <article aria-labelledby={titleId} className="relative isolate overflow-hidden px-6 py-24 lg:px-12 lg:py-32 xl:px-20">
      {/* The stage light: a faint pool falling from above onto the role */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 ${
          flip
            ? 'bg-[radial-gradient(42%_70%_at_74%_0%,rgb(236_233_226/0.055),transparent_70%)]'
            : 'bg-[radial-gradient(42%_70%_at_26%_0%,rgb(236_233_226/0.055),transparent_70%)]'
        }`}
      />
      {/* The chapter number, huge and quiet, drifting slightly as the page scrolls */}
      <span
        aria-hidden="true"
        className={`spotlight-number pointer-events-none absolute -top-[0.12em] -z-10 font-display text-[clamp(11rem,30vw,26rem)] leading-none font-extrabold tracking-[-0.06em] text-bone/[0.035] select-none ${
          flip ? '-left-[0.06em]' : '-right-[0.06em]'
        }`}
      >
        {number}
      </span>

      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12 xl:gap-20">
        {/* ---- The words ---- */}
        <div className={`min-w-0 ${hasVisual ? 'lg:col-span-7' : 'lg:col-span-9'} ${flip && hasVisual ? 'lg:order-2' : ''}`}>
          <Reveal>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
              <span className="text-iris">{number}</span>
              <span aria-hidden="true" className="h-px w-10 shrink-0 bg-iris" />
              {dates && <span>{dates}</span>}
              {item.location && (
                <>
                  <span aria-hidden="true" className="size-1 rounded-full bg-ash/60" />
                  <span>{item.location}</span>
                </>
              )}
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h3
              id={titleId}
              className="spotlight-role group/role mt-7 font-display text-[clamp(2.6rem,6.2vw,5.75rem)] leading-[0.92] font-extrabold tracking-[-0.04em] break-words text-bone"
            >
              {item.role}
              <span aria-hidden="true" className="mt-5 block h-px w-16 origin-left bg-iris transition-[width] duration-500 group-hover/role:w-32" />
            </h3>
          </Reveal>

          {item.company && (
            <Reveal delay={150}>
              <p className="mt-6 font-ui text-xl text-bone sm:text-2xl">
                <span className="text-ash">at </span>
                {item.company}
              </p>
            </Reveal>
          )}

          {paragraphs.length > 0 && (
            <Reveal delay={220} className="mt-8 max-w-xl space-y-4">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="font-ui text-base leading-relaxed whitespace-pre-line text-bone/70 sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </Reveal>
          )}
        </div>

        {/* ---- Photographs, or the dates set large ---- */}
        {hasVisual && (
          <Reveal delay={120} className={`min-w-0 lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
            {photos.length > 0 ? <Photographs item={item} photos={photos} onOpen={openViewer} fallback={<DateComposition item={item} />} /> : <DateComposition item={item} />}
          </Reveal>
        )}
      </div>

      {viewerIndex !== null && photos.length > 0 && (
        <ProjectGallery
          title={`${item.role}${item.company ? ` · ${item.company}` : ''}`}
          kicker="Photographs"
          images={photos.map((photo) => ({ id: photo.id, image_url: photo.image_url, alt_text: photo.alt }))}
          startIndex={Math.min(viewerIndex, photos.length - 1)}
          onClose={closeViewer}
        />
      )}
    </article>
  )
}

// "04 / Experience": an introduction, then each experience as its own spotlit chapter.
function Experience() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadExperience() {
    setLoading(true)
    setError(null)

    try {
      setExperiences(sortExperience(await getExperience()))
    } catch (err) {
      console.error(err)
      setError('Could not load experience. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    loadExperience()
  }, [])

  // The section and heading always render, so the #experience link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = (
      <div className="px-6 lg:px-12 xl:px-20">
        <p role="status" className="font-label text-xs tracking-[0.14em] text-ash uppercase">
          Loading experience…
        </p>
        <div aria-hidden="true" className="mt-10 space-y-5">
          <div className="h-3 w-40 rounded-full bg-white/[0.06]" />
          <div className="h-16 w-2/3 rounded-lg bg-white/[0.05]" />
          <div className="h-4 w-1/2 rounded-full bg-white/[0.04]" />
        </div>
      </div>
    )
  } else if (error) {
    content = (
      <div role="alert" className="flex flex-wrap items-center gap-5 px-6 lg:px-12 xl:px-20">
        <p className="font-ui text-base text-ash">{error}</p>
        <button
          type="button"
          onClick={loadExperience}
          className={`rounded-full border border-white/20 px-5 py-2.5 font-ui text-sm font-semibold text-bone transition-colors duration-200 hover:border-iris hover:text-iris ${focusRing}`}
        >
          Try again
        </button>
      </div>
    )
  } else if (experiences.length === 0) {
    content = <p className="px-6 font-ui text-base text-ash lg:px-12 xl:px-20">No experience entries yet.</p>
  } else {
    content = (
      <div className="divide-y divide-white/10 border-t border-white/10">
        {experiences.map((item, index) => (
          <Chapter key={item.id} item={item} index={index} />
        ))}
      </div>
    )
  }

  return (
    <section id="experience" aria-labelledby="experience-title" className="relative isolate overflow-hidden border-t border-white/10 bg-night text-bone">
      <div aria-hidden="true" className="grain absolute inset-0 -z-20" />

      <div className="px-6 pt-24 pb-16 lg:px-12 lg:pt-36 lg:pb-24 xl:px-20">
        <Reveal>
          <p className="flex items-center gap-4 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
            <span className="text-iris">04</span>
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-iris" />
            Experience
          </p>
        </Reveal>

        <Reveal delay={90}>
          <h2
            id="experience-title"
            className="mt-8 max-w-4xl font-display text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.035em] text-bone"
          >
            Where I’ve made an <span className="text-iris">impact.</span>
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 max-w-lg font-ui text-base leading-relaxed text-bone/70 sm:text-lg">
            Professional experience, leadership roles and the contributions behind them.
          </p>
        </Reveal>
      </div>

      <div className={loading || error || experiences.length === 0 ? 'pb-24 lg:pb-36' : ''}>{content}</div>
    </section>
  )
}

export default Experience
