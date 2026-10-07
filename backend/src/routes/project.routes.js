import { Router } from 'express'
import {
  getProjects,
  createProjectController,
  updateProjectController,
} from '../controllers/project.controller.js'

const router = Router()

router.get('/', getProjects)
router.post('/', createProjectController)
router.patch('/:id', updateProjectController)

export default router
