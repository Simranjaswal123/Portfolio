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

// The only two values a message's status may have.
const ALLOWED_STATUSES = ['unread', 'read']

// Fetch every contact message (all columns), newest first.
// Returns the rows, or throws if Supabase reports an error.
export async function getAllContactMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data
}

// Set one message's status to "read" or "unread", found by its id.
// Returns the updated row, or throws if the status is not allowed
// or Supabase reports an error.
export async function updateContactMessageStatus(id, status) {
  if (!ALLOWED_STATUSES.includes(status)) {
    const validationError = new Error('Status must be "read" or "unread"')
    validationError.statusCode = 400 // the controller turns this into a 400 response
    throw validationError
  }

  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// Delete one message from public.contact_messages, found by its id.
// Returns the deleted row, or throws if Supabase reports an error.
export async function deleteContactMessage(id) {
  const { data, error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
