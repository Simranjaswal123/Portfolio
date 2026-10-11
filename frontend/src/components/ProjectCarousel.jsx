import { useEffect, useRef, useState } from 'react'

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-iris'
const glassButton = `flex size-11 items-center justify-center rounded-full border border-white/15 bg-night/55 text-bone shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur-md transition-colors duration-200 hover:border-iris/60 hover:text-iris ${focusRing}`

// How long a slide change takes; further arrow presses / swipes wait for it to finish,
// so rapid input can never leave the track between two images.
const SLIDE_MS = 450

const pad = (n) => String(n).padStart(2, '0')

// One project's images in a glass frame: the cover first, then its screenshots.
//
//   title      the project's name (for labels and alt text)
//   slides     [{ id, image_url, alt }], already in order (may be empty)
//   onEnlarge  (index, openerElement) => open the large viewer at that slide
//
// Arrows, thumbnails, the arrow keys and swiping change slide; clicking the picture
// enlarges it. With one image there are no controls; with none, the frame shows the
// project's initials.
function ProjectCarousel({ title, slides, onEnlarge }) {
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState(() => new Set())
  const busyUntil = useRef(0)
  const touchStartX = useRef(null)
  const thumbsRef = useRef(null)
  const count = slides.length
  const current = Math.min(index, Math.max(count - 1, 0)) // the list can shrink after a refresh

  // Keep the active thumbnail in view.
  useEffect(() => {
    const strip = thumbsRef.current
    const thumb = strip?.children[current]

    if (strip && thumb) {
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      strip.scrollTo({ left: thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2, behavior: calm ? 'auto' : 'smooth' })
    }
  }, [current])

  function go(step) {
    const now = Date.now()

    if (count < 2 || now < busyUntil.current) {
      return
    }

    busyUntil.current = now + SLIDE_MS
    setIndex((i) => (Math.min(i, count - 1) + step + count) % count)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    }
  }

  function handleTouchEnd(event) {
    const startX = touchStartX.current
    touchStartX.current = null

    if (startX === null) {
      return
    }

    const distance = event.changedTouches[0].clientX - startX

    if (Math.abs(distance) > 45) {
      go(distance < 0 ? 1 : -1)
    }
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`Images of ${title}`}
      onKeyDown={handleKeyDown}
      className="carousel-frame group relative"
    >
      {/* Layered depth: two faint panes stacked behind the frame */}
      <div aria-hidden="true" className="absolute inset-x-[6%] -bottom-3 top-3 -z-10 rounded-[1.6rem] border border-white/[0.06] bg-white/[0.025]" />
      <div aria-hidden="true" className="absolute inset-x-[12%] -bottom-6 top-6 -z-20 rounded-[1.6rem] border border-white/[0.04] bg-white/[0.015]" />

      {/* The glass frame */}
      <div className="carousel-glass relative rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_40px_70px_-36px_rgb(0_0_0/0.95)] backdrop-blur-xl transition-[box-shadow,border-color] duration-300 group-hover:border-white/[0.16] sm:p-2.5">
        {/* A soft reflection across the top of the glass */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(160deg,rgb(255_255_255/0.07),transparent_30%)]" />

        <div
          className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-night-2"
          onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)}
          onTouchEnd={handleTouchEnd}
        >
          {count === 0 ? (
            <div aria-hidden="true" className="flex h-full w-full items-center justify-center bg-[radial-gradient(60%_80%_at_30%_20%,rgb(111_93_242/0.14),transparent_70%)] font-display text-[clamp(4rem,12vw,8rem)] leading-none font-extrabold text-bone/10">
              {title.trim().slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <ul
              className="carousel-track flex h-full"
              style={{ transform: `translateX(-${current * 100}%)`, '--slide-ms': `${SLIDE_MS}ms` }}
            >
              {slides.map((slide, i) => {
                const active = i === current
                return (
                  <li
                    key={slide.id}
                    aria-hidden={!active}
                    inert={!active}
                    className={`carousel-slide h-full w-full shrink-0 ${active ? 'opacity-100' : 'opacity-30'}`}
                  >
                    {failed.has(slide.id) ? (
                      <p className="flex h-full items-center justify-center font-ui text-sm text-ash">This image could not be loaded.</p>
                    ) : (
                      <button
                        type="button"
                        onClick={(event) => onEnlarge(i, event.currentTarget)}
                        aria-haspopup="dialog"
                        className={`block h-full w-full cursor-zoom-in ${focusRing} focus-visible:-outline-offset-2`}
                      >
                        <img
                          src={slide.image_url}
                          alt={slide.alt}
                          loading={Math.abs(i - current) <= 1 ? 'eager' : 'lazy'}
                          decoding="async"
                          draggable="false"
                          onError={() => setFailed((set) => new Set(set).add(slide.id))}
                          className="h-full w-full object-cover object-top select-none"
                        />
                        <span className="sr-only"> (view larger)</span>
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className={`absolute top-1/2 left-3 -translate-y-1/2 ${glassButton}`}>
                <span className="sr-only">Previous image</span>
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m14 6-6 6 6 6" />
                </svg>
              </button>
              <button type="button" onClick={() => go(1)} className={`absolute top-1/2 right-3 -translate-y-1/2 ${glassButton}`}>
                <span className="sr-only">Next image</span>
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m10 6 6 6-6 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails and counter */}
        {count > 1 && (
          <div className="flex items-center gap-4 px-1 pt-2.5">
            <ul ref={thumbsRef} aria-label="Choose an image" className="flex min-w-0 flex-1 gap-2 overflow-x-auto p-0.5 [scrollbar-width:none]">
              {slides.map((slide, i) => (
                <li key={slide.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-current={i === current ? 'true' : undefined}
                    className={`relative block h-11 w-20 overflow-hidden rounded-lg border transition-[border-color,opacity] duration-200 sm:h-12 sm:w-24 ${focusRing} ${
                      i === current ? 'border-iris opacity-100' : 'border-white/10 opacity-50 hover:opacity-90'
                    }`}
                  >
                    <img src={slide.image_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                    <span className="sr-only">
                      Show image {i + 1} of {count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p aria-live="polite" className="shrink-0 pr-1 font-label text-xs tracking-[0.14em] text-ash tabular-nums">
              <span className="sr-only">Image </span>
              <span className="text-bone">{pad(current + 1)}</span> / {pad(count)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectCarousel
