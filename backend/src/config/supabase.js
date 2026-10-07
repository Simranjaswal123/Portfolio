import { createClient } from '@supabase/supabase-js'

const { SUPABASE_URL, SUPABASE_SECRET_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SECRET_KEY. Set them in backend/.env.',
  )
}

// Server-side client. The secret key bypasses Row Level Security,
// so it must only be used in the backend and never sent to the browser.
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY)

export default supabase
