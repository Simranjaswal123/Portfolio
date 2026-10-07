import express from 'express'
import cors from 'cors'
import healthRouter from './routes/health.js'
import projectRouter from './routes/project.routes.js'

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

export default app
