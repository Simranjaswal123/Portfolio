import { useEffect, useRef, useState } from 'react'
import { getProfile } from '../services/profile.service.js'

// The words used when the profile has not loaded (yet), so the hero always reads properly.
const FALLBACK_NAME = 'Simran Jaswal'
const FALLBACK_HEADLINE = 'Full Stack Developer'
const DEFAULT_INTRO =
  'I build useful web applications from the database to the interface, and enjoy turning real-world problems into software people can rely on.'

// "Simran Jaswal" -> ["Simran", "Jaswal"]
function splitName(name) {
  const words = name.trim().split(/\s+/)
  return [words[0], words.slice(1).join(' ')]
}

// The profile bio, shortened to its first paragraph, or the default sentence when there is no bio.
function introFor(profile) {
  const bio = profile?.bio?.trim()

  if (!bio) {
    return DEFAULT_INTRO
  }

  const first = bio.split('\n')[0]
  return first.length > 220 ? `${first.slice(0, 217).trimEnd()}…` : first
}

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-iris'

// A link that opens in a new tab and says so to screen readers.
function ExternalLink({ href, children, className = '' }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`${className} ${focusRing}`}>
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

// The first screen: dark and editorial. Type on the left leads (greeting, name, role,
// a short introduction, two actions). On the right, the portrait stands in front of one
// tilted pane of frosted glass, its edges dissolving into the dark. Everything real
// (name, headline, photo, links) comes from the profile.
function Hero() {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const [photoFailed, setPhotoFailed] = useState(false)
  const sectionRef = useRef(null)
  const stageRef = useRef(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(await getProfile())
      } catch (err) {
        console.error(err)
        setError('Profile details could not be loaded.')
      }
    }

    loadProfile()
  }, [])

  // Depth: on devices with a mouse, the portrait eases a few pixels against the pointer.
  // Skipped for touch screens and reduced motion.
  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!section || !stage || !finePointer || calm) {
      return
    }

    let frame = 0

    function handleMove(event) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = section.getBoundingClientRect()
        const x = (event.clientX - box.left) / box.width - 0.5 // -0.5 .. 0.5
        const y = (event.clientY - box.top) / box.height - 0.5
        stage.style.setProperty('--px', `${(-x * 18).toFixed(1)}px`)
        stage.style.setProperty('--py', `${(-y * 12).toFixed(1)}px`)
      })
    }

    function handleLeave() {
      ;['--px', '--py'].forEach((name) => stage.style.removeProperty(name))
    }

    section.addEventListener('pointermove', handleMove)
    section.addEventListener('pointerleave', handleLeave)
    return () => {
      cancelAnimationFrame(frame)
      section.removeEventListener('pointermove', handleMove)
      section.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  const name = profile?.name?.trim() || FALLBACK_NAME
  const headline = profile?.headline?.trim() || FALLBACK_HEADLINE
  const [firstName, lastName] = splitName(name)
  const photoUrl = !photoFailed ? profile?.profile_image_url : null

  const extras = [
    profile?.resume_url && { label: 'Résumé', href: profile.resume_url, external: true },
    profile?.github_url && { label: 'GitHub', href: profile.github_url, external: true },
    profile?.linkedin_url && { label: 'LinkedIn', href: profile.linkedin_url, external: true },
    profile?.email && { label: 'Email', href: `mailto:${profile.email}`, external: false },
  ].filter(Boolean)

  return (
    <section ref={sectionRef} id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-night text-bone">
      {/* Tonal variation: a faint violet lift at the upper right, a lighter charcoal at the lower left, and film grain. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_80%_28%,rgb(111_93_242/0.17),transparent_70%),radial-gradient(55%_50%_at_6%_100%,var(--hero-tone),transparent_72%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="grid items-center px-6 pt-28 pb-12 lg:min-h-[100svh] lg:grid-cols-12 lg:px-12 lg:pt-24 lg:pb-12 xl:px-20">
        {/* ---- Left: the words ---- */}
        <div className="lg:col-span-7">
          <p className="rise flex items-center gap-4 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-iris" />
            Based in India · Building for the web
          </p>

          <h1 id="hero-title" className="mt-9">
            <span className="rise block font-ui text-xl text-ash sm:text-2xl" style={{ '--d': '80ms' }}>
              Hi, I’m
            </span>
            <span
              className="rise mt-1 block font-display text-[clamp(4.1rem,12.5vw,9.75rem)] leading-[0.86] font-extrabold tracking-[-0.04em] text-bone"
              style={{ '--d': '160ms' }}
            >
              {firstName}
              {lastName && <span className="block lg:ml-[0.5em]">{lastName}</span>}
            </span>
            <span className="rise mt-7 flex items-center gap-4 font-ui text-xl font-medium text-iris sm:text-2xl" style={{ '--d': '260ms' }}>
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-iris/60" />
              {headline}
            </span>
          </h1>

          <p className="rise mt-8 max-w-md font-ui text-base leading-relaxed text-bone/70 sm:text-lg" style={{ '--d': '340ms' }}>
            {introFor(profile)}
          </p>

          <div className="rise mt-10 flex flex-wrap gap-3" style={{ '--d': '420ms' }}>
            <a
              href="#projects"
              className={`inline-flex items-center gap-3 rounded-full bg-bone px-7 py-3.5 font-ui text-sm font-semibold text-night transition-all duration-300 hover:-translate-y-0.5 hover:bg-iris hover:shadow-[0_16px_34px_-14px_rgb(168_153_255/0.6)] ${focusRing}`}
            >
              View My Work <span aria-hidden="true">→</span>
            </a>
            <a
              href="#contact"
              className={`inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 font-ui text-sm font-semibold text-bone transition-all duration-300 hover:-translate-y-0.5 hover:border-iris hover:text-iris ${focusRing}`}
            >
              Get in Touch
            </a>
          </div>

          {extras.length > 0 && (
            <ul className="rise mt-10 flex flex-wrap gap-x-7 gap-y-3 font-label text-xs tracking-[0.14em] text-ash uppercase" style={{ '--d': '500ms' }}>
              {extras.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <ExternalLink href={link.href} className="transition-colors hover:text-iris">
                      {link.label}
                    </ExternalLink>
                  ) : (
                    <a href={link.href} className={`transition-colors hover:text-iris ${focusRing}`}>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p role="status" className="mt-6 font-label text-xs text-ash">
              {error}
            </p>
          )}
        </div>
      </div>

      {/* The portrait, full height of the section on wide screens (below the text on small ones). */}
      <div
        ref={stageRef}
        className="rise pointer-events-none relative h-[75svh] min-h-[28rem] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:min-h-0 lg:w-[46%]"
        style={{ '--d': '200ms' }}
      >
        <div className="photo-fade absolute inset-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`Portrait of ${name}`}
              decoding="async"
              onError={() => setPhotoFailed(true)}
              className="tilt-photo h-full w-full scale-[1.06] object-cover object-[50%_18%] contrast-105 saturate-[0.85]"
              style={{ translate: 'var(--px, 0px) var(--py, 0px)' }}
            />
          ) : (
            // No photo set (or it failed to load): large initials stand in for it.
            <div aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-[9rem] leading-none font-extrabold text-bone/10">
              {firstName[0]}
              {lastName[0]}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Hero
