/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function ensureAssignment(client, courseId, createdBy, title, data) {
  const existing = await client.query(
    `SELECT id FROM assignments WHERE course_id = $1 AND title = $2 AND deleted_at IS NULL LIMIT 1`,
    [courseId, title]
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await client.query(
    `INSERT INTO assignments
      (course_id, title, description, assignment_type, deadline, max_score, attachments, allow_late_submission, late_penalty_percent, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING id`,
    [
      courseId,
      title,
      data.description,
      data.assignmentType,
      data.deadline,
      data.maxScore,
      JSON.stringify(data.attachments || []),
      Boolean(data.allowLateSubmission),
      Number(data.latePenaltyPercent || 0),
      createdBy,
    ]
  );
  return inserted.rows[0].id;
}

async function ensureSubmission(client, assignmentId, studentId, patch) {
  await client.query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, status, submitted_at, is_late, score, feedback, submission_count)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (assignment_id, student_id)
     DO UPDATE SET
       status = EXCLUDED.status,
       submitted_at = EXCLUDED.submitted_at,
       is_late = EXCLUDED.is_late,
       score = EXCLUDED.score,
       feedback = EXCLUDED.feedback,
       submission_count = EXCLUDED.submission_count,
       updated_at = NOW()`,
    [
      assignmentId,
      studentId,
      patch.status,
      patch.submittedAt || null,
      Boolean(patch.isLate),
      patch.score ?? null,
      patch.feedback ?? null,
      patch.submissionCount ?? 0,
    ]
  );
}

async function ensurePost(client, courseId, authorId, content, isPinned = false) {
  const existing = await client.query(
    `SELECT id FROM class_posts WHERE course_id = $1 AND author_id = $2 AND content = $3 AND deleted_at IS NULL LIMIT 1`,
    [courseId, authorId, content]
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const inserted = await client.query(
    `INSERT INTO class_posts (course_id, author_id, content, is_pinned)
     VALUES ($1,$2,$3,$4)
     RETURNING id`,
    [courseId, authorId, content, isPinned]
  );
  return inserted.rows[0].id;
}

async function ensureComment(client, postId, authorId, content) {
  const existing = await client.query(
    `SELECT id FROM class_post_comments WHERE post_id = $1 AND author_id = $2 AND content = $3 AND deleted_at IS NULL LIMIT 1`,
    [postId, authorId, content]
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const inserted = await client.query(
    `INSERT INTO class_post_comments (post_id, author_id, content)
     VALUES ($1,$2,$3)
     RETURNING id`,
    [postId, authorId, content]
  );
  return inserted.rows[0].id;
}

async function main() {
  const migrationPath = path.join(__dirname, 'src', 'migration', '003_assignments_system.sql');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (fs.existsSync(migrationPath)) {
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      await client.query(migrationSql);
    }

    const coursesRes = await client.query(
      `SELECT id, lecturer_id FROM courses WHERE deleted_at IS NULL ORDER BY id ASC LIMIT 4`
    );

    for (const course of coursesRes.rows) {
      const studentsRes = await client.query(
        `SELECT student_id FROM enrollments WHERE course_id = $1 AND status = 'active' ORDER BY student_id ASC LIMIT 6`,
        [course.id]
      );
      if (studentsRes.rows.length === 0) continue;

      const a1 = await ensureAssignment(client, course.id, course.lecturer_id, 'Báo cáo tiến độ Sprint 1', {
        description: 'Nộp báo cáo tiến độ gồm phân tích yêu cầu, thiết kế dữ liệu và demo chức năng chính.',
        assignmentType: 'report',
        deadline: daysFromNow(7),
        maxScore: 10,
        attachments: [{ name: 'Huong_dan_Sprint_1.pdf', size: '420 KB' }],
      });
      const a2 = await ensureAssignment(client, course.id, course.lecturer_id, 'Bài tập thiết kế cơ sở dữ liệu', {
        description: 'Thiết kế ERD và mô tả lược đồ dữ liệu cho đề tài hiện tại.',
        assignmentType: 'exercise',
        deadline: daysFromNow(12),
        maxScore: 10,
      });
      const a3 = await ensureAssignment(client, course.id, course.lecturer_id, 'Demo giữa kỳ', {
        description: 'Chuẩn bị slide và video demo tiến độ nhóm giữa kỳ.',
        assignmentType: 'project',
        deadline: daysFromNow(18),
        maxScore: 20,
      });

      for (let i = 0; i < studentsRes.rows.length; i += 1) {
        const studentId = studentsRes.rows[i].student_id;
        await ensureSubmission(client, a1, studentId, {
          status: i < 2 ? 'graded' : i < 4 ? 'submitted' : 'not_submitted',
          submittedAt: i < 4 ? daysFromNow(-(i + 1)) : null,
          isLate: false,
          score: i < 2 ? 7 + i : null,
          feedback: i < 2 ? 'Bài làm tốt, cần rõ hơn phần rủi ro triển khai.' : null,
          submissionCount: i < 4 ? 1 : 0,
        });
        await ensureSubmission(client, a2, studentId, {
          status: i === 0 ? 'late' : 'not_submitted',
          submittedAt: i === 0 ? daysFromNow(-2) : null,
          isLate: i === 0,
          score: null,
          feedback: null,
          submissionCount: i === 0 ? 1 : 0,
        });
        await ensureSubmission(client, a3, studentId, {
          status: 'not_submitted',
          submittedAt: null,
          isLate: false,
          score: null,
          feedback: null,
          submissionCount: 0,
        });
      }

      const postId = await ensurePost(
        client,
        course.id,
        course.lecturer_id,
        'Chào mừng các bạn. Tuần này ưu tiên hoàn thiện báo cáo tiến độ Sprint 1 và cập nhật tiến độ nhóm.',
        true
      );
      const announceId = await ensurePost(
        client,
        course.id,
        course.lecturer_id,
        'Nhắc hạn nộp: Bài tập thiết kế cơ sở dữ liệu sẽ khóa sau deadline, các bạn kiểm tra lại file trước khi nộp.',
        false
      );

      await ensureComment(client, postId, course.lecturer_id, 'Nếu có vướng mắc kỹ thuật, hỏi trực tiếp trong bài đăng này.');
      await ensureComment(client, announceId, studentsRes.rows[0].student_id, 'Em đã cập nhật tiến độ và sẽ nộp trước hạn ạ.');
    }

    await client.query('COMMIT');
    console.log('✅ Seeded real assignment data successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed assignment data failed:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
