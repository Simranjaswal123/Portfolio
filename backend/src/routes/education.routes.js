import { Router } from 'express'
import {
  getEducation,
  createEducationController,
  updateEducationController,
  deleteEducationController,
} from '../controllers/education.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import {
  validateCreateEducation,
  validateUpdateEducation,
} from '../middleware/validation.middleware.js'

const router = Router()

router.get('/', getEducation)
router.post('/', requireAuth, requireAdmin, validateCreateEducation, createEducationController)
router.patch('/:id', requireAuth, requireAdmin, validateUpdateEducation, updateEducationController)
router.delete('/:id', requireAuth, requireAdmin, deleteEducationController)

export default router
