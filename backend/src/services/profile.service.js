import supabase from '../config/supabase.js'

// This service handles database access for the profile.
// It knows nothing about HTTP; a controller decides how to respond.

// Fetch the profile (all columns) from public.profiles.
// This portfolio has one profile, so .single() returns one row instead of an array.
// Returns the row, or throws if Supabase reports an error.
export async function getProfile() {
  const { data, error } = await supabase.from('profiles').select('*').single()

  if (error) {
    throw error
  }

  return data
}
