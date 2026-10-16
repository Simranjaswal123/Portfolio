import { useId, useRef, useSyncExternalStore } from 'react'
import { getTheme, setTheme, subscribe } from '../theme.js'

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-iris'

// The light/dark switch: an eclipse. In the dark theme it is a crescent moon; switching
// slides the moon's shadow away, the disc tightens into a sun and its rays swing in
// (all CSS, see .theme-toggle in index.css). The new theme then spreads across the page
// in a circle that grows out of the button, where the browser supports it.
function ThemeToggle({ className = '' }) {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'dark')
  const buttonRef = useRef(null)
  const maskId = useId()
  const next = theme === 'dark' ? 'light' : 'dark'

  function handleClick() {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!document.startViewTransition || calm) {
      setTheme(next)
      return
    }

    // The circle starts at the button's centre and grows until it covers the page.
    const box = buttonRef.current.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    const transition = document.startViewTransition(() => setTheme(next))
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
        )
      })
      .catch(() => {}) // the switch still happened; only the animation was skipped
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`theme-toggle group flex size-10 items-center justify-center rounded-full border border-white/15 text-bone transition-colors duration-300 hover:border-iris/60 hover:text-iris ${focusRing} ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-5 transition-transform duration-500 group-hover:rotate-12" aria-hidden="true">
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          {/* The moon's shadow: a dark disc biting into the top right */}
          <circle className="toggle-bite" cx="17" cy="7" r="7.5" fill="black" />
        </mask>
        <circle className="toggle-core" cx="12" cy="12" r="8.5" fill="currentColor" mask={`url(#${maskId})`} />
        <g className="toggle-rays" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line key={angle} x1="12" y1="1.6" x2="12" y2="3.6" transform={`rotate(${angle} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  )
}

export default ThemeToggle
