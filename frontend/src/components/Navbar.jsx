import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// Each link points to a section on the same page via its id (e.g. #about).
const links = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Contact', href: '#contact' },
]

const sectionIds = links.map((link) => link.href.slice(1))

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-iris'

// A quiet header that sits on the dark hero without a box of its own. Once the page
// scrolls, it gains a dark, slightly see-through background so it stays readable over
// the lighter sections below.
//   wide screens: wordmark on the left, links on the right, Admin as a muted extra
//   small screens: wordmark and a Menu button that opens a panel below the bar
function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(null) // id of the section currently on screen
  const menuButtonRef = useRef(null)

  // Scroll-spy, and the "has the page scrolled" flag.
  useEffect(() => {
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) setActive(entry.target.id)
              }
            },
            { rootMargin: '-45% 0px -50% 0px' }, // a thin band across the middle of the screen
          )
        : null

    sections.forEach((section) => observer?.observe(section))

    function handleScroll() {
      setScrolled(window.scrollY > 24)
      if (window.scrollY < 200) setActive(null) // back at the hero: nothing is current
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Escape closes the menu and hands focus back to its button.
  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // The menu is the small-screen layout; close it if the window grows wide.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)')

    function handleChange(event) {
      if (event.matches) setOpen(false)
    }

    wide.addEventListener('change', handleChange)
    return () => wide.removeEventListener('change', handleChange)
  }, [])

  const solid = scrolled || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 ${
        solid ? 'border-white/10 bg-night/85 backdrop-blur-md' : 'border-transparent bg-transparent'
      }`}
    >
      <nav aria-label="Primary" className="flex h-16 items-center justify-between px-6 lg:px-12 xl:px-20">
        <a href="#top" className={`font-display text-xl font-bold tracking-tight text-bone ${focusRing}`}>
          Simran
        </a>

        {/* Wide screens */}
        <div className="hidden items-center lg:flex">
          <ul className="flex items-center gap-9">
            {links.map((link) => {
              const isActive = active === link.href.slice(1)
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? 'location' : undefined}
                    className={`group relative block py-1 font-ui text-sm font-medium transition-colors duration-200 ${focusRing} ${
                      isActive ? 'text-iris' : 'text-bone/70 hover:text-iris'
                    }`}
                  >
                    {link.label}
                    {/* The underline shows the current section (a shape, not only a colour) */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-iris transition-transform duration-300 ${
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </a>
                </li>
              )
            })}
          </ul>

          {/* A route of its own (not a section), so it uses React Router's Link. Kept quiet on purpose. */}
          <Link
            to="/admin/login"
            className={`ml-9 border-l border-white/15 pl-9 font-ui text-xs tracking-wide text-ash transition-colors duration-200 hover:text-bone ${focusRing}`}
          >
            Admin
          </Link>
        </div>

        {/* Small screens */}
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((isOpen) => !isOpen)}
          className={`flex items-center gap-3 py-2 font-label text-xs tracking-[0.14em] text-bone uppercase lg:hidden ${focusRing}`}
        >
          {open ? 'Close' : 'Menu'}
          <span aria-hidden="true" className="flex w-5 flex-col items-end gap-[5px]">
            <span className={`block h-px bg-current transition-all duration-300 ${open ? 'w-5 translate-y-[3px] rotate-45' : 'w-5'}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${open ? 'w-5 -translate-y-[3px] -rotate-45' : 'w-3'}`} />
          </span>
        </button>
      </nav>

      {/* The menu panel is only on the page while open, so a closed menu can never be tabbed into. */}
      {open && (
        <div id="mobile-menu" className="border-t border-white/10 px-6 pt-4 pb-8 lg:hidden">
          <ul>
            {links.map((link) => {
              const isActive = active === link.href.slice(1)
              return (
                <li key={link.href} className="border-b border-white/10">
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`flex items-center justify-between py-4 font-display text-2xl font-bold tracking-tight ${focusRing} ${
                      isActive ? 'text-iris' : 'text-bone'
                    }`}
                  >
                    {link.label}
                    {isActive && <span aria-hidden="true" className="size-1.5 rounded-full bg-iris" />}
                  </a>
                </li>
              )
            })}
          </ul>
          <Link
            to="/admin/login"
            onClick={() => setOpen(false)}
            className={`mt-6 inline-block font-ui text-sm text-ash hover:text-bone ${focusRing}`}
          >
            Admin
          </Link>
        </div>
      )}
    </header>
  )
}

export default Navbar
