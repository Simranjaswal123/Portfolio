import { Router } from 'express'
import {
  createContact,
  getContactMessagesController,
  updateContactMessageStatusController,
  deleteContactMessageController,
} from '../controllers/contact.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

// Visitors send messages, so this stays public.
router.post('/', createContact)

// Reading, updating and deleting messages is for the admin only.
router.get('/', requireAuth, getContactMessagesController)
router.patch('/:id/status', requireAuth, updateContactMessageStatusController)
router.delete('/:id', requireAuth, deleteContactMessageController)

export default router
