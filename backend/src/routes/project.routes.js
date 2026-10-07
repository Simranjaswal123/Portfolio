import { Router } from 'express'
import {
  getProjects,
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from '../controllers/project.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', getProjects)
router.post('/', requireAuth, createProjectController)
router.patch('/:id', requireAuth, updateProjectController)
router.delete('/:id', requireAuth, deleteProjectController)

export default router
