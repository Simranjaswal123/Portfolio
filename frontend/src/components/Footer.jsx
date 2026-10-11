import { useEffect, useState } from 'react'
import { getProfile } from '../services/profile.service.js'

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-iris'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

// A light closing line: wordmark, copyright, a short phrase, a few section links and
// "Back to top".
function Footer() {
  const [name, setName] = useState(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile()
        setName(profile?.name?.trim() || null)
      } catch (err) {
        console.error(err) // the footer still shows, just without the name
      }
    }

    loadProfile()
  }, [])

  // Scrolls to the very top, then puts keyboard focus on the wordmark in the navbar so
  // keyboard users continue from the top as well.
  function backToTop() {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' })
    document.querySelector('header a[href="#top"]')?.focus({ preventScroll: true })
  }

  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-night text-bone">
      <div className="flex flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6">
          <a href="#top" className={`font-display text-xl font-bold tracking-tight text-bone ${focusRing}`}>
            Simran
          </a>
          <p className="font-ui text-sm text-ash">
            © {year}
            {name ? ` ${name}` : ''}. Designed and built with intention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={`font-ui text-sm text-ash transition-colors duration-200 hover:text-bone ${focusRing}`}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={backToTop}
            className={`group/top inline-flex items-center gap-2.5 font-label text-xs tracking-[0.14em] text-bone uppercase transition-colors duration-200 hover:text-iris ${focusRing}`}
          >
            Back to top
            <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full border border-white/15 transition-[border-color,translate] duration-300 group-hover/top:border-iris/60 motion-safe:group-hover/top:-translate-y-0.5">
              ↑
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
