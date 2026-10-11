import { useEffect, useRef, useState } from 'react'
import { createContactMessage } from '../services/contact.service.js'
import { getProfile } from '../services/profile.service.js'
import Reveal from './Reveal.jsx'

const emptyForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

const focusRing = 'focus:outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-iris'

// Dark, underlined fields for the message form.
const inputClasses =
  'mt-2 w-full border-0 border-b border-white/15 bg-transparent px-0 py-2.5 font-ui text-base text-bone placeholder:text-ash/50 transition-colors duration-200 hover:border-white/30 focus:border-iris focus:ring-0 focus:outline-none'
const labelClasses = 'block font-label text-[0.65rem] tracking-[0.2em] text-ash uppercase'

// Only ever link to http(s) addresses.
function safeUrl(url) {
  try {
    const parsed = new URL(String(url).trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null
  } catch {
    return null
  }
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  )
}

// Copies text with the Clipboard API, falling back to the older copy command when the
// API is missing or refuses (for example on an insecure page or without focus).
async function copyText(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // fall through to the fallback below
    }
  }

  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  const copied = document.execCommand('copy')
  field.remove()

  if (!copied) {
    throw new Error('Copy was blocked')
  }
}

// A round mailto button that leans a few pixels towards the pointer on desktop.
// Touch screens and reduced motion get it standing still.
function MagneticLink({ href, label }) {
  const zoneRef = useRef(null)
  const linkRef = useRef(null)

  useEffect(() => {
    const zone = zoneRef.current
    const link = linkRef.current
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!zone || !link || !finePointer || calm) {
      return
    }

    let frame = 0

    function handleMove(event) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = zone.getBoundingClientRect()
        const x = (event.clientX - (box.left + box.width / 2)) / (box.width / 2) // -1 .. 1
        const y = (event.clientY - (box.top + box.height / 2)) / (box.height / 2)
        link.style.translate = `${(x * 8).toFixed(1)}px ${(y * 8).toFixed(1)}px`
      })
    }

    function handleLeave() {
      cancelAnimationFrame(frame)
      link.style.translate = ''
    }

    zone.addEventListener('pointermove', handleMove)
    zone.addEventListener('pointerleave', handleLeave)
    return () => {
      cancelAnimationFrame(frame)
      zone.removeEventListener('pointermove', handleMove)
      zone.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  return (
    <div ref={zoneRef} className="-m-5 shrink-0 p-5">
      <a
        ref={linkRef}
        href={href}
        className={`magnetic group/cta flex size-16 items-center justify-center rounded-full bg-bone text-night transition-colors duration-300 hover:bg-iris sm:size-20 ${focusRing}`}
      >
        <span className="sr-only">{label}</span>
        <svg viewBox="0 0 24 24" className="size-6 transition-transform duration-300 group-hover/cta:rotate-45 sm:size-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M8 7h9v9" />
        </svg>
      </a>
    </div>
  )
}

