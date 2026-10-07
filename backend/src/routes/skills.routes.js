import { Router } from 'express'
import {
  getSkills,
  createSkillController,
  updateSkillController,
  deleteSkillController,
} from '../controllers/skills.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', getSkills)
router.post('/', requireAuth, createSkillController)
router.patch('/:id', requireAuth, updateSkillController)
router.delete('/:id', requireAuth, deleteSkillController)

export default router
