import { Router } from 'express'
import {
  getProjects,
  createProjectController,
} from '../controllers/project.controller.js'

const router = Router()

router.get('/', getProjects)
router.post('/', createProjectController)

export default router
