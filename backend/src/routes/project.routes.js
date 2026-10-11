import { Router } from 'express'
import {
  getProjects,
  createProjectController,
  updateProjectController,
  deleteProjectController,
} from '../controllers/project.controller.js'
import {
  projectGallery,
  removeProjectCover,
  uploadProjectCover,
} from '../controllers/image.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import { receiveImage, validateUuidParams } from '../middleware/image.middleware.js'
import {
  validateCreateProject,
  validateUpdateProject,
} from '../middleware/validation.middleware.js'

const router = Router()

router.get('/', getProjects)
router.post('/', requireAuth, requireAdmin, validateCreateProject, createProjectController)
router.patch('/:id', requireAuth, requireAdmin, validateUpdateProject, updateProjectController)
router.delete('/:id', requireAuth, requireAdmin, deleteProjectController)

// Images (admin only). The cover image is stored on the project itself;
// screenshots are a gallery with one row per image.
router.put('/:id/cover-image', requireAuth, requireAdmin, validateUuidParams('id'), receiveImage, uploadProjectCover)
router.delete('/:id/cover-image', requireAuth, requireAdmin, validateUuidParams('id'), removeProjectCover)
router.post('/:id/images', requireAuth, requireAdmin, validateUuidParams('id'), receiveImage, projectGallery.add)
router.patch('/:id/images/order', requireAuth, requireAdmin, validateUuidParams('id'), projectGallery.reorder)
router.delete('/:id/images/:imageId', requireAuth, requireAdmin, validateUuidParams('id', 'imageId'), projectGallery.remove)

export default router
