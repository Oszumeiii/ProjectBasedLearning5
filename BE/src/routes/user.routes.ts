import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { getMyFavorites } from '../controllers/user.controller'

const router = Router()

router.get('/me/favorites', authMiddleware, getMyFavorites)

export default router

