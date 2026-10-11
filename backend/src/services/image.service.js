import supabase from '../config/supabase.js'
import { httpError, isMissingTable } from '../utils/httpError.js'
import {
  BUCKETS,
  MAX_GALLERY_IMAGES,
  fileFromUrl,
  removeFiles,
  uploadImage,
} from './storage.service.js'

// This service connects files in Storage with rows in the database.
// The rule everywhere: upload first, save the reference second, and only delete an
// old file after the new reference is saved. If saving fails, the new file is
// removed again, so nothing is left pointing at a missing file or the other way round.

// Every place a stored image URL can live. Used to avoid deleting a file that
// something else still points at.
const REFERENCES = [
  ['profiles', 'profile_image_url'],
  ['projects', 'image_url'],
  ['project_images', 'image_url'],
  ['experience_images', 'image_url'],
]

// The two galleries (many images per project or per experience entry).
const GALLERIES = {
  project: {
    table: 'project_images',
    parentTable: 'projects',
    parentSelect: 'id, title',
    foreignKey: 'project_id',
    bucket: BUCKETS.project,
    describe: (parent, number) => `${parent.title} — screenshot ${number}`,
  },
  experience: {
    table: 'experience_images',
    parentTable: 'experience',
    parentSelect: 'id, role, company',
    foreignKey: 'experience_id',
    bucket: BUCKETS.experience,
    describe: (parent, number) => `${parent.role} at ${parent.company} — photo ${number}`,
  },
}

function galleryFor(kind) {
  return GALLERIES[kind]
}

// A table that has not been created yet is a set-up problem, not a bug.
function failIfNotSetUp(error) {
  if (isMissingTable(error)) {
    throw httpError(503, 'Image galleries are not set up yet. Run backend/sql/image-storage.sql.')
  }

  throw error
}

async function isStillReferenced(url) {
  for (const [table, column] of REFERENCES) {
    const { data, error } = await supabase.from(table).select('id').eq(column, url).limit(1)

    // A table that does not exist cannot reference anything.
    if (!error && data?.length > 0) {
      return true
    }
  }

  return false
}

// Deletes the file behind a URL, but only if it is one of ours and nothing uses it any more.
async function removeFileIfUnused(url) {
  const file = url ? fileFromUrl(url) : null

  if (file && !(await isStillReferenced(url))) {
    await removeFiles([file])
  }
}

// ---- A single image stored in a column (profile photo, project cover) ---------

async function loadRow(table, column, id) {
  const { data, error } = await supabase.from(table).select(`id, ${column}`).eq('id', id).maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw httpError(404, 'Not found')
  }

  return data
}

