import express from 'express'
import healthRouter from './routes/health.js'

// The app defines *what* the API does: middleware and routes.
const app = express()

// Parse JSON request bodies (req.body) for future POST/PUT routes.
app.use(express.json())

// All health-check routes live under /api/health.
app.use('/api/health', healthRouter)

export default app
