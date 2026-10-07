import supabase from '../config/supabase.js'

// This service handles database access for experience.
// It knows nothing about HTTP; a controller decides how to respond.

// Fetch every row (all columns) from public.experience.
// Returns the rows, or throws if Supabase reports an error.
export async function getAllExperience() {
  const { data, error } = await supabase.from('experience').select('*')

  if (error) {
    throw error
  }

  return data
}

// Insert one experience entry into public.experience.
// Returns the inserted row, or throws if Supabase reports an error.
export async function createExperience(experienceData) {
  const { data, error } = await supabase
    .from('experience')
    .insert(experienceData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update one experience entry in public.experience, found by its id.
// Returns the updated row, or throws if Supabase reports an error.
export async function updateExperience(id, experienceData) {
  const { data, error } = await supabase
    .from('experience')
    .update(experienceData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Delete one experience entry from public.experience, found by its id.
// Returns the deleted row, or throws if Supabase reports an error.
export async function deleteExperience(id) {
  const { data, error } = await supabase
    .from('experience')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
