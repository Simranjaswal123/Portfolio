import { Router } from 'express'

const router = Router()

// GET /api/health — confirms the backend is up and responding.
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  })
})

export default router
