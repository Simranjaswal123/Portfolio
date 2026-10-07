import { createClient } from '@supabase/supabase-js'

// Vite only exposes variables that start with VITE_ to browser code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL. Set it in frontend/.env.')
}

if (!supabasePublishableKey) {
  throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY. Set it in frontend/.env.')
}

// Browser client. It uses the public (publishable) key, which is safe to expose.
// Never put the backend's secret key here.
const supabase = createClient(supabaseUrl, supabasePublishableKey)

export default supabase
