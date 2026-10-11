import { useState } from 'react'

// A responsive set of thumbnails. Each one opens the full-size image in a new tab.
//
//   images   [{ id, image_url, alt_text }], already in display order
//   label    what to call the gallery for screen readers, e.g. "Screenshots of RecallPal"
//
// Images are cropped to a 4:3 frame (never stretched), load lazily, and a picture
// that fails to load is simply left out, so there is never a broken-image icon.
function ImageGallery({ images, label }) {
  const [failed, setFailed] = useState(() => new Set())
  const visible = (images ?? []).filter((image) => image.image_url && !failed.has(image.id))

  if (visible.length === 0) {
    return null
  }

  return (
    <ul aria-label={label} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {visible.map((image) => (
        <li key={image.id}>
          <a
            href={image.image_url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-lg border border-gray-200 bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
          >
            <img
              src={image.image_url}
              alt={image.alt_text || ''}
              loading="lazy"
              decoding="async"
              onError={() => setFailed((current) => new Set(current).add(image.id))}
              className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
            />
            <span className="sr-only"> (opens the full image in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default ImageGallery
