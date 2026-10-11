import { useEffect, useRef, useState } from 'react'
import { ACCEPT_IMAGES, MAX_IMAGE_MB, formatSize, validateImageFile } from '../../../lib/imageRules.js'
import ProgressBar from './ProgressBar.jsx'

// One image that can be uploaded, replaced and removed (a profile photo, a cover image).
//
//   imageUrl   the image saved right now (or null)
//   alt        description for the saved image
//   onUpload   (file, onProgress) => Promise<result>    saves a new image
//   onRemove   () => Promise<result>                    removes the image
//   onChanged  (result) => void                         told after either succeeded
//
// Choosing a file shows a preview first. Nothing is saved until "Upload image" is pressed.
function SingleImageField({ label, imageUrl, alt, onUpload, onRemove, onChanged }) {
  const inputRef = useRef(null)
  const [pending, setPending] = useState(null) // the chosen file, not yet saved
  const [preview, setPreview] = useState(null) // a temporary local URL to show it
  const [progress, setProgress] = useState(null) // 0-100 while uploading
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null) // { kind: 'success' | 'error', text }
  const [broken, setBroken] = useState(false) // the saved image could not be loaded

  // Make (and later free) the temporary preview URL for the chosen file.
  useEffect(() => {
    if (!pending) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(pending)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [pending])

  // A new saved image gets a fresh chance to load.
  useEffect(() => {
    setBroken(false)
  }, [imageUrl])

  function handleChoose(event) {
    const file = event.target.files[0]
    event.target.value = '' // so choosing the same file again still fires
    setMessage(null)

    if (!file) {
      return
    }

    const problem = validateImageFile(file)

    if (problem) {
      setPending(null)
      setMessage({ kind: 'error', text: problem })
      return
    }

    setPending(file)
  }

  async function handleUpload() {
    setBusy(true)
    setProgress(0)
    setMessage(null)

    try {
      const result = await onUpload(pending, setProgress)
      setPending(null)
      setMessage({ kind: 'success', text: 'Image saved.' })
      onChanged?.(result)
    } catch (err) {
      console.error(err)
      setMessage({ kind: 'error', text: err.message || 'Upload failed. Please try again.' })
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  async function handleRemove() {
    if (!window.confirm(`Remove the ${label.toLowerCase()}? This cannot be undone.`)) {
      return
    }

    setBusy(true)
    setMessage(null)

    try {
      const result = await onRemove()
      setMessage({ kind: 'success', text: 'Image removed.' })
      onChanged?.(result)
    } catch (err) {
      console.error(err)
      setMessage({ kind: 'error', text: 'Could not remove the image. Please try again.' })
    } finally {
      setBusy(false)
    }
  }

  const inputId = `${label.replace(/\s+/g, '-').toLowerCase()}-file`

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700">{label}</p>

      <div className="mt-2 flex flex-wrap items-start gap-4">
        {/* The saved image */}
        <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 text-center text-xs text-gray-500">
          {imageUrl && !broken ? (
            <img src={imageUrl} alt={alt} onError={() => setBroken(true)} className="h-full w-full object-cover" />
          ) : (
            <span className="px-2">{imageUrl ? 'Image could not be loaded' : 'No image yet'}</span>
          )}
        </div>

        {/* The chosen file, shown before anything is saved */}
        {pending && preview && (
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-12 text-gray-400">→</span>
            <figure>
              <img src={preview} alt="Preview of the chosen file" className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-400 object-cover" />
              <figcaption className="mt-1 max-w-32 truncate text-xs text-gray-600" title={pending.name}>
                {pending.name} · {formatSize(pending.size)}
              </figcaption>
            </figure>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT_IMAGES}
          onChange={handleChoose}
          disabled={busy}
          className="sr-only"
        />
        <label
          htmlFor={inputId}
          className={`cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-gray-900 ${busy ? 'pointer-events-none opacity-60' : ''}`}
        >
          {imageUrl ? 'Choose a replacement' : 'Choose an image'}
        </label>

        {pending && (
          <>
            <button
              type="button"
              onClick={handleUpload}
              disabled={busy}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Uploading...' : 'Upload image'}
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              disabled={busy}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-60"
            >
              Cancel
            </button>
          </>
        )}

        {imageUrl && !pending && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Remove
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500">JPEG, PNG or WebP, up to {MAX_IMAGE_MB} MB.</p>

      {progress !== null && <ProgressBar value={progress} label={`Uploading ${label.toLowerCase()}`} className="mt-2" />}

      {message && (
        <p role={message.kind === 'error' ? 'alert' : 'status'} className={`mt-2 text-sm font-medium ${message.kind === 'error' ? 'text-red-600' : 'text-green-700'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}

export default SingleImageField
