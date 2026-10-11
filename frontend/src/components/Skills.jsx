import { useEffect, useRef, useState } from 'react'
import { getSkills } from '../services/skills.service.js'
import Reveal from './Reveal.jsx'

// Brand logos live in src/assets/tech as <name>.svg (GitHub, Express and Django are
// recoloured for dark backgrounds). Vite hands back a URL for each one.
const logoFiles = import.meta.glob('../assets/tech/*.svg', { eager: true, query: '?url', import: 'default' })
const logos = Object.fromEntries(
  Object.entries(logoFiles).map(([path, url]) => [path.split('/').pop().replace('.svg', ''), url]),
)

// Different spellings of a skill that should show the same logo.
const aliases = {
  html: 'html5',
  css: 'css3',
  js: 'javascript',
  node: 'nodejs',
  expressjs: 'express',
  reactjs: 'react',
  postgres: 'postgresql',
  mongo: 'mongodb',
}

// Skills with no brand logo to borrow get a small sparkle mark instead.
const sparkleSkills = ['ai', 'genai', 'generativeai', 'artificialintelligence']

// "Node.JS" -> "nodejs", "Postgresql" -> "postgresql"
const keyFor = (text) => String(text ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

// The API returns a flat list: [{ name: 'React', category: 'frontend' }, ...]
// This groups it by category, in the order categories first appear. Categories that
// differ only by capital letters ("Programming Languages" / "Programming languages")
// are one group; it is titled after whichever spelling came first.
function groupByCategory(skills) {
  const groups = new Map()

  skills.forEach((skill) => {
    const title = skill.category?.trim() || 'Other'
    const key = title.toLowerCase()

    if (!groups.has(key)) {
      groups.set(key, { key, title, skills: [] })
    }

    groups.get(key).skills.push(skill)
  })

  return [...groups.values()]
}

function Sparkle() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="sparkle-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9c0ff" />
          <stop offset="1" stopColor="#6f5df2" />
        </linearGradient>
      </defs>
      <path
        fill="url(#sparkle-fill)"
        d="M26 6c1.6 11.7 6.3 16.4 18 18-11.7 1.6-16.4 6.3-18 18-1.6-11.7-6.3-16.4-18-18 11.7-1.6 16.4-6.3 18-18Zm20 28c.9 6.6 3.4 9.1 10 10-6.6.9-9.1 3.4-10 10-.9-6.6-3.4-9.1-10-10 6.6-.9 9.1-3.4 10-10Z"
      />
    </svg>
  )
}

// What goes inside a tile, and a copy of it used as the soft shadow beneath. The `icon`
// column on a skill, when someone fills it in, wins: a URL is shown as-is, anything else
// is looked up like a name.
function iconFor(skill) {
  const hint = skill.icon?.trim()

  if (hint && /^(https?:)?\/\/|^\//.test(hint)) {
    return { type: 'image', src: hint }
  }

  const key = keyFor(hint || skill.name)
  const logo = logos[aliases[key] ?? key]

  if (logo) {
    return { type: 'image', src: logo }
  }

  if (sparkleSkills.includes(key)) {
    return { type: 'sparkle' }
  }

  return { type: 'monogram', text: skill.name.trim().slice(0, 2).toUpperCase() }
}

