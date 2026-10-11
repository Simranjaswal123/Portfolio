import { Router } from 'express'
import {
  getExperience,
  createExperienceController,
  updateExperienceController,
  deleteExperienceController,
} from '../controllers/experience.controller.js'
import { experienceGallery } from '../controllers/image.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import { receiveImage, validateUuidParams } from '../middleware/image.middleware.js'
import {
  validateCreateExperience,
  validateUpdateExperience,
} from '../middleware/validation.middleware.js'

const router = Router()

router.get('/', getExperience)
router.post('/', requireAuth, requireAdmin, validateCreateExperience, createExperienceController)
router.patch('/:id', requireAuth, requireAdmin, validateUpdateExperience, updateExperienceController)
router.delete('/:id', requireAuth, requireAdmin, deleteExperienceController)

// Photos for an entry (admin only): one gallery row per image.
router.post('/:id/images', requireAuth, requireAdmin, validateUuidParams('id'), receiveImage, experienceGallery.add)
router.patch('/:id/images/order', requireAuth, requireAdmin, validateUuidParams('id'), experienceGallery.reorder)
router.delete('/:id/images/:imageId', requireAuth, requireAdmin, validateUuidParams('id', 'imageId'), experienceGallery.remove)

export default router
