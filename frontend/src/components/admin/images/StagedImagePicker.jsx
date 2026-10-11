import { useEffect, useRef, useState } from 'react'
import {
  ACCEPT_IMAGES,
  MAX_GALLERY_IMAGES,
  MAX_IMAGE_MB,
  formatSize,
  validateImageFile,
} from '../../../lib/imageRules.js'

// Lets the admin choose image files BEFORE the item exists (in the Add forms).
// Nothing is uploaded here: the chosen files are handed to the form, which uploads
// them right after the item is created.
//
//   files      the chosen files (an array of File), owned by the form
//   onChange   (files) => void
//   multiple   false = at most one image (a cover); true = up to MAX_GALLERY_IMAGES
//   disabled   true while the form is saving
function StagedImagePicker({ id, label, hint, files, onChange, multiple = false, disabled = false }) {
  const [message, setMessage] = useState(null)
  const [previews, setPreviews] = useState([]) // [{ file, url }]
  const urls = useRef([])

  // Keep one temporary preview URL per chosen file; free the ones no longer needed.
  useEffect(() => {
    urls.current.forEach((url) => URL.revokeObjectURL(url))
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    urls.current = next.map((item) => item.url)
    setPreviews(next)
  }, [files])

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  const limit = multiple ? MAX_GALLERY_IMAGES : 1

  function handleChoose(event) {
    const chosen = [...event.target.files]
    event.target.value = '' // so choosing the same file again still fires
    setMessage(null)

    const problems = []
    const accepted = []

    for (const file of chosen) {
      const problem = validateImageFile(file)

      if (problem) {
        problems.push(problem)
      } else if (!multiple) {
        accepted.splice(0, accepted.length, file) // a single image: the last one chosen wins
      } else if (files.length + accepted.length >= limit) {
        problems.push(`"${file.name}" was skipped: at most ${limit} images are allowed.`)
      } else {
        accepted.push(file)
      }
    }

    if (accepted.length > 0) {
      onChange(multiple ? [...files, ...accepted] : accepted)
    }

    if (problems.length > 0) {
      setMessage(problems.join(' '))
    }
  }

  function handleRemove(index) {
    onChange(files.filter((_, position) => position !== index))
  }

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700">
        {label} <span className="font-normal text-gray-500">(optional)</span>
      </p>

      {previews.length > 0 && (
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {previews.map(({ file, url }, index) => (
            <li key={url} className="rounded-lg border-2 border-dashed border-gray-300 p-2">
              <img src={url} alt={`Preview of ${file.name}`} className="aspect-[4/3] w-full rounded object-cover" />
              <p className="mt-1 truncate text-xs text-gray-600" title={file.name}>
                {file.name} · {formatSize(file.size)}
              </p>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
                className="mt-1 text-xs font-medium text-gray-700 underline disabled:opacity-40"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2">
        <input
          id={id}
          type="file"
          accept={ACCEPT_IMAGES}
          multiple={multiple}
          onChange={handleChoose}
          disabled={disabled || (multiple && files.length >= limit)}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={`inline-block cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-gray-900 ${
            disabled ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {multiple ? 'Choose images' : files.length > 0 ? 'Choose a different image' : 'Choose an image'}
        </label>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {hint} JPEG, PNG or WebP, up to {MAX_IMAGE_MB} MB{multiple ? ' each' : ''}.
      </p>

      {message && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-600">
          {message}
        </p>
      )}
    </div>
  )
}

export default StagedImagePicker
