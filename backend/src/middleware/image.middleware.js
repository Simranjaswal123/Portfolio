import express from 'express'
import { ALLOWED_TYPES, MAX_IMAGE_BYTES, detectImageType } from '../services/storage.service.js'

// Reads an uploaded image from the request body and checks it.
//
// The browser sends the image file itself as the request body (Content-Type
// image/jpeg, image/png or image/webp). This always runs AFTER requireAuth and
// requireAdmin, so nobody who is not the admin can make the server read a file.
//
// Checks:
//   - the size limit (MAX_IMAGE_BYTES): too big gives 413 (via the app's error handler)
//   - something was actually sent, with an image Content-Type
//   - the file's own first bytes say it really is a JPEG, PNG or WebP
// On success the file is on req.image as { buffer, type }.
const readBody = express.raw({ type: Object.keys(ALLOWED_TYPES), limit: MAX_IMAGE_BYTES })

export function receiveImage(req, res, next) {
  readBody(req, res, (error) => {
    if (error) {
      return next(error)
    }

    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(415).json({ error: 'Send a JPEG, PNG or WebP image' })
    }

    // Trust the bytes, not the Content-Type header or any file name.
    const type = detectImageType(req.body)

    if (!type) {
      return res.status(415).json({ error: 'The file is not a valid JPEG, PNG or WebP image' })
    }

    req.image = { buffer: req.body, type }
    next()
  })
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Checks that the named URL parameters are well-formed ids, so only real ids ever
// reach the database or become part of a storage path.
export function validateUuidParams(...names) {
  return (req, res, next) => {
    if (!names.every((name) => UUID_PATTERN.test(req.params[name] ?? ''))) {
      return res.status(400).json({ error: 'Invalid id' })
    }

    next()
  }
}
