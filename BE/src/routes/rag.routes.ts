import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import { ragQA, semanticSearch, storeEmbeddings, summary } from '../controllers/rag.controller'

const router = Router()

// Store embeddings — chỉ lecturer + admin
router.post('/embeddings', authMiddleware, requireRole('lecturer', 'manager', 'admin'), storeEmbeddings)

// Search & QA — tất cả user đã đăng nhập
router.post('/search', authMiddleware, semanticSearch)
router.post('/qa', authMiddleware, ragQA)
router.post('/summary', authMiddleware, summary)

export default router