// "06 / Let's connect": the closing headline, a direct line (email + copy), social
// links from the profile, and the original message form.
function Contact() {
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState(false)
  const [copyState, setCopyState] = useState(null) // null | 'copied' | 'failed'
  const copyTimer = useRef(0)

  // All four form values live in one state object.
  const [formData, setFormData] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  // Runs once, when the component first appears on the page.
  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(await getProfile())
      } catch (err) {
        console.error(err)
        setProfileError(true)
      }
    }

    loadProfile()
    return () => clearTimeout(copyTimer.current)
  }, [])

  const email = profile?.email?.trim() || null
  const socials = [
    { label: 'GitHub', href: profile?.github_url ? safeUrl(profile.github_url) : null, Icon: GitHubIcon },
    { label: 'LinkedIn', href: profile?.linkedin_url ? safeUrl(profile.linkedin_url) : null, Icon: LinkedInIcon },
  ].filter((social) => social.href)

  async function handleCopy() {
    clearTimeout(copyTimer.current)

    try {
      await copyText(email)
      setCopyState('copied')
    } catch (err) {
      console.error(err)
      setCopyState('failed')
    }

    copyTimer.current = setTimeout(() => setCopyState(null), 2600)
  }

  // Runs on every keystroke. The input's "name" tells us which field to update.
  function handleChange(event) {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page

    // Start fresh: hide any message from a previous attempt.
    setSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      await createContactMessage(formData)
      setSuccessMessage("Thank you! Your message has been sent. I'll get back to you soon.")
      setFormData(emptyForm) // clear the form only after a successful send
    } catch (err) {
      console.error(err)
      // The form data is kept, so the visitor can try again without retyping.
      setErrorMessage('Sorry, your message could not be sent. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative isolate overflow-hidden border-t border-white/10 bg-night text-bone">
      {/* A faint violet light behind the headline, a fine ring drawn off the edge, and grain */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(45%_40%_at_22%_22%,rgb(111_93_242/0.12),transparent_72%)]" />
        <div className="absolute -top-[22vw] -right-[18vw] size-[62vw] max-h-[60rem] max-w-[60rem] rounded-full border border-white/[0.05]" />
        <div className="absolute -top-[14vw] -right-[10vw] size-[46vw] max-h-[44rem] max-w-[44rem] rounded-full border border-white/[0.035]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="px-6 pt-28 pb-24 lg:px-12 lg:pt-40 lg:pb-32 xl:px-20">
        <Reveal>
          <p className="flex items-center gap-4 font-label text-[0.68rem] tracking-[0.22em] text-ash uppercase sm:text-xs">
            <span className="text-iris">06</span>{' '}
            <span aria-hidden="true" className="h-px w-10 shrink-0 bg-iris" />
            Let’s connect
          </p>
        </Reveal>

        {/* The headline, each line rising out of its own mask */}
        <h2 id="contact-title" className="mt-10 font-display text-[clamp(3rem,10vw,9.5rem)] leading-[0.9] font-extrabold tracking-[-0.045em] text-bone">
          <Reveal as="span" delay={60} className="line-mask block overflow-hidden pb-[0.08em]">
            <span className="line-inner block">Have a good idea?</span>
          </Reveal>
          <Reveal as="span" delay={160} className="line-mask block overflow-hidden pb-[0.08em]">
            <span className="line-inner block">
              Let’s <span className="text-iris">build</span> it.
            </span>
          </Reveal>
        </h2>

        <Reveal delay={260}>
          <p className="mt-10 max-w-xl font-ui text-lg leading-relaxed text-bone/70 sm:text-xl">
            Whether it’s software engineering, full-stack work, a collaboration or an interesting opportunity, I’d be glad to hear from you.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-16 lg:mt-24 lg:grid-cols-12 lg:gap-12">
          {/* ---- Direct line and socials ---- */}
          <div className="min-w-0 lg:col-span-7">
            <Reveal delay={0}>
              <p className="font-label text-[0.65rem] tracking-[0.2em] text-ash uppercase">Direct line</p>

              {email ? (
                <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-6">
                  <a
                    href={`mailto:${email}`}
                    className={`group/mail relative min-w-0 font-display text-[clamp(1.35rem,4.2vw,3rem)] leading-tight font-bold tracking-[-0.025em] break-all text-bone transition-colors duration-300 hover:text-iris sm:break-normal ${focusRing}`}
                  >
                    {email}
                    {/* A hairline that turns violet and draws across on interaction */}
                    <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-px bg-white/20" />
                    <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-iris transition-transform duration-500 group-hover/mail:scale-x-100 group-focus-visible/mail:scale-x-100" />
                  </a>
                  <MagneticLink href={`mailto:${email}`} label={`Email ${email}`} />
                </div>
              ) : (
                <p className="mt-5 font-ui text-base text-ash">
                  {profileError ? 'The email address could not be loaded. Please use the form.' : 'Loading…'}
                </p>
              )}

              {email && (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2.5 font-ui text-sm font-medium text-bone/85 transition-colors duration-200 hover:border-iris/60 hover:text-iris ${focusRing}`}
                  >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {copyState === 'copied' ? (
                        <path d="m5 12 4.5 4.5L19 7" />
                      ) : (
                        <>
                          <rect x="9" y="9" width="11" height="11" rx="2" />
                          <path d="M5 15V6a2 2 0 0 1 2-2h8" />
                        </>
                      )}
                    </svg>
                    Copy email
                  </button>
                  <p role="status" aria-live="polite" className={`font-label text-xs tracking-[0.12em] uppercase ${copyState === 'failed' ? 'text-ash' : 'text-iris'}`}>
                    {copyState === 'copied' && 'Email copied!'}
                    {copyState === 'failed' && 'Could not copy. Please select the address instead.'}
                  </p>
                </div>
              )}
            </Reveal>

            {socials.length > 0 && (
              <Reveal delay={120} className="mt-14">
                <p className="font-label text-[0.65rem] tracking-[0.2em] text-ash uppercase">Elsewhere</p>
                <ul className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
                  {socials.map(({ label, href, Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group/social inline-flex items-center gap-3 py-1 font-ui text-base font-medium text-bone/85 transition-[color,translate] duration-300 hover:text-bone motion-safe:hover:-translate-y-0.5 ${focusRing}`}
                      >
                        <span className="text-ash transition-colors duration-300 group-hover/social:text-iris">
                          <Icon />
                        </span>
                        <span className="relative">
                          {label}
                          <span aria-hidden="true" className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-iris transition-transform duration-300 group-hover/social:scale-x-100" />
                        </span>
                        <span aria-hidden="true" className="text-sm text-ash transition-transform duration-300 group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5">
                          ↗
                        </span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* ---- Or a message through the site (the existing contact form) ---- */}
          <Reveal delay={180} className="min-w-0 lg:col-span-5">
            <form onSubmit={handleSubmit} aria-labelledby="contact-form-title" className="border-t border-white/10 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
              <p id="contact-form-title" className="font-label text-[0.65rem] tracking-[0.2em] text-ash uppercase">
                Or leave a message
              </p>

              <div className="mt-6 grid gap-7 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClasses}>
                    Name
                  </label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required autoComplete="name" className={inputClasses} />
                </div>
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    Email
                  </label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="email" className={inputClasses} />
                </div>
              </div>

              <div className="mt-7">
                <label htmlFor="subject" className={labelClasses}>
                  Subject
                </label>
                <input id="subject" name="subject" type="text" value={formData.subject} onChange={handleChange} required className={inputClasses} />
              </div>

              <div className="mt-7">
                <label htmlFor="message" className={labelClasses}>
                  Message
                </label>
                <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange} required className={`${inputClasses} resize-y`} />
              </div>

              {successMessage && (
                <p role="status" className="mt-6 font-ui text-sm text-iris">
                  {successMessage}
                </p>
              )}

              {errorMessage && (
                <p role="alert" className="mt-6 font-ui text-sm text-bone">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`mt-8 inline-flex items-center gap-3 rounded-full bg-bone px-7 py-3.5 font-ui text-sm font-semibold text-night transition-colors duration-300 hover:bg-iris disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
              >
                {submitting ? 'Sending…' : 'Send message'} <span aria-hidden="true">→</span>
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default Contact
