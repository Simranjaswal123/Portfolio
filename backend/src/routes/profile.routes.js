import { Router } from 'express'
import { getProfileData } from '../controllers/profile.controller.js'
import { removeProfileImage, uploadProfileImage } from '../controllers/image.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import { receiveImage } from '../middleware/image.middleware.js'

const router = Router()

router.get('/', getProfileData)

// The profile photo (admin only). The file is the request body.
router.put('/image', requireAuth, requireAdmin, receiveImage, uploadProfileImage)
router.delete('/image', requireAuth, requireAdmin, removeProfileImage)

export default router
