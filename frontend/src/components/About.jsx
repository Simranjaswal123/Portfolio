import { useEffect, useRef, useState } from 'react'
import { getProfile } from '../services/profile.service.js'

// Not stored in Supabase, so they live here.
const traits = ['Creative', 'Detail-Oriented', 'Problem-Solver', 'Team Player']

// A few phrases to set in violet. They are only styled where they appear in the bio, so
// the text itself is never changed (and nothing is highlighted if the bio is reworded).
const emphasis = ['clean, user-friendly web experiences', 'complex problems', 'make a real difference']

const emphasisPattern = new RegExp(`(${emphasis.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')

// The bio is stored as paragraphs separated by blank lines.
function toParagraphs(bio) {
  return (bio ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

// Splits a paragraph around the emphasised phrases: with a capturing group, every odd
// piece is a match.
function withEmphasis(text) {
  return text.split(emphasisPattern).map((piece, index) =>
    index % 2 === 1 ? (
      <span key={index} className="font-medium text-iris">
        {piece}
      </span>
    ) : (
      piece
    ),
  )
}

// The bio split into words for the scroll reveal, keeping the paragraphs, the violet
// phrases and every space exactly as stored. Returns one list of pieces per paragraph:
//   { word, index, em }  a word (index = its place in reading order across all paragraphs)
//   { space }            the whitespace between words, left as plain text so lines wrap
//                        exactly as before
function splitWords(paragraphs) {
  let index = 0
  const split = paragraphs.map((paragraph) =>
    paragraph.split(emphasisPattern).flatMap((piece, pieceIndex) =>
      piece
        .split(/(\s+)/)
        .filter(Boolean)
        .map((token) => (/^\s+$/.test(token) ? { space: token } : { word: token, index: index++, em: pieceIndex % 2 === 1 })),
    ),
  )
  return { split, total: index }
}

// Drives the reveal: while the bio is on screen, each scroll frame writes one number,
// --p (0 = nothing lit, 1 = everything lit), onto the container; CSS turns it into each
// word's colour. No React state changes while scrolling, and the scroll listener only
// exists while the text is near the screen.
//   desktop/tablet  starts as the text comes up from the bottom (85% down the screen) and
//                   finishes when its end passes the middle; words light one by one
//   phones          starts earlier, finishes sooner, and lights words in softer, wider
//                   groups, so there is little extra scrolling
function useScrollReveal(ref, enabled) {
  useEffect(() => {
    const element = ref.current

    if (!element || !enabled) {
      return
    }

    let frame = 0
    let listening = false

    function update() {
      frame = 0
      const box = element.getBoundingClientRect()
      const viewport = window.innerHeight
      const small = window.innerWidth < 768
      const start = viewport * (small ? 0.95 : 0.85) // where the text's top is when the reveal begins
      const end = viewport * (small ? 0.8 : 0.5) // where its bottom is when the reveal ends
      const progress = (start - box.top) / (start - end + box.height)

      element.style.setProperty('--p', Math.min(1, Math.max(0, progress)).toFixed(4))
      element.style.setProperty('--s', small ? '0.3' : '0.08') // how many words fade at once
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    function listen(on) {
      if (on === listening) return
      listening = on
      const method = on ? 'addEventListener' : 'removeEventListener'
      window[method]('scroll', onScroll, { passive: true })
      window[method]('resize', onScroll)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        listen(entry.isIntersecting)
        update() // also settles the final state when it leaves the screen
      },
      { rootMargin: '25% 0px 25% 0px' },
    )

    observer.observe(element)
    update()

    return () => {
      observer.disconnect()
      listen(false)
      cancelAnimationFrame(frame)
    }
  }, [ref, enabled])
}

// True when the visitor has asked for less motion (kept up to date if they change it).
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setReduced(query.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return reduced
}

// Fades and lifts its content into place the first time it scrolls into view. The
// hidden starting state only exists when motion is allowed (see index.css), and
// browsers without IntersectionObserver simply show everything.
function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element || !('IntersectionObserver' in window)) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag ref={ref} {...rest} className={`reveal ${shown ? 'is-visible' : ''} ${className}`} style={{ '--d': `${delay}ms` }}>
      {children}
    </Tag>
  )
}

// "01 / About me": the heading on the left, the bio and four traits on the right.
function About() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const bioRef = useRef(null)
  const reducedMotion = usePrefersReducedMotion()

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(await getProfile())
      } catch (err) {
        console.error(err)
        setError('Could not load this section. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const paragraphs = toParagraphs(profile?.bio)
  const scrollReveal = paragraphs.length > 0 && !reducedMotion
  useScrollReveal(bioRef, scrollReveal)

  // The section and heading always render, so the #about link works even while loading.
  let content = null

  if (loading) {
    content = (
      <p role="status" className="font-label text-xs tracking-[0.14em] text-ash uppercase">
        Loading…
      </p>
    )
  } else if (error) {
    content = (
      <p role="alert" className="font-ui text-base text-ash">
        {error}
      </p>
    )
  } else if (scrollReveal) {
    // Each paragraph keeps its text for screen readers in one piece (sr-only); the word
    // spans that light up are hidden from them, so nothing is announced word by word.
    const { split, total } = splitWords(paragraphs)
    const lastIndex = Math.max(total - 1, 1)

    content = paragraphs.map((paragraph, index) => (
      <Reveal
        key={index}
        as="p"
        delay={index === 0 ? 0 : 80}
        className={
          index === 0
            ? 'scroll-paragraph scroll-lead font-ui text-xl leading-snug text-bone sm:text-2xl lg:text-[1.65rem]'
            : 'scroll-paragraph font-ui text-base leading-relaxed text-bone/70 sm:text-lg'
        }
      >
        <span className="sr-only">{paragraph}</span>
        <span aria-hidden="true">
          {split[index].map((piece, i) =>
            piece.space ? (
              piece.space
            ) : piece.em ? (
              // Violet phrases keep their colour and weight the whole time.
              <span key={i} className="font-medium text-iris">
                {piece.word}
              </span>
            ) : (
              <span key={i} className="scroll-word" style={{ '--i': (piece.index / lastIndex).toFixed(4) }}>
                {piece.word}
              </span>
            ),
          )}
        </span>
      </Reveal>
    ))
  } else {
    content = paragraphs.map((paragraph, index) => (
      <Reveal
        key={index}
        as="p"
        delay={index === 0 ? 0 : 80}
        className={
          index === 0
            ? 'font-ui text-xl leading-snug text-bone sm:text-2xl lg:text-[1.65rem]'
            : 'font-ui text-base leading-relaxed text-bone/70 sm:text-lg'
        }
      >
        {withEmphasis(paragraph)}
      </Reveal>
    ))
  }

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative isolate overflow-hidden border-t border-white/10 bg-night bg-[radial-gradient(50%_60%_at_100%_0%,rgb(111_93_242/0.09),transparent_70%)] text-bone"
    >
      <div className="grid gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:py-36 xl:px-20">
        {/* ---- Left: label and heading ---- */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="flex items-center gap-4 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
                <span className="text-iris">01</span>
                <span aria-hidden="true" className="h-px w-10 shrink-0 bg-iris" />
                About me
              </p>
            </Reveal>

            <Reveal delay={90}>
              <h2
                id="about-title"
                className="mt-8 font-display text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.035em] text-bone"
              >
                Behind
                <br />
                the <span className="text-iris">code.</span>
              </h2>
            </Reveal>
          </div>
        </div>

        {/* ---- Right: the bio and the four traits ---- */}
        <div className="lg:col-span-7 lg:pt-3 xl:col-span-6 xl:col-start-7">
          <div ref={bioRef} className={`max-w-2xl space-y-7 ${scrollReveal ? 'scroll-reveal' : ''}`}>
            {content}
          </div>

          {!loading && !error && (
            <Reveal as="ul" delay={120} className="mt-12 flex max-w-2xl flex-wrap gap-3" aria-label="A few words that describe me">
              {traits.map((trait) => (
                <li
                  key={trait}
                  className="rounded-full border border-white/15 px-5 py-2.5 font-ui text-sm text-bone/80 transition-[color,border-color,translate] duration-300 hover:border-iris/70 hover:text-iris motion-safe:hover:-translate-y-0.5"
                >
                  {trait}
                </li>
              ))}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}

export default About
