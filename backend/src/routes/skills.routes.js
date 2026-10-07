import { Router } from 'express'
import {
  getSkills,
  createSkillController,
  updateSkillController,
  deleteSkillController,
} from '../controllers/skills.controller.js'

const router = Router()

router.get('/', getSkills)
router.post('/', createSkillController)
router.patch('/:id', updateSkillController)
router.delete('/:id', deleteSkillController)

export default router
