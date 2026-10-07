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

// Insert one skill into public.skills.
// Returns the inserted row, or throws if Supabase reports an error.
export async function createSkill(skillData) {
  const { data, error } = await supabase
    .from('skills')
    .insert(skillData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Update one skill in public.skills, found by its id.
// Returns the updated row, or throws if Supabase reports an error.
export async function updateSkill(id, skillData) {
  const { data, error } = await supabase
    .from('skills')
    .update(skillData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Delete one skill from public.skills, found by its id.
// Returns the deleted row, or throws if Supabase reports an error.
export async function deleteSkill(id) {
  const { data, error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
