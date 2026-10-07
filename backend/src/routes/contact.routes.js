import { Router } from 'express'
import {
  createContact,
  getContactMessagesController,
  updateContactMessageStatusController,
  deleteContactMessageController,
} from '../controllers/contact.controller.js'

const router = Router()

router.post('/', createContact)
router.get('/', getContactMessagesController)
router.patch('/:id/status', updateContactMessageStatusController)
router.delete('/:id', deleteContactMessageController)

export default router
