import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { login, me, register } from '../controllers/auth.controller'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, me)

export default router

