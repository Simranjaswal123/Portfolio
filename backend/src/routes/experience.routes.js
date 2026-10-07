import { Router } from 'express'
import {
  getExperience,
  createExperienceController,
  updateExperienceController,
  deleteExperienceController,
} from '../controllers/experience.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', getExperience)
router.post('/', requireAuth, createExperienceController)
router.patch('/:id', requireAuth, updateExperienceController)
router.delete('/:id', requireAuth, deleteExperienceController)

export default router
