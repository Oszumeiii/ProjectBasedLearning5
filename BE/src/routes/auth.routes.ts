import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import {
  activate,
  changePassword,
  forgotPassword,
  login,
  logout,
  logoutAll,
  me,
  refresh,
  requestActivation,
  resetPassword
} from '../controllers/auth.controller'

const router = Router()

// ─── Công khai ───
router.post('/login', login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.post('/activate', activate)
router.post('/request-activation', requestActivation)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// ─── Yêu cầu đăng nhập ───
router.get('/me', authMiddleware, me)
router.post('/change-password', authMiddleware, changePassword)
router.post('/logout-all', authMiddleware, logoutAll)

export default router
