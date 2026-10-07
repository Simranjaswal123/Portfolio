import supabase from '../config/supabase.js'

// This service handles authentication with Supabase.

// Sign in with an email and password.
// Returns the auth data (user and session), or throws if Supabase reports an error.
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}
