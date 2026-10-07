import { Router } from 'express'
import {
  getExperience,
  createExperienceController,
  updateExperienceController,
  deleteExperienceController,
} from '../controllers/experience.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import {
  validateCreateExperience,
  validateUpdateExperience,
} from '../middleware/validation.middleware.js'

const router = Router()

router.get('/', getExperience)
router.post('/', requireAuth, requireAdmin, validateCreateExperience, createExperienceController)
router.patch('/:id', requireAuth, requireAdmin, validateUpdateExperience, updateExperienceController)
router.delete('/:id', requireAuth, requireAdmin, deleteExperienceController)

export default router
