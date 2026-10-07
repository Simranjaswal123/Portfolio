import { Router } from 'express'
import {
  getEducation,
  createEducationController,
  updateEducationController,
  deleteEducationController,
} from '../controllers/education.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', getEducation)
router.post('/', requireAuth, createEducationController)
router.patch('/:id', requireAuth, updateEducationController)
router.delete('/:id', requireAuth, deleteEducationController)

export default router
