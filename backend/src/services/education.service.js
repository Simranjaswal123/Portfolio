import supabase from '../config/supabase.js'

// This service handles database access for education.
// It knows nothing about HTTP; a controller decides how to respond.

// Fetch every row (all columns) from public.education.
// Returns the rows, or throws if Supabase reports an error.
export async function getAllEducation() {
  const { data, error } = await supabase.from('education').select('*')

  if (error) {
    throw error
  }

  return data
}

// Insert one education record into public.education.
// Returns the inserted row, or throws if Supabase reports an error.
export async function createEducation(educationData) {
  const { data, error } = await supabase
    .from('education')
    .insert(educationData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update one education record in public.education, found by its id.
// Returns the updated row, or throws if Supabase reports an error.
export async function updateEducation(id, educationData) {
  const { data, error } = await supabase
    .from('education')
    .update(educationData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Delete one education record from public.education, found by its id.
// Returns the deleted row, or throws if Supabase reports an error.
export async function deleteEducation(id) {
  const { data, error } = await supabase
    .from('education')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
