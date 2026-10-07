import { Router } from 'express'
import {
  getProjects,
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from '../controllers/project.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import {
  validateCreateProject,
  validateUpdateProject,
} from '../middleware/validation.middleware.js'

const router = Router()

router.get('/', getProjects)
router.post('/', requireAuth, requireAdmin, validateCreateProject, createProjectController)
router.patch('/:id', requireAuth, requireAdmin, validateUpdateProject, updateProjectController)
router.delete('/:id', requireAuth, requireAdmin, deleteProjectController)

export default router
