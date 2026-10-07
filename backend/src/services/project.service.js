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
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
