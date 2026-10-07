// Express middleware that only lets THE admin through.
//
// requireAuth proves the caller is a signed-in Supabase user. This goes one step
// further: it checks that the signed-in user is the admin. This portfolio has a
// single admin, so "who is the admin" is just one email address, set in the
// ADMIN_EMAIL environment variable (backend/.env). There is no roles table.
//
// Always use it AFTER requireAuth, which is what puts the user on req.user:
//   router.post('/', requireAuth, requireAdmin, controller)
//
// Answers:
//   500 - ADMIN_EMAIL is not set. We refuse everything rather than guess.
//   403 - signed in, but not the admin.
//   next() - the signed-in user is the admin.
export function requireAdmin(req, res, next) {
  // Normally impossible (requireAuth runs first), but never let a missing user through.
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()

  if (!adminEmail) {
    // Say what is wrong, without printing any email address.
    console.error('ADMIN_EMAIL is not set, so every admin request is refused.')
    return res.status(500).json({ error: 'Admin authorization is not configured' })
  }

  // Email addresses are not case sensitive, so compare them without regard to case.
  const userEmail = req.user.email?.trim().toLowerCase()

  if (userEmail !== adminEmail) {
    return res.status(403).json({ error: 'Admin access required' })
  }

  next()
}
