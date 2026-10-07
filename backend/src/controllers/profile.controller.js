import { getProfile } from '../services/profile.service.js'

// This controller handles the HTTP response for profile requests.
// The database work itself is done by the profile service.

export async function getProfileData(req, res) {
  try {
    const profile = await getProfile()
    res.status(200).json(profile)
  } catch (error) {
    // Log the real error on the server only; never send it to the client.
    console.error('Failed to fetch profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}
