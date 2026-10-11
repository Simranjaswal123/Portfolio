import { logSafeMessage } from '../utils/httpError.js'
import { getProfile } from '../services/profile.service.js'
import {
  addGalleryImage,
  clearSingleImage,
  deleteGalleryImage,
  reorderGallery,
  replaceSingleImage,
} from '../services/image.service.js'
import { BUCKETS } from '../services/storage.service.js'

// This controller handles the HTTP responses for image uploads.
// The work itself is done by the image service.

// Errors we raised on purpose carry a safe message and status. Anything else
// (Supabase, Storage, a bug) is logged here and the client only sees a generic message.
function sendError(res, error, fallbackMessage) {
  if (error.isHttpError) {
    return res.status(error.statusCode).json({ error: error.message })
  }

  console.error(`${fallbackMessage}:`, logSafeMessage(error))
  res.status(500).json({ error: fallbackMessage })
}

// An optional description for the image, from ?alt=... (never a file name).
function altTextFrom(req) {
  const alt = typeof req.query.alt === 'string' ? req.query.alt.trim() : ''
  return alt.slice(0, 200) || null
}

// ---- Profile photo: PUT/DELETE /api/profile/image ------------------------------

export async function uploadProfileImage(req, res) {
  try {
    const profile = await getProfile()
    const updated = await replaceSingleImage({
      table: 'profiles',
      column: 'profile_image_url',
      id: profile.id,
      bucket: BUCKETS.profile,
      folder: 'profile',
      image: req.image,
    })
    res.status(200).json({ image_url: updated.profile_image_url })
  } catch (error) {
    sendError(res, error, 'Failed to upload profile image')
  }
}

export async function removeProfileImage(req, res) {
  try {
    const profile = await getProfile()
    await clearSingleImage({ table: 'profiles', column: 'profile_image_url', id: profile.id })
    res.status(200).json({ image_url: null })
  } catch (error) {
    sendError(res, error, 'Failed to remove profile image')
  }
}

// ---- Project cover: PUT/DELETE /api/projects/:id/cover-image --------------------

export async function uploadProjectCover(req, res) {
  try {
    const updated = await replaceSingleImage({
      table: 'projects',
      column: 'image_url',
      id: req.params.id,
      bucket: BUCKETS.project,
      folder: req.params.id,
      image: req.image,
    })
    res.status(200).json({ image_url: updated.image_url })
  } catch (error) {
    sendError(res, error, 'Failed to upload cover image')
  }
}

export async function removeProjectCover(req, res) {
  try {
    await clearSingleImage({ table: 'projects', column: 'image_url', id: req.params.id })
    res.status(200).json({ image_url: null })
  } catch (error) {
    sendError(res, error, 'Failed to remove cover image')
  }
}

// ---- Galleries: project screenshots and experience photos -----------------------
// POST   .../:id/images            add one image
// DELETE .../:id/images/:imageId   delete one image
// PATCH  .../:id/images/order      body { order: [imageId, ...] }

function galleryHandlers(kind) {
  return {
    async add(req, res) {
      try {
        const image = await addGalleryImage(kind, req.params.id, req.image, altTextFrom(req))
        res.status(201).json(image)
      } catch (error) {
        sendError(res, error, 'Failed to upload image')
      }
    },

    async remove(req, res) {
      try {
        const image = await deleteGalleryImage(kind, req.params.id, req.params.imageId)
        res.status(200).json(image)
      } catch (error) {
        sendError(res, error, 'Failed to delete image')
      }
    },

    async reorder(req, res) {
      try {
        const images = await reorderGallery(kind, req.params.id, req.body?.order)
        res.status(200).json(images)
      } catch (error) {
        sendError(res, error, 'Failed to reorder images')
      }
    },
  }
}

export const projectGallery = galleryHandlers('project')
export const experienceGallery = galleryHandlers('experience')
