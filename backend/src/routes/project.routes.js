import { Router } from 'express'
import {
  getProjects,
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from '../controllers/project.controller.js'

const router = Router()

router.get('/', getProjects)
router.post('/', createProjectController)
router.patch('/:id', updateProjectController)
router.delete('/:id', deleteProjectController)

export default router
