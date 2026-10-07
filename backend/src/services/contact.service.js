import supabase from '../config/supabase.js'

// This service handles database access for contact messages.
// It knows nothing about HTTP; a controller decides how to respond.

// Insert one message into public.contact_messages.
// Returns the inserted row, or throws if Supabase reports an error.
export async function createContactMessage(messageData) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert(messageData)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
