// Where the Express backend lives, read from VITE_API_URL:
//   local development   VITE_API_URL=http://localhost:5000          (frontend/.env)
//   production          VITE_API_URL=https://<your-service>.onrender.com   (Vercel settings)
//
// Give the server's address only (no "/api" on the end): every service adds its own
// "/api/..." path. A trailing slash or "/api" is trimmed off anyway, so a slightly
// different value can never produce "//api" or "/api/api".
//
// Vite bakes this value into the built files, so it must be set before `npm run build`
// (on Vercel: in the project's Environment Variables, then redeploy).
function readApiUrl() {
  const configured = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '').replace(/\/api$/, '')

  if (configured) {
    return configured
  }

  if (import.meta.env.DEV) {
    console.warn('VITE_API_URL is not set; using http://localhost:5000. Add it to frontend/.env.')
    return 'http://localhost:5000'
  }

  console.error('VITE_API_URL is not set, so API requests will go to this site instead of the backend.')
  return ''
}

export const API_URL = readApiUrl()
