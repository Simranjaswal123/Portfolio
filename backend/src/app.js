import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import projectRouter from './routes/project.routes.js'
import educationRouter from './routes/education.routes.js'
import experienceRouter from './routes/experience.routes.js'
import skillsRouter from './routes/skills.routes.js'
import contactRouter from './routes/contact.routes.js'
import profileRouter from './routes/profile.routes.js'

// The app defines *what* the API does: middleware and routes.
const app = express()

// Don't tell every visitor which framework we use, and stop browsers from guessing
// content types.
app.disable('x-powered-by')
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff')
  next()
})

// Only the frontend is allowed to call this API from a browser.
// Set FRONTEND_URL in backend/.env for another address (separate several with commas).
// It defaults to the local development server. A wildcard (*) is refused on purpose.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (allowedOrigins.includes('*')) {
  throw new Error('FRONTEND_URL must list real origins, not "*".')
}

app.use(cors({ origin: allowedOrigins }))

// Parse JSON request bodies (req.body). Anything bigger than 50kb is refused.
app.use(express.json({ limit: '50kb' }))

// All health-check routes live under /api/health.
app.use('/api/health', healthRouter)

// Project routes live under /api/projects.
app.use('/api/projects', projectRouter)

// Education routes live under /api/education.
app.use('/api/education', educationRouter)

// Experience routes live under /api/experience.
app.use('/api/experience', experienceRouter)

// Skills routes live under /api/skills.
app.use('/api/skills', skillsRouter)

// Contact routes live under /api/contact.
app.use('/api/contact', contactRouter)

// Profile routes live under /api/profile.
app.use('/api/profile', profileRouter)

// Anything that matched no route above.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Last-resort error handler. It keeps stack traces and file paths away from the client.
// (The four parameters are required: that is how Express recognises an error handler.)
app.use((err, req, res, next) => {
  // Problems with the request itself, such as malformed JSON or a body that is too big.
  if (err.status === 413) {
    return res.status(413).json({ error: 'Request body too large' })
  }

  if (err.status >= 400 && err.status < 500) {
    return res.status(400).json({ error: 'Invalid request data' })
  }

  // Anything else is our bug: log it here, tell the client nothing about it.
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
