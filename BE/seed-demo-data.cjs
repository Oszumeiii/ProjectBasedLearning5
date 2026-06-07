const path = require('path')
require('./node_modules/dotenv').config({ path: path.resolve(__dirname, '.env') })
const { Pool } = require('./node_modules/pg')
const bcrypt = require('./node_modules/bcryptjs')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

async function hasColumn(client, table, column) {
  const q = await client.query(
    'SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2 LIMIT 1',
    [table, column]
  )
  return q.rows.length > 0
}

async function getUserByEmail(client, email) {
  const r = await client.query('SELECT id, email, full_name, role FROM users WHERE email = $1 LIMIT 1', [email])
  return r.rows[0] || null
}

async function ensureUser(client, data) {
  const existing = await getUserByEmail(client, data.email)
  if (existing) return existing

  const passwordHash = bcrypt.hashSync(data.password, 10)
  const r = await client.query(
    `INSERT INTO users (
      email, password_hash, full_name, role, student_code, class_name,
      major, department, academic_title, specialization,
      is_active, is_verified, account_status, source
    ) VALUES (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,
      TRUE, TRUE, 'active', 'manual'
    ) RETURNING id, email, full_name, role`,
    [
      data.email,
      passwordHash,
      data.full_name,
      data.role,
      data.student_code || null,
      data.class_name || null,
      data.major || null,
      data.department || null,
      data.academic_title || null,
      data.specialization || null,
    ]
  )
  return r.rows[0]
}

async function ensureCourse(client, data, opts) {
  const existing = await client.query('SELECT id, name, code FROM courses WHERE code = $1 AND deleted_at IS NULL LIMIT 1', [data.code])
  if (existing.rows[0]) return existing.rows[0]

  const fields = [
    'name', 'code', 'description', 'semester', 'academic_year', 'course_type',
    'lecturer_id', 'created_by', 'max_students', 'is_active'
  ]
  const values = [
    data.name,
    data.code,
    data.description,
    data.semester,
    data.academic_year,
    data.course_type,
    data.lecturer_id,
    data.created_by,
    data.max_students,
    true,
  ]
  if (opts.hasEnrollmentCode) {
    fields.splice(8, 0, 'enrollment_code')
    values.splice(8, 0, data.enrollment_code)
  }
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ')
  const sql = `INSERT INTO courses (${fields.join(', ')}) VALUES (${placeholders}) RETURNING id, name, code`
  const r = await client.query(sql, values)
  return r.rows[0]
}

async function ensureCourseLecturer(client, courseId, lecturerId, role) {
  await client.query(
    `INSERT INTO course_lecturers (course_id, lecturer_id, role_in_course)
     VALUES ($1, $2, $3)
     ON CONFLICT (course_id, lecturer_id, role_in_course) DO NOTHING`,
    [courseId, lecturerId, role]
  )
}

async function ensureEnrollment(client, courseId, studentId, status, grade, score) {
  await client.query(
    `INSERT INTO enrollments (course_id, student_id, status, final_grade, final_score)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (course_id, student_id)
     DO UPDATE SET status = EXCLUDED.status, final_grade = EXCLUDED.final_grade, final_score = EXCLUDED.final_score`,
    [courseId, studentId, status, grade || null, score || null]
  )
}

async function ensureCriterion(client, courseId, name, weight, orderIndex) {
  const existing = await client.query(
    'SELECT id FROM evaluation_criteria WHERE course_id = $1 AND name = $2 LIMIT 1',
    [courseId, name]
  )
  if (existing.rows[0]) return existing.rows[0]
  const r = await client.query(
    `INSERT INTO evaluation_criteria (course_id, name, description, weight, max_score, order_index)
     VALUES ($1, $2, $3, $4, 10, $5)
     RETURNING id`,
    [courseId, name, `Tiêu chí demo cho ${name}`, weight, orderIndex]
  )
  return r.rows[0]
}

