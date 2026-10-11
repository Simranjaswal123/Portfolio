import { randomUUID } from 'node:crypto'
import supabase from '../config/supabase.js'
import { logSafeMessage } from '../utils/httpError.js'

// This service handles files in Supabase Storage.
// It knows nothing about HTTP, and nothing about which database rows use a file.

// One bucket per kind of image (created by backend/sql/image-storage.sql).
export const BUCKETS = {
  profile: 'profile-images',
  project: 'project-images',
  experience: 'experience-images',
}

// Limits. Both can be changed in backend/.env.
export const MAX_IMAGE_BYTES = Number(process.env.MAX_IMAGE_BYTES) || 5 * 1024 * 1024
export const MAX_GALLERY_IMAGES = Number(process.env.MAX_GALLERY_IMAGES) || 12

// The only image types we accept, and the file ending we store each one with.
export const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// Works out what a file REALLY is by looking at its first bytes. The type the
// browser (or an attacker) claims is never trusted.
export function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }

  const pngStart = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (buffer.length >= 8 && pngStart.every((byte, index) => buffer[index] === byte)) {
    return 'image/png'
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }

  return null
}

// Uploads one image under a new random name (the client's filename is never used).
// Returns where it was stored and its public URL. Throws if Storage refuses it.
export async function uploadImage({ bucket, folder, buffer, contentType }) {
  const path = `${folder}/${randomUUID()}.${ALLOWED_TYPES[contentType]}`

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    cacheControl: '31536000', // names are unique, so browsers may cache for a year
    upsert: false,
  })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { bucket, path, url: data.publicUrl }
}

// If a URL points at one of OUR buckets, returns { bucket, path }. Otherwise null,
// so a link to somebody else's website is never treated as a file we can delete.
export function fileFromUrl(url) {
  try {
    const parsed = new URL(url)
    const ours = new URL(process.env.SUPABASE_URL)
    const prefix = '/storage/v1/object/public/'

    if (parsed.origin !== ours.origin || !parsed.pathname.startsWith(prefix)) {
      return null
    }

    const rest = decodeURIComponent(parsed.pathname.slice(prefix.length))
    const slash = rest.indexOf('/')
    const bucket = rest.slice(0, slash)
    const path = rest.slice(slash + 1)

    return slash > 0 && path && Object.values(BUCKETS).includes(bucket) ? { bucket, path } : null
  } catch {
    return null
  }
}

// Deletes files. A failure here only leaves an unused file behind, so it is logged
// and never thrown: it must not turn a successful change into an error.
export async function removeFiles(files) {
  const byBucket = new Map()

  for (const { bucket, path } of files) {
    byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), path])
  }

  for (const [bucket, paths] of byBucket) {
    const { error } = await supabase.storage.from(bucket).remove(paths)

    if (error) {
      console.error(`Could not delete ${paths.length} file(s) from ${bucket}:`, logSafeMessage(error))
    }
  }
}
