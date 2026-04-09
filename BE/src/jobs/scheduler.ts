import cron from 'node-cron'
import pool from '../config/db'
import { createNotification, createBulkNotifications, type NotificationInput } from '../utils/notification.js'

/**
 * Chạy mỗi ngày lúc 08:00 AM
 * 1. Đánh dấu milestones quá hạn → status = 'overdue'
 * 2. Gửi thông báo cho SV có milestone sắp hết hạn (trong 3 ngày)
 * 3. Gửi thông báo deadline nộp báo cáo sắp đến (courses.submission_end)
 */

async function markOverdueMilestones(): Promise<number> {
  const result = await pool.query(
    `UPDATE progress_tracking SET status = 'overdue'
     WHERE status IN ('pending', 'in_progress')
       AND due_date < CURRENT_DATE
     RETURNING id, project_id`
  )

  if (result.rows.length === 0) return 0

  // Thông báo cho SV chủ project
  const projectIds = [...new Set(result.rows.map((r) => r.project_id as number))]

  for (const pid of projectIds) {
    const proj = await pool.query(
      'SELECT student_id, title FROM projects WHERE id = $1', [pid]
    )
    if (proj.rows.length === 0) continue

    const overdueCount = result.rows.filter((r) => r.project_id === pid).length

    await createNotification({
      userId: proj.rows[0].student_id,
      type: 'milestone.overdue',
      title: 'Milestone quá hạn',
      message: `Đề tài "${proj.rows[0].title}" có ${overdueCount} milestone đã quá hạn.`,
      refType: 'project', refId: pid
    })
  }

  return result.rowCount ?? 0
}

async function remindUpcomingMilestones(): Promise<number> {
  // Milestones hết hạn trong 3 ngày tới, chưa hoàn thành
  const result = await pool.query(
    `SELECT pt.id, pt.milestone, pt.due_date, pt.project_id,
            p.student_id, p.title AS project_title
     FROM progress_tracking pt
     JOIN projects p ON p.id = pt.project_id
     WHERE pt.status IN ('pending', 'in_progress')
       AND pt.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
       AND p.deleted_at IS NULL`
  )

  const notifications: NotificationInput[] = result.rows.map((row) => ({
    userId: row.student_id as number,
    type: 'milestone.deadline_reminder',
    title: 'Nhắc nhở deadline milestone',
    message: `Milestone "${row.milestone}" trong đề tài "${row.project_title}" sẽ hết hạn vào ${new Date(row.due_date).toLocaleDateString('vi-VN')}.`,
    refType: 'project' as const,
    refId: row.project_id as number
  }))

  return await createBulkNotifications(notifications)
}

async function remindSubmissionDeadlines(): Promise<number> {
  // Courses có submission_end trong 7 ngày tới
  const result = await pool.query(
    `SELECT c.id AS course_id, c.name AS course_name, c.submission_end,
            e.student_id
     FROM courses c
     JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
     WHERE c.submission_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
       AND c.deleted_at IS NULL AND c.is_active = TRUE`
  )

  const notifications: NotificationInput[] = result.rows.map((row) => ({
    userId: row.student_id as number,
    type: 'deadline.submission_reminder',
    title: 'Nhắc nhở nộp báo cáo',
    message: `Hạn nộp báo cáo lớp "${row.course_name}" là ${new Date(row.submission_end).toLocaleDateString('vi-VN')}.`,
    refType: 'course' as const,
    refId: row.course_id as number
  }))

  return await createBulkNotifications(notifications)
}

async function notifyPlagiarismFlagged(): Promise<number> {
  // Plagiarism checks flagged/rejected trong 24h qua mà chưa thông báo
  const result = await pool.query(
    `SELECT pc.id, pc.report_id, pc.verdict, pc.plagiarism_rate,
            r.title AS report_title, r.author_id
     FROM plagiarism_checks pc
     JOIN reports r ON r.id = pc.report_id
     WHERE pc.verdict IN ('flagged', 'rejected')
       AND pc.checked_at > NOW() - INTERVAL '24 hours'
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.ref_type = 'report' AND n.ref_id = pc.report_id
           AND n.type = 'plagiarism.flagged' AND n.created_at > NOW() - INTERVAL '24 hours'
       )`
  )

  const notifications: NotificationInput[] = result.rows.map((row) => ({
    userId: row.author_id as number,
    type: 'plagiarism.flagged',
    title: row.verdict === 'rejected' ? 'Báo cáo bị từ chối do đạo văn' : 'Cảnh báo đạo văn',
    message: `Báo cáo "${row.report_title}" có tỷ lệ đạo văn ${row.plagiarism_rate}% (${row.verdict}).`,
    refType: 'report' as const,
    refId: row.report_id as number
  }))

  return await createBulkNotifications(notifications)
}

export function startScheduler(): void {
  // Mỗi ngày lúc 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ [Scheduler] Running daily jobs...')

    try {
      const overdue = await markOverdueMilestones()
      console.log(`  ✅ Marked ${overdue} milestones as overdue`)

      const milestoneReminders = await remindUpcomingMilestones()
      console.log(`  ✅ Sent ${milestoneReminders} milestone deadline reminders`)

      const submissionReminders = await remindSubmissionDeadlines()
      console.log(`  ✅ Sent ${submissionReminders} submission deadline reminders`)

      const plagiarism = await notifyPlagiarismFlagged()
      console.log(`  ✅ Sent ${plagiarism} plagiarism notifications`)
    } catch (err) {
      console.error('❌ [Scheduler] Error:', err)
    }

    console.log('⏰ [Scheduler] Daily jobs complete.')
  })

  console.log('⏰ Scheduler started — daily jobs at 08:00 AM')
}
