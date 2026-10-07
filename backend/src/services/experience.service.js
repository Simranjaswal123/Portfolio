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