async function ensureProject(client, data) {
  const existing = await client.query(
    'SELECT id FROM projects WHERE title = $1 AND student_id = $2 LIMIT 1',
    [data.title, data.student_id]
  )
  if (existing.rows[0]) return existing.rows[0]
  const r = await client.query(
    `INSERT INTO projects (title, description, student_id, course_id, supervisor_id, start_date, end_date, status, tags)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      data.title,
      data.description,
      data.student_id,
      data.course_id,
      data.supervisor_id,
      data.start_date,
      data.end_date,
      data.status,
      data.tags,
    ]
  )
  return r.rows[0]
}

async function ensureNotification(client, userId, type, title, message, refType, refId) {
  const existing = await client.query(
    'SELECT id FROM notifications WHERE user_id = $1 AND type = $2 AND title = $3 LIMIT 1',
    [userId, type, title]
  )
  if (existing.rows[0]) return
  await client.query(
    `INSERT INTO notifications (user_id, type, title, message, ref_type, ref_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, type, title, message, refType || null, refId || null]
  )
}

async function ensureResource(client, title, url, category, courseType, uploadedBy) {
  const existing = await client.query('SELECT id FROM resources WHERE title = $1 LIMIT 1', [title])
  if (existing.rows[0]) return
  await client.query(
    `INSERT INTO resources (title, description, url, category, course_type, uploaded_by, is_public)
     VALUES ($1,$2,$3,$4,$5,$6,TRUE)`,
    [title, `Tài nguyên demo: ${title}`, url, category, courseType, uploadedBy]
  )
}

