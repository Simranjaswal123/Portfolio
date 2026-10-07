import { Router } from 'express'
import {
  getEducation,
  createEducationController,
  updateEducationController,
  deleteEducationController,
} from '../controllers/education.controller.js'

const router = Router()

router.get('/', getEducation)
router.post('/', createEducationController)
router.patch('/:id', updateEducationController)
router.delete('/:id', deleteEducationController)

export default router