async function saveColumn(table, column, id, value) {
  const { data, error } = await supabase
    .from(table)
    .update({ [column]: value })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Sets (or replaces) the image. Returns the updated row.
export async function replaceSingleImage({ table, column, id, bucket, folder, image }) {
  const row = await loadRow(table, column, id)
  const uploaded = await uploadImage({ bucket, folder, buffer: image.buffer, contentType: image.type })

  const { data, error } = await saveColumn(table, column, id, uploaded.url)

  if (error) {
    await removeFiles([uploaded]) // the reference was not saved, so the new file is an orphan
    throw error
  }

  await removeFileIfUnused(row[column]) // the old file, now that the new one is saved
  return data
}

// Removes the image. Returns the updated row.
export async function clearSingleImage({ table, column, id }) {
  const row = await loadRow(table, column, id)
  const { data, error } = await saveColumn(table, column, id, null)

  if (error) {
    throw error
  }

  await removeFileIfUnused(row[column])
  return data
}

// ---- Galleries -----------------------------------------------------------------

async function loadParent(gallery, parentId) {
  const { data, error } = await supabase
    .from(gallery.parentTable)
    .select(gallery.parentSelect)
    .eq('id', parentId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw httpError(404, 'Not found')
  }

  return data
}

// Adds one image to a gallery. Returns the new row.
export async function addGalleryImage(kind, parentId, image, altText) {
  const gallery = galleryFor(kind)
  const parent = await loadParent(gallery, parentId)

  const { data: existing, error: listError } = await supabase
    .from(gallery.table)
    .select('id, display_order')
    .eq(gallery.foreignKey, parentId)

  if (listError) {
    failIfNotSetUp(listError)
  }

  if (existing.length >= MAX_GALLERY_IMAGES) {
    throw httpError(400, `A maximum of ${MAX_GALLERY_IMAGES} images is allowed`)
  }

  const nextOrder = existing.reduce((highest, row) => Math.max(highest, row.display_order), -1) + 1
  const uploaded = await uploadImage({
    bucket: gallery.bucket,
    folder: parentId,
    buffer: image.buffer,
    contentType: image.type,
  })

  const { data, error } = await supabase
    .from(gallery.table)
    .insert({
      [gallery.foreignKey]: parentId,
      image_url: uploaded.url,
      alt_text: altText || gallery.describe(parent, existing.length + 1),
      display_order: nextOrder,
    })
    .select()
    .single()

  if (error) {
    await removeFiles([uploaded]) // the row was not saved, so the new file is an orphan
    throw error
  }

  return data
}

// Deletes one image from a gallery. Returns the deleted row.
export async function deleteGalleryImage(kind, parentId, imageId) {
  const gallery = galleryFor(kind)

  // Matching the parent too means an image can only be deleted through its own entry.
  const { data: row, error: findError } = await supabase
    .from(gallery.table)
    .select('*')
    .eq('id', imageId)
    .eq(gallery.foreignKey, parentId)
    .maybeSingle()

  if (findError) {
    failIfNotSetUp(findError)
  }

  if (!row) {
    throw httpError(404, 'Not found')
  }

  const { error } = await supabase.from(gallery.table).delete().eq('id', imageId)

  if (error) {
    throw error
  }

  await removeFileIfUnused(row.image_url)
  return row
}

// Puts a gallery in a new order. `order` must list every image id exactly once.
// Returns the images in their new order.
export async function reorderGallery(kind, parentId, order) {
  const gallery = galleryFor(kind)

  const { data: rows, error: listError } = await supabase
    .from(gallery.table)
    .select('*')
    .eq(gallery.foreignKey, parentId)

  if (listError) {
    failIfNotSetUp(listError)
  }

  const known = new Set(rows.map((row) => row.id))
  const valid =
    Array.isArray(order) &&
    order.length === known.size &&
    new Set(order).size === order.length &&
    order.every((id) => known.has(id))

  if (!valid) {
    throw httpError(400, 'The order must list every image exactly once')
  }

  for (const [index, id] of order.entries()) {
    const { error } = await supabase.from(gallery.table).update({ display_order: index }).eq('id', id)

    if (error) {
      throw error
    }
  }

  const byId = new Map(rows.map((row) => [row.id, row]))
  return order.map((id, index) => ({ ...byId.get(id), display_order: index }))
}

// ---- Reading: rows together with their gallery ---------------------------------

// Fetches every row of `table` with its gallery attached as `images` (in display
// order). If the gallery table has not been created yet, the plain rows are returned
// with empty galleries, so the public site keeps working before the SQL is run.
export async function selectWithImages(table, galleryTable) {
  const { data, error } = await supabase
    .from(table)
    .select(`*, ${galleryTable}(id, image_url, alt_text, display_order)`)

  if (error) {
    if (!isMissingTable(error)) {
      throw error
    }

    console.warn(`${galleryTable} is missing: returning ${table} without images (run backend/sql/image-storage.sql).`)
    const plain = await supabase.from(table).select('*')

    if (plain.error) {
      throw plain.error
    }

    return plain.data.map((row) => ({ ...row, images: [] }))
  }

  return data.map(({ [galleryTable]: gallery, ...row }) => ({
    ...row,
    images: [...(gallery ?? [])].sort((a, b) => a.display_order - b.display_order),
  }))
}

// ---- Clean-up when a whole project or experience entry is deleted -------------

// Every image URL belonging to an entry (its cover too, for projects). Call this
// BEFORE deleting the entry, because deleting it also removes its gallery rows.
export async function collectImageUrls(kind, parentId) {
  const gallery = galleryFor(kind)
  const urls = []

  if (kind === 'project') {
    const { data } = await supabase.from('projects').select('image_url').eq('id', parentId).maybeSingle()
    if (data?.image_url) urls.push(data.image_url)
  }

  const { data: rows } = await supabase.from(gallery.table).select('image_url').eq(gallery.foreignKey, parentId)
  urls.push(...(rows ?? []).map((row) => row.image_url))

  return urls
}

// Call this AFTER the entry was deleted. Deletes the files nothing uses any more.
export async function removeUnusedImages(urls) {
  for (const url of urls) {
    await removeFileIfUnused(url)
  }
}