async function main() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const opts = {
      hasEnrollmentCode: await hasColumn(client, 'courses', 'enrollment_code'),
    }

    const users = {}
    users.manager = await ensureUser(client, {
      email: 'demo.manager@edurag.local',
      password: 'Demo@123',
      full_name: 'Demo Manager',
      role: 'manager',
      department: 'Computer Science',
      academic_title: 'ThS',
      specialization: 'Academic Operations',
    })
    users.lecturer1 = await ensureUser(client, {
      email: 'demo.lecturer1@edurag.local',
      password: 'Demo@123',
      full_name: 'Nguyen Van Huong',
      role: 'lecturer',
      department: 'Computer Science',
      academic_title: 'TS',
      specialization: 'Software Engineering',
    })
    users.lecturer2 = await ensureUser(client, {
      email: 'demo.lecturer2@edurag.local',
      password: 'Demo@123',
      full_name: 'Tran Thi Reviewer',
      role: 'lecturer',
      department: 'Computer Science',
      academic_title: 'ThS',
      specialization: 'Data Science',
    })
    users.student1 = await ensureUser(client, {
      email: 'demo.student1@edurag.local',
      password: 'Demo@123',
      full_name: 'Le Minh Anh',
      role: 'student',
      student_code: 'DEMO001',
      class_name: 'CNTT2022A',
      major: 'Software Engineering',
      department: 'Computer Science',
    })
    users.student2 = await ensureUser(client, {
      email: 'demo.student2@edurag.local',
      password: 'Demo@123',
      full_name: 'Pham Gia Bao',
      role: 'student',
      student_code: 'DEMO002',
      class_name: 'CNTT2022A',
      major: 'Software Engineering',
      department: 'Computer Science',
    })
    users.student3 = await ensureUser(client, {
      email: 'demo.student3@edurag.local',
      password: 'Demo@123',
      full_name: 'Vo Thanh Nhan',
      role: 'student',
      student_code: 'DEMO003',
      class_name: 'CNTT2022B',
      major: 'Information Systems',
      department: 'Computer Science',
    })
    users.student4 = await ensureUser(client, {
      email: 'demo.student4@edurag.local',
      password: 'Demo@123',
      full_name: 'Hoang Thu Linh',
      role: 'student',
      student_code: 'DEMO004',
      class_name: 'CNTT2022B',
      major: 'Data Science',
      department: 'Computer Science',
    })

    const course1 = await ensureCourse(client, {
      name: 'Project-Based Learning - Web Education Platform',
      code: 'DEMO-PBL-WEB-2026',
      description: 'Lớp demo cho luồng quản lý course, enrollment, evaluation criteria.',
      semester: 'HK2-2026',
      academic_year: '2025-2026',
      course_type: 'project',
      lecturer_id: users.lecturer1.id,
      created_by: users.manager.id,
      enrollment_code: 'PBL526',
      max_students: 40,
    }, opts)

    const course2 = await ensureCourse(client, {
      name: 'Research Methods for AI Education',
      code: 'DEMO-RES-AI-2026',
      description: 'Lớp demo cho nghiên cứu, phản biện và tiêu chí chấm.',
      semester: 'HK2-2026',
      academic_year: '2025-2026',
      course_type: 'research',
      lecturer_id: users.lecturer2.id,
      created_by: users.manager.id,
      enrollment_code: 'RAG826',
      max_students: 35,
    }, opts)

    await ensureCourseLecturer(client, course1.id, users.lecturer1.id, 'supervisor')
    await ensureCourseLecturer(client, course1.id, users.lecturer2.id, 'reviewer')
    await ensureCourseLecturer(client, course2.id, users.lecturer2.id, 'supervisor')
    await ensureCourseLecturer(client, course2.id, users.lecturer1.id, 'committee')

    await ensureEnrollment(client, course1.id, users.student1.id, 'active', 'A', 9.1)
    await ensureEnrollment(client, course1.id, users.student2.id, 'active', 'B+', 8.3)
    await ensureEnrollment(client, course1.id, users.student3.id, 'pending', null, null)
    await ensureEnrollment(client, course2.id, users.student4.id, 'active', 'A', 9.0)
    await ensureEnrollment(client, course2.id, users.student2.id, 'active', 'B', 7.8)

    await ensureCriterion(client, course1.id, 'Phân tích yêu cầu', 30, 1)
    await ensureCriterion(client, course1.id, 'Chất lượng triển khai', 40, 2)
    await ensureCriterion(client, course1.id, 'Báo cáo và thuyết trình', 30, 3)
    await ensureCriterion(client, course2.id, 'Tổng quan tài liệu', 25, 1)
    await ensureCriterion(client, course2.id, 'Phương pháp nghiên cứu', 35, 2)
    await ensureCriterion(client, course2.id, 'Kết quả và thảo luận', 40, 3)

    const project1 = await ensureProject(client, {
      title: 'EduRAG Classroom Workflow Optimization',
      description: 'Tối ưu luồng tham gia lớp, duyệt ghi danh và chấm điểm cho nền tảng giáo dục.',
      student_id: users.student1.id,
      course_id: course1.id,
      supervisor_id: users.lecturer1.id,
      start_date: '2026-03-01',
      end_date: '2026-06-20',
      status: 'in_progress',
      tags: ['education', 'workflow', 'react', 'express'],
    })

    const project2 = await ensureProject(client, {
      title: 'AI Research Support for Student Reports',
      description: 'Đề tài demo về tìm kiếm ngữ nghĩa và hỗ trợ nghiên cứu học thuật.',
      student_id: users.student4.id,
      course_id: course2.id,
      supervisor_id: users.lecturer2.id,
      start_date: '2026-03-05',
      end_date: '2026-07-01',
      status: 'approved',
      tags: ['rag', 'research', 'ai'],
    })

    await ensureNotification(
      client,
      users.student3.id,
      'course.enrollment.pending',
      'Yêu cầu ghi danh đang chờ duyệt',
      'Yêu cầu tham gia lớp Project-Based Learning của bạn đang chờ giảng viên duyệt.',
      'course',
      course1.id
    )
    await ensureNotification(
      client,
      users.lecturer1.id,
      'course.enrollment.pending',
      'Có sinh viên chờ duyệt',
      'Lớp Project-Based Learning - Web Education Platform có sinh viên đang chờ duyệt.',
      'course',
      course1.id
    )
    await ensureNotification(
      client,
      users.student1.id,
      'project.progress',
      'Đề tài đang được theo dõi',
      'Đề tài EduRAG Classroom Workflow Optimization đã được gán giảng viên hướng dẫn.',
      'project',
      project1.id
    )

    await ensureResource(
      client,
      'Project Report Template 2026',
      'https://example.com/resources/project-report-template-2026',
      'template',
      'project',
      users.manager.id
    )
    await ensureResource(
      client,
      'Research Rubric Sample',
      'https://example.com/resources/research-rubric-sample',
      'rubric',
      'research',
      users.manager.id
    )

    await client.query('COMMIT')

    console.log(
      JSON.stringify(
        {
          ok: true,
          login: {
            manager: 'demo.manager@edurag.local / Demo@123',
            lecturer: 'demo.lecturer1@edurag.local / Demo@123',
            student: 'demo.student1@edurag.local / Demo@123'
          },
          createdOrUpdated: {
            users: 7,
            courses: [course1.code, course2.code],
            projects: [project1.id, project2.id]
          }
        },
        null,
        2
      )
    )
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
