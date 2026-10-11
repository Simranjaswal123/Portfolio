import supabase from '../config/supabase.js'
import { collectImageUrls, removeUnusedImages, selectWithImages } from './image.service.js'

// Fetch every row (all columns) from public.projects, each with its screenshots
// in an `images` list (the cover is still `image_url`).
// Returns the rows, or throws if Supabase reports an error.
// The service knows nothing about HTTP; the controller handles the response.
export async function getAllProjects() {
  return selectWithImages('projects', 'project_images')
}

// Insert one project into public.projects.
// Returns the inserted row, or throws if Supabase reports an error.
export async function createProject(projectData) {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update one project in public.projects, found by its id.
// Returns the updated row, or throws if Supabase reports an error.
export async function updateProject(id, projectData) {
  const { data, error } = await supabase
    .from('projects')
    .update(projectData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Delete one project from public.projects, found by its id.
// Returns the deleted row, or throws if Supabase reports an error.
export async function deleteProject(id) {
  // Remember the project's images first: deleting the project also removes its gallery rows.
  const imageUrls = await collectImageUrls('project', id)

  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  await removeUnusedImages(imageUrls) // then delete the files, now that nothing uses them
  return data
}
