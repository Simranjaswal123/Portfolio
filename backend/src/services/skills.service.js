import supabase from '../config/supabase.js'

// This service handles database access for skills.
// It knows nothing about HTTP; a controller decides how to respond.

// Fetch every row (all columns) from public.skills.
// Returns the rows, or throws if Supabase reports an error.
export async function getAllSkills() {
  const { data, error } = await supabase.from('skills').select('*')

  if (error) {
    throw error
  }

  return data
}
