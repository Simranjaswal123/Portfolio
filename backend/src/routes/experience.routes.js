import { Router } from 'express'
import { getExperience } from '../controllers/experience.controller.js'

const router = Router()

router.get('/', getExperience)

export default router
