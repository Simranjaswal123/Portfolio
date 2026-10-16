// Where the Express backend lives. It comes ONLY from VITE_API_URL; there is no
// address written into the code, so the built site can only call what you configure:
//   local development   VITE_API_URL=http://localhost:5000                 (frontend/.env)
//   production          VITE_API_URL=https://portfolio-faua.onrender.com   (Vercel settings)
//
// Give the server's address only (no "/api" on the end): every service adds its own
// "/api/..." path. A trailing slash or "/api" is trimmed off anyway, so a slightly
// different value can never produce "//api" or "/api/api".
//
// Vite bakes this value into the built files, so it must be set before `npm run build`
// (on Vercel: in the project's Environment Variables, then redeploy).
function readApiUrl() {
  const configured = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '').replace(/\/api$/, '')

  if (!configured) {
    console.error(
      import.meta.env.DEV
        ? 'VITE_API_URL is not set. Add VITE_API_URL=http://localhost:5000 to frontend/.env and restart npm run dev.'
        : 'VITE_API_URL was not set when this site was built, so it cannot reach the backend. Set it in Vercel and redeploy.',
    )
    return ''
  }

  // A deployed site pointing at a local address can never work for visitors.
  if (import.meta.env.PROD && /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(configured)) {
    console.error(`VITE_API_URL is "${configured}" in this production build. Set it to the deployed backend in Vercel and redeploy.`)
  }

  return configured
}

export const API_URL = readApiUrl()
