import { useEffect, useRef, useState } from 'react'

const glass = 'border border-white/10 bg-white/[0.06] backdrop-blur-xl'
const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-iris'
const roundButton = `flex size-11 items-center justify-center rounded-full ${glass} text-bone transition-colors duration-200 hover:border-iris/60 hover:text-iris ${focusRing}`

// A full-screen viewer for one project's screenshots, built on the native <dialog>
// element: while it is open the page behind it is inert, Tab stays inside it, Escape
// closes it, and focus returns to what opened it.
//
//   title    the project's name
//   images   [{ id, image_url, alt_text }], already in display order (never empty)
//   startIndex  which image to open on
//   kicker   the small label above the title
//   onClose  called after the dialog has closed
//
// Arrow keys (or swiping) change screenshot, Home/End jump to the first/last, and the
// zoom button (or a click on the picture) shows it at a larger size you can scroll around.
function ProjectGallery({ title, images, startIndex = 0, kicker = 'Project images', onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const scrollerRef = useRef(null)
  const thumbsRef = useRef(null)
  const touchStartX = useRef(null)
  const [index, setIndex] = useState(startIndex)
  const [zoomed, setZoomed] = useState(false)
  const [failed, setFailed] = useState(() => new Set())

  const count = images.length
  const current = images[index]

  // Open as a modal on mount; hold the page still while it is open.
  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog.open) {
      dialog.showModal()
    }

    closeRef.current?.focus() // start on the Close button, the safest place to land

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Warm up the neighbouring screenshots so stepping through feels instant.
  useEffect(() => {
    if (count < 2) {
      return
    }

    ;[(index + 1) % count, (index - 1 + count) % count].forEach((i) => {
      new Image().src = images[i].image_url
    })
  }, [index, count, images])

  // Keep the active thumbnail in view.
  useEffect(() => {
    const thumb = thumbsRef.current?.children[index]
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    thumb?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: calm ? 'auto' : 'smooth' })
  }, [index])

  // When zoomed in, start in the middle of the enlarged picture.
  useEffect(() => {
    const scroller = scrollerRef.current

    if (zoomed && scroller) {
      scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2
      scroller.scrollTop = 0
    }
  }, [zoomed, index])

  function go(step) {
    setIndex((i) => (i + step + count) % count)
    setZoomed(false)
  }

  function jump(to) {
    setIndex(to)
    setZoomed(false)
  }

  function handleKeyDown(event) {
    if (zoomed || count < 2) {
      return // arrow keys scroll the enlarged picture instead
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      jump(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      jump(count - 1)
    }
  }

  // Escape steps back from zoom first, then closes.
  function handleCancel(event) {
    if (zoomed) {
      event.preventDefault()
      setZoomed(false)
    }
  }

  function handleTouchEnd(event) {
    const startX = touchStartX.current
    touchStartX.current = null

    if (zoomed || count < 2 || startX === null) {
      return
    }

    const distance = event.changedTouches[0].clientX - startX

    if (Math.abs(distance) > 50) {
      go(distance < 0 ? 1 : -1)
    }
  }

  const alt = current.alt_text || `${title}, screenshot ${index + 1} of ${count}`

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Screenshots of ${title}`}
      onClose={onClose}
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      className="gallery-in fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-bone backdrop:bg-night/90 backdrop:backdrop-blur-md"
    >
      <div className="flex h-full flex-col gap-3 p-3 sm:gap-4 sm:p-5">
        {/* Top bar: what you are looking at, where you are, zoom and close */}
        <header className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-2.5 sm:px-5 ${glass}`}>
          <div className="min-w-0">
            <p className="font-label text-[0.65rem] tracking-[0.2em] text-ash uppercase">{kicker}</p>
            <h2 className="truncate font-display text-lg font-bold tracking-tight text-bone">{title}</h2>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <p aria-live="polite" className="font-label text-sm tracking-[0.12em] text-bone tabular-nums">
              <span className="sr-only">Screenshot </span>
              {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </p>
            <button type="button" onClick={() => setZoomed((z) => !z)} aria-pressed={zoomed} className={roundButton}>
              <span className="sr-only">{zoomed ? 'Zoom out' : 'Zoom in'}</span>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6" />
                <path d="m15 15 5 5M8 10.5h5" />
                {!zoomed && <path d="M10.5 8v5" />}
              </svg>
            </button>
            <button ref={closeRef} type="button" onClick={() => dialogRef.current.close()} className={roundButton}>
              <span className="sr-only">Close gallery</span>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </header>

        {/* The screenshot. Clicking the empty space around it closes the gallery. */}
        <div className="relative min-h-0 flex-1" onTouchStart={(event) => (touchStartX.current = event.touches[0].clientX)} onTouchEnd={handleTouchEnd}>
          <div
            ref={scrollerRef}
            onClick={(event) => {
              if (event.target === event.currentTarget && !zoomed) dialogRef.current.close()
            }}
            className="flex h-full w-full overflow-auto rounded-2xl"
          >
            {failed.has(current.id) ? (
              <p role="status" className="m-auto font-ui text-base text-ash">
                This screenshot could not be loaded.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                className={`m-auto block ${zoomed ? 'w-[200%] max-w-none shrink-0 cursor-zoom-out' : 'max-h-full max-w-full cursor-zoom-in'} ${focusRing}`}
              >
                <img
                  key={current.id}
                  src={current.image_url}
                  alt={alt}
                  decoding="async"
                  onError={() => setFailed((set) => new Set(set).add(current.id))}
                  className={`block rounded-xl border border-white/10 bg-night-2 shadow-[0_30px_80px_-30px_rgb(var(--shade)/0.9)] ${
                    zoomed ? 'h-auto w-full' : 'max-h-[calc(100svh-15rem)] max-w-full object-contain sm:max-h-[calc(100svh-14rem)]'
                  }`}
                />
                <span className="sr-only">{zoomed ? ' (click to zoom out)' : ' (click to zoom in)'}</span>
              </button>
            )}
          </div>

          {count > 1 && !zoomed && (
            <>
              <button type="button" onClick={() => go(-1)} className={`absolute top-1/2 left-2 -translate-y-1/2 sm:left-4 ${roundButton}`}>
                <span className="sr-only">Previous screenshot</span>
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m14 6-6 6 6 6" />
                </svg>
              </button>
              <button type="button" onClick={() => go(1)} className={`absolute top-1/2 right-2 -translate-y-1/2 sm:right-4 ${roundButton}`}>
                <span className="sr-only">Next screenshot</span>
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m10 6 6 6-6 6" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails, only when there is more than one */}
        {count > 1 && (
          <div className={`rounded-2xl p-2 ${glass}`}>
            <ul ref={thumbsRef} aria-label="Choose a screenshot" className="flex gap-2 overflow-x-auto [scrollbar-width:thin]">
              {images.map((image, i) => (
                <li key={image.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    aria-current={i === index ? 'true' : undefined}
                    className={`block h-14 w-24 overflow-hidden rounded-lg border transition-[border-color,opacity] duration-200 sm:h-16 sm:w-28 ${focusRing} ${
                      i === index ? 'border-iris opacity-100' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={image.image_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                    <span className="sr-only">Screenshot {i + 1} of {count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </dialog>
  )
}

export default ProjectGallery
