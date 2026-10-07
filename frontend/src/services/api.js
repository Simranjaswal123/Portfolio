import supabase from '../config/supabase.js'

// A fetch() that proves who is calling.
//
// Why the access token is needed:
//   The backend only accepts admin changes (and the private contact messages) from
//   a signed-in user. When the admin signs in, Supabase gives the browser an
//   "access token". The backend reads it from the Authorization header and checks it
//   with Supabase Auth before doing anything.
//
// Why this helper exists:
//   Every protected request needs that same header. Doing it in one place means the
//   services don't repeat it, and each request always gets the latest token (Supabase
//   refreshes it automatically when it expires).
//
// Why the secret key must never be used here:
//   Everything in the frontend can be read by any visitor. We only use the
//   publishable key, through the client in config/supabase.js. The backend's
//   SUPABASE_SECRET_KEY bypasses all database security and must stay on the server.
//
// Use it exactly like fetch(). It returns the normal fetch Response, so the caller
// still checks response.ok. It throws if nobody is signed in.
export async function authenticatedFetch(url, options = {}) {
  const { data, error } = await supabase.auth.getSession()

  const accessToken = data?.session?.access_token

  if (error || !accessToken) {
    throw new Error('Not signed in: no access token found')
  }

  // Copy the headers that were passed in (in any format) and add the token.
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)

  return fetch(url, { ...options, headers })
}
