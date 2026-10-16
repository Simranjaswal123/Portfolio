import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-iris'
const glassButton = `flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-bone backdrop-blur-md transition-colors duration-200 hover:border-iris/60 hover:text-iris disabled:opacity-40 ${focusRing}`

const SPRING = { type: 'spring', stiffness: 240, damping: 28, mass: 0.9 }
const MAX_STEPS_PER_GESTURE = 2 // a single drag or flick moves at most this many cards
const pad = (n) => String(n).padStart(2, '0')
const clamp = (value, low, high) => Math.min(high, Math.max(low, value))

// Phones get a wider active card and tighter neighbours, so the screenshot stays big
// enough to read while the next one still peeks out.
function useIsSmall() {
  const [small, setSmall] = useState(() => window.matchMedia('(max-width: 639px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)')
    const handleChange = () => setSmall(query.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return small
}

// Where a card sits, given d = its distance from the front in cards (0 = in front,
// 1 = the next one to the right, -1 = the previous one, and in between while moving).
// x is a percentage of the card's own width. Neighbours slide out and back, turn a few
// degrees towards the middle, shrink, dim and drop slightly, so the stack reads as depth.
function poseFor(d, gap, flat) {
  const a = Math.abs(d)
  const side = Math.sign(d)

  return {
    x: side * (Math.min(a, 1) * gap + clamp(a - 1, 0, 1) * gap * 0.45 + Math.max(a - 2, 0) * gap * 0.2),
    y: Math.min(a, 2) * 9,
    scale: 1 - Math.min(a, 2.5) * 0.085,
    rotateY: flat ? 0 : clamp(-d * 13, -24, 24),
    opacity: a <= 1 ? 1 - a * 0.3 : a <= 2 ? 0.7 - (a - 1) * 0.4 : Math.max(0, 0.3 - (a - 2) * 0.3),
    zIndex: Math.round(100 - a * 10),
    shade: Math.min(a, 1) * 0.38, // how much the card is darkened
  }
}

// One screenshot in the stack. Its look is a pure function of the shared position `pos`
// (a motion value), so dragging and the spring settle move every card in step without
// re-rendering React.
function StackCard({ slide, index, count, pos, gap, flat, active, onActivate, onEnlarge, failed, onFail, dragged }) {
  const x = useTransform(pos, (p) => `${poseFor(index - p, gap, flat).x}%`)
  const y = useTransform(pos, (p) => poseFor(index - p, gap, flat).y)
  const scale = useTransform(pos, (p) => poseFor(index - p, gap, flat).scale)
  const rotateY = useTransform(pos, (p) => poseFor(index - p, gap, flat).rotateY)
  const opacity = useTransform(pos, (p) => poseFor(index - p, gap, flat).opacity)
  const zIndex = useTransform(pos, (p) => poseFor(index - p, gap, flat).zIndex)
  const shade = useTransform(pos, (p) => poseFor(index - p, gap, flat).shade)
  const pointerEvents = useTransform(pos, (p) => (Math.abs(index - p) > 2.4 ? 'none' : 'auto'))

  function handleClick(event) {
    if (dragged.current) {
      return // the click that ends a drag is not a tap
    }

    if (active) {
      onEnlarge(index, event.currentTarget)
    } else {
      onActivate(index)
    }
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.button
        type="button"
        onClick={handleClick}
        tabIndex={active ? 0 : -1}
        aria-haspopup={active ? 'dialog' : undefined}
        aria-label={active ? `${slide.alt} (view larger)` : `Show image ${index + 1} of ${count}`}
        aria-current={active ? 'true' : undefined}
        style={{ x, y, scale, rotateY, opacity, zIndex, pointerEvents, transformPerspective: 1100, width: 'var(--card-w)', aspectRatio: 'var(--card-aspect)' }}
        className={`stack-card group relative overflow-hidden rounded-xl border bg-night-2 text-left select-none ${
          active ? 'cursor-zoom-in border-white/15 hover:border-iris/50' : 'cursor-pointer border-white/10'
        } shadow-[0_30px_60px_-30px_rgb(var(--shade)/0.95)] ${focusRing}`}
      >
        {failed ? (
          <span className="flex h-full items-center justify-center px-4 text-center font-ui text-sm text-ash">This image could not be loaded.</span>
        ) : (
          <img
            src={slide.image_url}
            alt={active ? slide.alt : ''}
            loading="eager"
            decoding="async"
            draggable="false"
            onError={onFail}
            className="h-full w-full object-cover object-top"
          />
        )}
        {/* Darkens cards the further they are from the front */}
        <motion.span aria-hidden="true" style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-[rgb(var(--shade))]" />
        {/* A fixed sheen across the top-left */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgb(255_255_255/0.08),transparent_32%)]" />
        {active && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/15 bg-night/70 px-3 py-1.5 font-ui text-xs font-medium text-bone opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            View larger ↗
          </span>
        )}
      </motion.button>
    </div>
  )
}

