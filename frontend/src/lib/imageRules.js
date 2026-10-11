// Checks run in the browser BEFORE an upload, so mistakes are caught instantly.
// The backend repeats these checks (and looks at the file's real contents), so this
// is a convenience, not the security.

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// 5 MB, like the backend. If you raise MAX_IMAGE_BYTES there, set VITE_MAX_IMAGE_MB here too.
export const MAX_IMAGE_MB = Number(import.meta.env.VITE_MAX_IMAGE_MB) || 5
export const MAX_GALLERY_IMAGES = 12 // matches the backend's MAX_GALLERY_IMAGES default

// The value for <input type="file" accept="...">.
export const ACCEPT_IMAGES = ALLOWED_IMAGE_TYPES.join(',')

// Returns a message if the file can't be used, or null if it looks fine.
export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" is not a JPEG, PNG or WebP image.`
  }

  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `"${file.name}" is too large (${formatSize(file.size)}). The limit is ${MAX_IMAGE_MB} MB.`
  }

  return null
}

// 1536000 -> "1.5 MB"
export function formatSize(bytes) {
  return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}