// One glass tile. The outer box stays still and listens for the pointer; the card inside
// tilts a few degrees towards it, lifts, and a soft reflection follows the cursor. Touch
// input and reduced motion get the plain tile (no tilt).
function SkillTile({ skill }) {
  const tileRef = useRef(null)
  const cardRef = useRef(null)
  const [imageFailed, setImageFailed] = useState(false)
  const icon = imageFailed ? { type: 'monogram', text: skill.name.trim().slice(0, 2).toUpperCase() } : iconFor(skill)

  function handlePointerMove(event) {
    if (event.pointerType === 'touch') {
      return
    }

    const box = tileRef.current.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width // 0 .. 1
    const y = (event.clientY - box.top) / box.height
    const card = cardRef.current

    card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      card.style.setProperty('--ry', `${((x - 0.5) * 12).toFixed(2)}deg`)
      card.style.setProperty('--rx', `${((0.5 - y) * 10).toFixed(2)}deg`)
    }
  }

  function handlePointerLeave() {
    ;['--mx', '--my', '--ry', '--rx'].forEach((name) => cardRef.current.style.removeProperty(name))
  }

  const mark =
    icon.type === 'image' ? (
      <img src={icon.src} alt="" decoding="async" onError={() => setImageFailed(true)} className="h-full w-full object-contain" />
    ) : icon.type === 'sparkle' ? (
      <Sparkle />
    ) : (
      <span className="flex h-full w-full items-center justify-center rounded-xl border border-iris/40 font-display text-lg font-bold text-iris">
        {icon.text}
      </span>
    )

  return (
    <li
      ref={tileRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="skill-tile group [perspective:900px]"
    >
      <div
        ref={cardRef}
        className="skill-card relative flex h-36 flex-col items-center justify-center gap-4 rounded-[1.25rem] border border-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.13),0_16px_36px_-22px_rgb(0_0_0/0.9)] transition-[box-shadow,border-color] duration-300 [transform-style:preserve-3d] group-hover:border-iris/35 group-hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.18),inset_1px_0_0_rgb(168_153_255/0.22),0_34px_55px_-22px_rgb(0_0_0/0.95)] sm:h-40"
      >
        {/* The glass: smoked charcoal with a blur of whatever sits behind it */}
        <div aria-hidden="true" className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-black/20 backdrop-blur-md" />
        {/* A faint fixed sheen across the top-left, as light on a pane */}
        <div aria-hidden="true" className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgb(255_255_255/0.07),transparent_38%)]" />
        {/* The reflection that follows the pointer (hover devices only) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(170px_circle_at_var(--mx,50%)_var(--my,0%),rgb(168_153_255/0.17),transparent_65%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* The icon stands off the glass: a soft shadow on the pane, the logo in front of it */}
        <div className="skill-icon relative h-12 w-12 [transform-style:preserve-3d] sm:h-14 sm:w-14">
          <div
            aria-hidden="true"
            className="skill-icon-shadow absolute inset-0 opacity-50 blur-[7px] brightness-0"
          >
            {mark}
          </div>
          <div className="relative h-full w-full [filter:drop-shadow(0_-1px_0_rgb(255_255_255/0.2))_drop-shadow(0_8px_9px_rgb(0_0_0/0.5))]">{mark}</div>
        </div>

        <span className="relative font-ui text-sm font-medium text-bone/85 [transform:translateZ(12px)]">{skill.name}</span>
      </div>
    </li>
  )
}

// "02 / Skills": the section heading, then one row per category, each a grid of glass tiles.
function Skills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadSkills() {
      try {
        const data = await getSkills()
        setSkills(data)
      } catch (err) {
        console.error(err)
        setError('Could not load skills. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadSkills()
  }, [])

  // The section and heading always render, so the #skills link works
  // even while loading. Only the content below the heading changes.
  let content

  if (loading) {
    content = (
      <div>
        <p role="status" className="font-label text-xs tracking-[0.14em] text-ash uppercase">
          Loading skills…
        </p>
        <ul aria-hidden="true" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <li key={index} className="h-36 rounded-[1.25rem] border border-white/[0.07] bg-white/[0.02] sm:h-40" />
          ))}
        </ul>
      </div>
    )
  } else if (error) {
    content = (
      <p role="alert" className="font-ui text-base text-ash">
        {error}
      </p>
    )
  } else if (skills.length === 0) {
    content = <p className="font-ui text-base text-ash">No skills added yet.</p>
  } else {
    content = (
      <div className="space-y-14 lg:space-y-16">
        {groupByCategory(skills).map((category, index) => (
          <Reveal key={category.key} as="section" delay={index === 0 ? 0 : 60} aria-label={category.title} className="grid gap-5 lg:grid-cols-12 lg:gap-8">
            <h3 className="flex items-center gap-4 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs lg:col-span-3 lg:pt-3">
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-iris" />
              {category.title}
            </h3>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-9 xl:grid-cols-4">
              {category.skills.map((skill) => (
                <SkillTile key={skill.id ?? skill.name} skill={skill} />
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    )
  }

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="relative isolate overflow-hidden border-t border-white/10 bg-night text-bone"
    >
      {/* Barely-there violet atmosphere (something for the glass to blur) and film grain */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_88%_12%,rgb(111_93_242/0.13),transparent_70%),radial-gradient(40%_38%_at_6%_78%,rgb(111_93_242/0.09),transparent_72%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="px-6 py-24 lg:px-12 lg:py-36 xl:px-20">
        <Reveal>
          <p className="flex items-center gap-4 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
            <span className="text-iris">02</span>
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-iris" />
            Skills
          </p>
        </Reveal>

        <Reveal delay={90}>
          <h2
            id="skills-title"
            className="mt-8 font-display text-[clamp(2.5rem,5.6vw,4.5rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-bone"
          >
            Skills &amp; <span className="text-iris">Technologies</span>
          </h2>
        </Reveal>

        <div className="mt-14 lg:mt-20">{content}</div>
      </div>
    </section>
  )
}

export default Skills
