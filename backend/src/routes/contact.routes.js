import { Router } from 'express'
import {
  createContact,
  getContactMessagesController,
  updateContactMessageStatusController,
  deleteContactMessageController,
} from '../controllers/contact.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import { validateContactMessage } from '../middleware/validation.middleware.js'
import { contactRateLimit } from '../middleware/rateLimit.middleware.js'

const router = Router()

// Visitors send messages, so this stays public. It is rate limited and validated,
// and only name, email, subject and message are accepted.
router.post('/', contactRateLimit, validateContactMessage, createContact)

// Reading, updating and deleting messages is for the admin only.
router.get('/', requireAuth, requireAdmin, getContactMessagesController)
router.patch('/:id/status', requireAuth, requireAdmin, updateContactMessageStatusController)
router.delete('/:id', requireAuth, requireAdmin, deleteContactMessageController)

export default router
