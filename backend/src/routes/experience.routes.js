import { Router } from 'express'
import {
  getExperience,
  createExperienceController,
  updateExperienceController,
  deleteExperienceController,
} from '../controllers/experience.controller.js'

const router = Router()

router.get('/', getExperience)
router.post('/', createExperienceController)
router.patch('/:id', updateExperienceController)
router.delete('/:id', deleteExperienceController)

export default router