// One project's images as a draggable stack of cards: the cover first, then its own
// screenshots. The front card is the largest and in focus; its neighbours stay partly
// visible behind and beside it. Drag (mouse or touch), the arrow buttons, the dots or
// the arrow keys move through the stack; a spring settles it. Each project mounts its own
// instance, so one project's carousel never moves another's.
//
//   title      the project's name (for labels)
//   slides     [{ id, image_url, alt }], already in order (may be empty)
//   onEnlarge  (index, openerElement) => open the large viewer at that slide
//   aspect     the cards' width / height: 2.2 for website screenshots (the default),
//              1.5 for ordinary photographs. Set it to the images' shape so none are cropped.
function ProjectCarousel({ title, slides, onEnlarge, aspect = 2.2 }) {
  const count = slides.length
  const reduced = useReducedMotion()
  const small = useIsSmall()
  const gap = small ? 26 : 34 // distance between neighbouring card centres, in % of a card's width
  const cardWidth = small ? 88 : 74 // the front card's width, in % of the carousel
  // The stage is as tall as a card plus room for the tilted neighbours above and below.
  const stageAspect = 1 / (cardWidth / 100 / aspect + (small ? 0.1 : 0.125))

  const [active, setActive] = useState(0)
  const [failed, setFailed] = useState(() => new Set())
  const pos = useMotionValue(0) // the stack's position in cards; a whole number when at rest
  const stageRef = useRef(null)
  const settling = useRef(null) // the spring currently running, if any
  const startRef = useRef({ index: 0, position: 0, step: 1 })
  const dragged = useRef(false)
  const target = useRef(0) // the image the stack is heading for; quick presses build on this
  const current = clamp(active, 0, Math.max(count - 1, 0)) // the list can shrink after a refresh

  // Keep the position valid if the number of images changes under us.
  useEffect(() => {
    if (active !== current) {
      setActive(current)
    }

    settling.current?.stop()
    target.current = current
    pos.set(current)
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps

  function settleTo(wanted) {
    const index = clamp(Math.round(wanted), 0, count - 1)
    target.current = index
    settling.current?.stop()
    settling.current = animate(pos, index, reduced ? { duration: 0 } : SPRING)
    setActive(index)
  }

  function step(delta) {
    if (count > 1) {
      settleTo(target.current + delta) // from where it is heading, so fast repeated presses add up
    }
  }

  // --- dragging: one pan gesture on the whole stage ---
  function handlePanStart() {
    settling.current?.stop() // catch the stack wherever it is, even mid-spring
    const width = stageRef.current?.offsetWidth || 1
    // Dragging this far (px) moves the stack by one card.
    const stepPx = Math.max(width * (cardWidth / 100) * (gap / 100), 40)
    startRef.current = { index: Math.round(pos.get()), position: pos.get(), step: stepPx }
    target.current = startRef.current.index
    dragged.current = false
  }

  function handlePan(event, info) {
    const { position, step: stepPx, index } = startRef.current
    if (Math.abs(info.offset.x) > 6) dragged.current = true

    // Follow the finger, but never further than the allowed distance from where it began.
    const next = position - info.offset.x / stepPx
    pos.set(clamp(next, Math.max(index - MAX_STEPS_PER_GESTURE, 0) - 0.15, Math.min(index + MAX_STEPS_PER_GESTURE, count - 1) + 0.15))
  }

  function handlePanEnd(event, info) {
    const { index, step: stepPx } = startRef.current
    // Where it would coast to: the drag plus a little momentum from the flick's speed.
    const projected = pos.get() - info.velocity.x / stepPx / 14
    settleTo(clamp(Math.round(projected), index - MAX_STEPS_PER_GESTURE, index + MAX_STEPS_PER_GESTURE))
    setTimeout(() => (dragged.current = false), 60)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
  }

  if (count === 0) {
    return (
      <div aria-hidden="true" style={{ aspectRatio: aspect }} className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(60%_80%_at_30%_20%,rgb(111_93_242/0.14),transparent_70%)] font-display text-[clamp(4rem,12vw,8rem)] leading-none font-extrabold text-bone/10">
        {title.trim().slice(0, 2).toUpperCase()}
      </div>
    )
  }

  const several = count > 1

  return (
    <div role="region" aria-roledescription="carousel" aria-label={`Images of ${title}`} onKeyDown={handleKeyDown} className="project-stack min-w-0">
      <motion.div
        ref={stageRef}
        onPanStart={several ? handlePanStart : undefined}
        onPan={several ? handlePan : undefined}
        onPanEnd={several ? handlePanEnd : undefined}
        style={{ '--card-w': `${cardWidth}%`, '--card-aspect': aspect, aspectRatio: stageAspect, touchAction: 'pan-y' }}
        className={`relative isolate w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] ${several ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        {slides.map((slide, index) => (
          <StackCard
            key={slide.id}
            slide={slide}
            index={index}
            count={count}
            pos={pos}
            gap={gap}
            flat={reduced}
            active={index === current}
            onActivate={settleTo}
            onEnlarge={onEnlarge}
            failed={failed.has(slide.id)}
            onFail={() => setFailed((set) => new Set(set).add(slide.id))}
            dragged={dragged}
          />
        ))}
      </motion.div>

      {several && (
        <div className="mt-4 flex items-center justify-between gap-4 sm:mt-5">
          <button type="button" onClick={() => step(-1)} disabled={current === 0} className={glassButton}>
            <span className="sr-only">Previous image</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m14 6-6 6 6 6" />
            </svg>
          </button>

          <div className="flex min-w-0 flex-col items-center gap-3">
            <ul aria-label="Choose an image" className="flex items-center">
              {slides.map((slide, index) => (
                <li key={slide.id}>
                  <button
                    type="button"
                    onClick={() => settleTo(index)}
                    aria-current={index === current ? 'true' : undefined}
                    className={`group/dot flex h-6 w-5 items-center justify-center ${focusRing}`}
                  >
                    <span className="sr-only">Show image {index + 1} of {count}</span>
                    <span
                      aria-hidden="true"
                      className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                        index === current ? 'w-6 bg-iris' : 'w-1.5 bg-white/25 group-hover/dot:bg-white/50'
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
            <p aria-live="polite" className="font-label text-xs tracking-[0.14em] text-ash tabular-nums">
              <span className="sr-only">Image </span>
              <span className="text-bone">{pad(current + 1)}</span> / {pad(count)}
            </p>
          </div>

          <button type="button" onClick={() => step(1)} disabled={current === count - 1} className={glassButton}>
            <span className="sr-only">Next image</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m10 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProjectCarousel
