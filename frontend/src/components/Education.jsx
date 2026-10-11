import { useEffect, useId, useRef, useState } from 'react'
import { getEducation } from '../services/education.service.js'
import Reveal from './Reveal.jsx'

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-iris'

// Turns a database date like "2023-08-01" into "Aug 2023".
// Anything else (for example the text "2023") is shown as it is.
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

// Words people type into a form to mean "nothing here".
const EMPTY_WORDS = ['none', 'n/a', 'na', '-', '—', 'nil']

// A stored text value, or null when it is empty or one of the "nothing" words.
function present(value) {
  const text = String(value ?? '').trim()
  return text && !EMPTY_WORDS.includes(text.toLowerCase()) ? text : null
}

// Text typed into the admin form, as paragraphs (blank lines separate them).
function toParagraphs(text) {
  return (present(text) ?? '')
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

// Read from the dates only: no end date means it is ongoing; an end date in the future
// means it is expected then.
function statusOf(item) {
  if (!item.end_date) {
    return 'In progress'
  }

  const today = new Date().toISOString().slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}/.test(item.end_date) && item.end_date > today ? `Expected ${formatDate(item.end_date)}` : 'Completed'
}

// Most recent first. Records without a start date go last.
function sortEducation(items) {
  return [...items].sort((a, b) => String(b.start_date ?? '').localeCompare(String(a.start_date ?? '')))
}

const pad = (n) => String(n).padStart(2, '0')

