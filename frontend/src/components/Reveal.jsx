import { useEffect, useRef, useState } from 'react'

// Fades and lifts its content into place the first time it scrolls into view. The
// hidden starting state only exists when motion is allowed (see .reveal in index.css),
// and browsers without IntersectionObserver simply show everything.
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
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
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

export default Reveal
