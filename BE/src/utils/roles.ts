import type { UserRole } from './jwt'

/** GV / trưởng khoa (manager) / admin — thao tác chuyên môn & kiểm duyệt */
export const STAFF_ROLES: readonly UserRole[] = ['lecturer', 'manager', 'admin']

/** Xem và can thiệp mọi lớp học phần (không chỉ lớp do mình làm chủ nhiệm) */
export const COURSE_MODERATOR_ROLES: readonly UserRole[] = ['admin', 'manager']

export function isStaff(role: UserRole): boolean {
  return STAFF_ROLES.includes(role)
}

export function isCourseModerator(role: UserRole): boolean {
  return COURSE_MODERATOR_ROLES.includes(role)
}
