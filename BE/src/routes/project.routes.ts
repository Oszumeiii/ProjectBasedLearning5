import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireRole } from '../middlewares/role.middleware'
import {
  listProjects, getProjectById, createProject, updateProject,
  updateProjectStatus, assignSupervisor, deleteProject
} from '../controllers/project.controller'

const router = Router()

router.use(authMiddleware)

// List & detail
router.get('/', listProjects)
router.get('/:id', getProjectById)

// Tạo — SV tạo đề tài, hoặc GV/admin tạo hộ
router.post('/', createProject)

// Sửa — SV owner hoặc staff
router.put('/:id', updateProject)

// Duyệt / đổi status — chỉ GV, manager, admin
router.patch('/:id/status', requireRole('lecturer', 'manager', 'admin'), updateProjectStatus)

// Gán GV hướng dẫn — chỉ staff
router.patch('/:id/supervisor', requireRole('lecturer', 'manager', 'admin'), assignSupervisor)

// Xóa (soft) — SV owner hoặc staff
router.delete('/:id', deleteProject)

export default router
