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
