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

// Allow only the React dev server to call this API from the browser.
app.use(cors({ origin: 'http://localhost:5173' }))

// Parse JSON request bodies (req.body) for future POST/PUT routes.
app.use(express.json())

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

export default app
