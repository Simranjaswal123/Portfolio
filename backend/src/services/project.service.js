import supabase from '../config/supabase.js'

// Fetch every row (all columns) from public.projects.
// Returns the rows, or throws if Supabase reports an error.
// The service knows nothing about HTTP; the controller handles the response.
export async function getAllProjects() {
  const { data, error } = await supabase.from('projects').select('*')

  if (error) {
    throw error
  }

  return data
}