// One labelled group of facts. Hovering it lights the label and draws its marker out.
function Fact({ label, children, delay = 0, wide = false }) {
  return (
    <Reveal delay={delay} className={`group/fact ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className="flex items-center gap-3 font-label text-[0.65rem] tracking-[0.2em] text-ash uppercase transition-colors duration-300 group-hover/fact:text-iris">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 bg-iris transition-[width] duration-500 group-hover/fact:w-6" />
        {label}
      </dt>
      <dd className="mt-3 font-ui text-lg leading-snug text-bone sm:text-xl">{children}</dd>
    </Reveal>
  )
}

// The dossier for one record: a document-like surface with crop marks, a faint
// background identifier and a stack of sheets behind it. On desktop pointers it tilts
// at most ~3 degrees towards the cursor and catches a soft highlight; the text tilts
// with the sheet, never on its own.
function Dossier({ item, number, total, direction, panelId, tabId }) {
  const wrapRef = useRef(null)
  const sheetRef = useRef(null)
  const detailsId = useId()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const details = toParagraphs(item.description)
  const field = present(item.field)
  const institution = present(item.institution)
  const period = item.start_date ? `${formatDate(item.start_date)} – ${item.end_date ? formatDate(item.end_date) : 'Present'}` : null
  const status = item.start_date || item.end_date ? statusOf(item) : null

  function handlePointerMove(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
      return
    }

    const box = wrapRef.current.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width // 0 .. 1
    const y = (event.clientY - box.top) / box.height
    const sheet = sheetRef.current

    sheet.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    sheet.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sheet.style.setProperty('--ry', `${((x - 0.5) * 6).toFixed(2)}deg`) // at most ±3deg
      sheet.style.setProperty('--rx', `${((0.5 - y) * 4).toFixed(2)}deg`) // at most ±2deg
    }
  }

  function handlePointerLeave() {
    ;['--mx', '--my', '--ry', '--rx'].forEach((name) => sheetRef.current?.style.removeProperty(name))
  }

  return (
    <div
      id={panelId}
      role={tabId ? 'tabpanel' : undefined}
      aria-labelledby={tabId}
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group/dossier relative [perspective:1600px]"
    >
      {/* The sheets behind: a slightly smaller page and a hairline outline, set back a little */}
      <div aria-hidden="true" className="dossier-back absolute inset-x-4 -bottom-3 top-3 rounded-sm border border-white/[0.06] bg-white/[0.02] sm:inset-x-6" />
      <div aria-hidden="true" className="dossier-back-far absolute inset-x-10 -bottom-6 top-6 rounded-sm border border-white/[0.04] sm:inset-x-14" />

      <div
        ref={sheetRef}
        className="dossier-sheet relative overflow-hidden rounded-sm border border-white/10 bg-[linear-gradient(160deg,#18181e,#111116_45%,#0e0e12)] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_50px_80px_-50px_rgb(0_0_0/0.95)] transition-[border-color] duration-300 group-hover/dossier:border-white/[0.16]"
      >
        {/* The highlight that follows the pointer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(380px_circle_at_var(--mx,50%)_var(--my,0%),rgb(168_153_255/0.09),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/dossier:opacity-100"
        />
        {/* The faint identifier across the page */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-[0.04em] -bottom-[0.2em] font-display text-[clamp(6rem,18vw,15rem)] leading-none font-extrabold tracking-[-0.05em] whitespace-nowrap text-bone/[0.035] select-none"
        >
          EDU/{number}
        </span>
        {/* Crop marks in the corners, as on a printed document */}
        {['top-4 left-4 border-t border-l', 'top-4 right-4 border-t border-r', 'bottom-4 left-4 border-b border-l', 'bottom-4 right-4 border-b border-r'].map((corner) => (
          <span key={corner} aria-hidden="true" className={`absolute size-3 border-iris/50 ${corner}`} />
        ))}

        <div key={item.id} className="dossier-in relative p-7 sm:p-10 lg:p-14" style={{ '--dir': direction }}>
          {/* The dossier's file line */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-white/10 pb-5 font-label text-[0.65rem] tracking-[0.2em] text-ash uppercase sm:text-xs">
            <p>
              <span className="text-iris">Dossier {number}</span>
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, </span>
              Record {number} of {pad(total)}
            </p>
            {status && (
              <p className="flex items-center gap-2">
                <span aria-hidden="true" className={`size-1.5 rounded-full ${item.end_date ? 'bg-ash' : 'bg-iris'}`} />
                {status}
              </p>
            )}
          </div>

          <h3 className="mt-10 font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.92] font-extrabold tracking-[-0.04em] break-words text-bone">
            {item.degree}
          </h3>
          {field && <p className="mt-4 max-w-2xl font-ui text-xl text-bone/75 sm:text-2xl">{field}</p>}

          <dl className="mt-12 grid gap-x-10 gap-y-9 border-t border-white/10 pt-9 sm:grid-cols-2">
            {institution && (
              <Fact label="Institution" delay={0} wide={!period}>
                {institution}
              </Fact>
            )}
            {period && (
              <Fact label="Period" delay={70}>
                {period}
              </Fact>
            )}
          </dl>

          {/* Extra detail, only when the record has some */}
          {details.length > 0 && (
            <div className="mt-10 border-t border-white/10 pt-6">
              <button
                type="button"
                aria-expanded={detailsOpen}
                aria-controls={detailsId}
                onClick={() => setDetailsOpen((open) => !open)}
                className={`group/details inline-flex items-center gap-3 font-ui text-sm font-semibold text-iris transition-colors duration-200 hover:text-bone ${focusRing}`}
              >
                <span aria-hidden="true" className={`flex size-6 items-center justify-center rounded-full border border-iris/50 transition-transform duration-300 ${detailsOpen ? 'rotate-45' : ''}`}>
                  <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M6 2v8M2 6h8" />
                  </svg>
                </span>
                {detailsOpen ? 'Hide academic details' : 'View academic details'}
              </button>
              <div id={detailsId} className={`details-panel grid ${detailsOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} inert={!detailsOpen}>
                <div className="min-h-0 overflow-hidden">
                  <div className="max-w-2xl space-y-4 pt-6">
                    {details.map((paragraph, i) => (
                      <p key={i} className="font-ui text-base leading-relaxed whitespace-pre-line text-bone/70 sm:text-lg">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// "05 / Education / Archive": a short opening, then the dossier. With more than one
// record, an archive index (tabs) switches between them.
function Education() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = moving down the list, -1 = up
  const tabRefs = useRef([])
  const baseId = useId()

  async function loadEducation() {
    setLoading(true)
    setError(null)

    try {
      setEntries(sortEducation(await getEducation()))
      setActive(0)
    } catch (err) {
      console.error(err)
      setError('Could not load education. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    loadEducation()
  }, [])

  function select(index, { focus = false } = {}) {
    if (index === active) {
      return
    }

    setDirection(index > active ? 1 : -1)
    setActive(index)

    if (focus) {
      tabRefs.current[index]?.focus()
    }
  }

  // Arrow keys move along the index; Home/End jump to its ends.
  function handleTabKeyDown(event) {
    const last = entries.length - 1
    const keys = { ArrowDown: active + 1, ArrowRight: active + 1, ArrowUp: active - 1, ArrowLeft: active - 1, Home: 0, End: last }

    if (event.key in keys) {
      event.preventDefault()
      const next = (keys[event.key] + entries.length) % entries.length
      select(next, { focus: true })
    }
  }

  const multiple = entries.length > 1
  const tabId = (i) => `${baseId}-tab-${i}`
  const panelId = `${baseId}-panel`

  // The section and heading always render, so the #education link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = (
      <div>
        <p role="status" className="font-label text-xs tracking-[0.14em] text-ash uppercase">
          Opening the archive…
        </p>
        <div aria-hidden="true" className="mt-8 h-80 rounded-sm border border-white/[0.07] bg-white/[0.02]" />
      </div>
    )
  } else if (error) {
    content = (
      <div role="alert" className="flex flex-wrap items-center gap-5">
        <p className="font-ui text-base text-ash">{error}</p>
        <button
          type="button"
          onClick={loadEducation}
          className={`rounded-full border border-white/20 px-5 py-2.5 font-ui text-sm font-semibold text-bone transition-colors duration-200 hover:border-iris hover:text-iris ${focusRing}`}
        >
          Try again
        </button>
      </div>
    )
  } else if (entries.length === 0) {
    content = <p className="font-ui text-base text-ash">No education entries yet.</p>
  } else {
    const item = entries[Math.min(active, entries.length - 1)]
    const dossier = (
      <Dossier
        item={item}
        number={pad(active + 1)}
        total={entries.length}
        direction={direction}
        panelId={panelId}
        tabId={multiple ? tabId(active) : undefined}
      />
    )

    content = multiple ? (
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* ---- The archive index ---- */}
        <Reveal className="min-w-0 lg:col-span-4">
          <p id={`${baseId}-index`} className="font-label text-[0.65rem] tracking-[0.2em] text-ash uppercase">
            Archive index
          </p>
          <div
            role="tablist"
            aria-labelledby={`${baseId}-index`}
            aria-orientation="vertical"
            onKeyDown={handleTabKeyDown}
            className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible lg:border-t lg:border-white/10 lg:pb-0"
          >
            {entries.map((entry, i) => {
              const selected = i === active
              return (
                <button
                  key={entry.id}
                  ref={(element) => (tabRefs.current[i] = element)}
                  id={tabId(i)}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={`group/tab relative flex shrink-0 items-baseline gap-4 rounded-full border px-4 py-2.5 text-left transition-colors duration-300 lg:rounded-none lg:border-0 lg:border-b lg:border-white/10 lg:px-0 lg:py-5 lg:pl-5 ${focusRing} ${
                    selected ? 'border-iris/60 lg:border-white/10' : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  {/* The active marker: a violet bar on the left (wide screens) */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-1/2 left-0 hidden h-8 w-px -translate-y-1/2 bg-iris transition-transform duration-300 lg:block ${selected ? 'scale-y-100' : 'scale-y-0'}`}
                  />
                  <span className={`font-label text-xs tracking-[0.14em] ${selected ? 'text-iris' : 'text-ash'}`}>EDU/{pad(i + 1)}</span>
                  <span className="min-w-0">
                    <span className={`block font-ui text-sm font-semibold whitespace-nowrap transition-colors duration-300 lg:text-base lg:whitespace-normal ${selected ? 'text-bone' : 'text-bone/60 group-hover/tab:text-bone'}`}>
                      {entry.degree}
                    </span>
                    {present(entry.institution) && (
                      <span className="mt-1 hidden font-ui text-sm text-ash lg:block">{present(entry.institution)}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-4 hidden font-label text-[0.62rem] tracking-[0.16em] text-ash/70 uppercase lg:block">Use ↑ ↓ to browse</p>
        </Reveal>

        {/* ---- The dossier ---- */}
        <Reveal delay={120} className="reveal-focus min-w-0 lg:col-span-8">
          {dossier}
        </Reveal>
      </div>
    ) : (
      <Reveal delay={120} className="reveal-focus mx-auto max-w-5xl">
        {dossier}
      </Reveal>
    )
  }

  return (
    <section id="education" aria-labelledby="education-title" className="relative isolate overflow-hidden border-t border-white/10 bg-night text-bone">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(40%_35%_at_90%_15%,rgb(111_93_242/0.08),transparent_70%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="px-6 py-24 lg:px-12 lg:py-36 xl:px-20">
        <Reveal>
          <p className="track-in font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
            <span className="text-iris">05</span> / Education / Archive
          </p>
        </Reveal>

        <Reveal delay={90}>
          <h2 id="education-title" className="mt-8 font-display text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[0.95] font-extrabold tracking-[-0.035em] text-bone">
            The academic <span className="text-iris">record.</span>
          </h2>
        </Reveal>

        {/* A fine rule drawn across the section */}
        <Reveal delay={180} className="rule-draw mt-10 lg:mt-14">
          <div aria-hidden="true" className="rule-line relative h-px bg-white/10">
            <span className="absolute inset-y-0 left-0 w-24 bg-iris" />
          </div>
        </Reveal>

        <div className="mt-12 lg:mt-16">{content}</div>
      </div>
    </section>
  )
}

export default Education
