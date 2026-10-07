import supabase from '../config/supabase.js'

// Express middleware that only lets signed-in users through.
//
// Where the token comes from:
//   When the admin signs in on the frontend, Supabase Auth gives the browser an
//   "access token". The frontend must send it with each request in this header:
//     Authorization: Bearer <access_token>
//
// Why the backend verifies it:
//   Anyone can send any header, so the backend can't trust it as it is. We ask
//   Supabase Auth to check that the token is real, was issued for this project,
//   and has not expired.
//
// What req.user contains:
//   After a successful check, req.user is the Supabase user object (for example
//   req.user.id and req.user.email), so later code knows who is making the request.
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  // No Authorization header, or not in the "Bearer <token>" format.
  const [scheme, token] = authHeader ? authHeader.split(' ') : []

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    // Asks Supabase Auth to verify the token and return the user it belongs to.
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = data.user
    next()
  } catch (err) {
    // Log the real error on the server only; never send it to the client.
    console.error('Token verification failed:', err)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
