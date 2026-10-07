import { Router } from 'express'
import {
  getSkills,
  createSkillController,
  updateSkillController,
  deleteSkillController,
} from '../controllers/skills.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import {
  validateCreateSkill,
  validateUpdateSkill,
} from '../middleware/validation.middleware.js'

const router = Router()

router.get('/', getSkills)
router.post('/', requireAuth, requireAdmin, validateCreateSkill, createSkillController)
router.patch('/:id', requireAuth, requireAdmin, validateUpdateSkill, updateSkillController)
router.delete('/:id', requireAuth, requireAdmin, deleteSkillController)

export default router
