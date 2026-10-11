import { useEffect, useRef, useState } from 'react'
import {
  ACCEPT_IMAGES,
  MAX_GALLERY_IMAGES,
  MAX_IMAGE_MB,
  formatSize,
  validateImageFile,
} from '../../../lib/imageRules.js'
import ProgressBar from './ProgressBar.jsx'

// A set of images the admin can add to, remove from and put in order
// (project screenshots, experience photos).
//
//   images     the saved images, in order: [{ id, image_url, alt_text }]
//   onUpload   (file, onProgress) => Promise<image>   saves one image, returns its row
//   onDelete   (imageId) => Promise                   deletes one image
//   onReorder  (ids) => Promise                       saves a new order
//   onChanged  (images) => void                       told the new list after every change
//
// Chosen files are previewed first. Nothing is saved until "Upload" is pressed.
// Each file is uploaded on its own, so one failure never loses the others.
function GalleryField({ label, images, onUpload, onDelete, onReorder, onChanged }) {
  const [pending, setPending] = useState([]) // [{ key, file, preview, error }]
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(null)
  const [message, setMessage] = useState(null) // { kind: 'success' | 'error', text }
  const latest = useRef(pending)
  latest.current = pending

  // Free the temporary previews when the field goes away.
  useEffect(() => () => latest.current.forEach((item) => URL.revokeObjectURL(item.preview)), [])

  const room = MAX_GALLERY_IMAGES - images.length - pending.length

  function handleChoose(event) {
    const files = [...event.target.files]
    event.target.value = ''
    setMessage(null)

    const problems = []
    const accepted = []

    for (const file of files) {
      const problem = validateImageFile(file)

      if (problem) {
        problems.push(problem)
      } else if (accepted.length >= room) {
        problems.push(`"${file.name}" was skipped: at most ${MAX_GALLERY_IMAGES} images are allowed.`)
      } else {
        accepted.push({ key: `${file.name}-${file.size}-${Math.random()}`, file, preview: URL.createObjectURL(file), error: null })
      }
    }

    setPending((current) => [...current, ...accepted])

    if (problems.length > 0) {
      setMessage({ kind: 'error', text: problems.join(' ') })
    }
  }

  function discard(key) {
    setPending((current) => {
      const item = current.find((entry) => entry.key === key)
      if (item) URL.revokeObjectURL(item.preview)
      return current.filter((entry) => entry.key !== key)
    })
  }

  async function handleUploadAll() {
    setBusy(true)
    setMessage(null)

    const queue = [...pending]
    let saved = [...images]
    let failed = 0

    for (const [index, item] of queue.entries()) {
      try {
        const row = await onUpload(item.file, (percent) => setProgress(Math.round(((index + percent / 100) / queue.length) * 100)))
        saved = [...saved, row]
        onChanged(saved)
        discard(item.key)
      } catch (err) {
        console.error(err)
        failed += 1
        setPending((current) => current.map((entry) => (entry.key === item.key ? { ...entry, error: err.message } : entry)))
      }
    }

    setBusy(false)
    setProgress(null)

    if (failed === 0) {
      setMessage({ kind: 'success', text: queue.length === 1 ? 'Image saved.' : `${queue.length} images saved.` })
    } else {
      setMessage({ kind: 'error', text: `${failed} of ${queue.length} could not be uploaded. They are still listed below so you can try again.` })
    }
  }

  async function handleDelete(image) {
    if (!window.confirm('Delete this image? This cannot be undone.')) {
      return
    }

    setBusy(true)
    setMessage(null)

    try {
      await onDelete(image.id)
      onChanged(images.filter((item) => item.id !== image.id))
      setMessage({ kind: 'success', text: 'Image deleted.' })
    } catch (err) {
      console.error(err)
      setMessage({ kind: 'error', text: 'Could not delete the image. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  async function handleMove(index, direction) {
    const target = index + direction

    if (target < 0 || target >= images.length) {
      return
    }

    const reordered = [...images]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]

    setBusy(true)
    setMessage(null)

    try {
      await onReorder(reordered.map((image) => image.id))
      onChanged(reordered)
    } catch (err) {
      console.error(err)
      setMessage({ kind: 'error', text: 'Could not change the order. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const inputId = `${label.replace(/\s+/g, '-').toLowerCase()}-files`

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700">
        {label} <span className="font-normal text-gray-500">({images.length} of {MAX_GALLERY_IMAGES})</span>
      </p>

      {/* Saved images */}
      {images.length > 0 && (
        <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <li key={image.id} className="rounded-lg border border-gray-200 bg-white p-2">
              <img
                src={image.image_url}
                alt={image.alt_text || ''}
                loading="lazy"
                className="aspect-[4/3] w-full rounded object-cover bg-gray-100"
              />
              <div className="mt-2 flex items-center justify-between gap-1">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={busy || index === 0}
                    aria-label={`Move image ${index + 1} earlier`}
                    className="rounded border border-gray-300 px-1.5 text-xs hover:bg-gray-100 disabled:opacity-40"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={busy || index === images.length - 1}
                    aria-label={`Move image ${index + 1} later`}
                    className="rounded border border-gray-300 px-1.5 text-xs hover:bg-gray-100 disabled:opacity-40"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    disabled={busy}
                    aria-label={`Delete image ${index + 1}`}
                    className="rounded border border-red-300 px-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Chosen, not yet saved */}
      {pending.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600">Ready to upload ({pending.length})</p>
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {pending.map((item) => (
              <li key={item.key} className="rounded-lg border-2 border-dashed border-gray-300 p-2">
                <img src={item.preview} alt={`Preview of ${item.file.name}`} className="aspect-[4/3] w-full rounded object-cover" />
                <p className="mt-1 truncate text-xs text-gray-600" title={item.file.name}>
                  {item.file.name} · {formatSize(item.file.size)}
                </p>
                {item.error && <p role="alert" className="mt-1 text-xs text-red-600">{item.error}</p>}
                <button
                  type="button"
                  onClick={() => discard(item.key)}
                  disabled={busy}
                  className="mt-1 text-xs font-medium text-gray-700 underline disabled:opacity-40"
                >
                  Discard
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input id={inputId} type="file" accept={ACCEPT_IMAGES} multiple onChange={handleChoose} disabled={busy || room <= 0} className="sr-only" />
        <label
          htmlFor={inputId}
          className={`cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-gray-900 ${busy || room <= 0 ? 'pointer-events-none opacity-60' : ''}`}
        >
          Choose images
        </label>
        {pending.length > 0 && (
          <button
            type="button"
            onClick={handleUploadAll}
            disabled={busy}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Uploading...' : `Upload ${pending.length} ${pending.length === 1 ? 'image' : 'images'}`}
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        JPEG, PNG or WebP, up to {MAX_IMAGE_MB} MB each. You can pick several at once.
      </p>

      {progress !== null && <ProgressBar value={progress} label={`Uploading ${label.toLowerCase()}`} className="mt-2" />}

      {message && (
        <p role={message.kind === 'error' ? 'alert' : 'status'} className={`mt-2 text-sm font-medium ${message.kind === 'error' ? 'text-red-600' : 'text-green-700'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

export default GalleryField
