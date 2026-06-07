/**
 * Đẩy 10 (hoặc tất cả) file PDF trong một thư mục lên MinIO, tạo bản ghi reports,
 * và đưa vào hàng đợi Redis để worker-python xử lý (embedding + Pinecone + Supabase).
 *
 * Chuẩn bị:
 *   1. Đặt các file .pdf vào thư mục (mặc định BE/seed_pdfs/)
 *   2. Redis, MinIO, PostgreSQL chạy; .env của BE đủ MINIO_*, REDIS_URL, DB_*
 *   3. node seed-demo-data.cjs (để có demo.student1 + lớp DEMO-PBL-WEB-2026)
 *   4. Chạy worker: cd worker-python && python main.py
 *
 * Usage:
 *   node seed-reports-from-pdf-files.cjs
 *   node seed-reports-from-pdf-files.cjs "D:\\path\\to\\folder"
 *   node seed-reports-from-pdf-files.cjs --limit=5 ./my_pdfs
 */
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const { createClient } = require('redis')
const Minio = require('minio')
require('./node_modules/dotenv').config({ path: path.resolve(__dirname, '.env') })
const { Pool } = require('./node_modules/pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
})

function parseArgs(argv) {
  let dir = path.join(__dirname, 'seed_pdfs')
  let limit = 10
  const rest = []
  for (const a of argv.slice(2)) {
    if (a.startsWith('--limit=')) limit = Math.max(1, parseInt(a.slice('--limit='.length), 10) || 10)
    else if (!a.startsWith('--')) rest.push(a)
  }
  if (rest[0]) dir = path.resolve(rest[0])
  return { dir, limit }
}

async function ensurePdfFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Thư mục không tồn tại: ${dir}\nTạo thư mục và copy PDF vào, hoặc truyền đường dẫn đầu tiên.`)
  }
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort()
  return files.map((f) => path.join(dir, f))
}

function sha256Buffer(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

async function main() {
  const { dir, limit } = parseArgs(process.argv)
  const pdfPaths = (await ensurePdfFiles(dir)).slice(0, limit)
  if (pdfPaths.length === 0) {
    throw new Error(`Không tìm thấy file .pdf trong: ${dir}`)
  }

  const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  })
  const bucket = process.env.MINIO_BUCKET || 'edurag-reports'

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  const redis = createClient({ url: redisUrl })
  await redis.connect()

  const client = await pool.connect()
  const created = []

  try {
    const student = await client.query(
      "SELECT id FROM users WHERE email = 'demo.student1@edurag.local' LIMIT 1"
    )
    if (!student.rows[0]) {
      throw new Error('Chạy trước: node seed-demo-data.cjs')
    }
    const authorId = student.rows[0].id

    const course = await client.query(
      "SELECT id FROM courses WHERE code = 'DEMO-PBL-WEB-2026' AND deleted_at IS NULL LIMIT 1"
    )
    if (!course.rows[0]) {
      throw new Error("Không có lớp DEMO-PBL-WEB-2026. Chạy: node seed-demo-data.cjs")
    }
    const courseId = course.rows[0].id

    const lecturer = await client.query(
      "SELECT id FROM users WHERE email = 'demo.lecturer1@edurag.local' LIMIT 1"
    )
    const reviewedBy = lecturer.rows[0]?.id || authorId

    const bucketExists = await minioClient.bucketExists(bucket)
    if (!bucketExists) {
      await minioClient.makeBucket(bucket)
    }

    await client.query('BEGIN')

    for (const absPath of pdfPaths) {
      const buf = fs.readFileSync(absPath)
      const fileHash = sha256Buffer(buf)
      const baseName = path.basename(absPath)
      const title = `[Upload] ${path.basename(absPath, '.pdf')}`

      const dup = await client.query(
        'SELECT id FROM reports WHERE file_hash = $1 AND deleted_at IS NULL LIMIT 1',
        [fileHash]
      )
      if (dup.rows[0]) {
        console.log(`⏭️  Bỏ qua (trùng file_hash): ${baseName} → report #${dup.rows[0].id}`)
        continue
      }

      const now = new Date()
      const key = `reports/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${fileHash}.pdf`
      await minioClient.putObject(bucket, key, buf, buf.length, { 'Content-Type': 'application/pdf' })

      const ins = await client.query(
        `INSERT INTO reports (
          title, description, author_id, course_id,
          file_url, file_name, file_size, file_type, file_hash,
          visibility, status, embedding_status,
          reviewed_by, review_note, submitted_at, approved_at
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8, $9,
          'public', 'approved', 'pending',
          $10, $11, NOW(), NOW()
        ) RETURNING id`,
        [
          title,
          `Tạo tự động từ file: ${baseName}`,
          authorId,
          courseId,
          key,
          baseName,
          buf.length,
          'pdf',
          fileHash,
          reviewedBy,
          'Import hàng loạt từ seed-reports-from-pdf-files.cjs',
        ]
      )
      const reportId = ins.rows[0].id

      await client.query(
        `INSERT INTO report_versions (
          report_id, version_number, content, file_url, file_size, file_hash, change_summary, created_by
        ) VALUES ($1, 1, NULL, $2, $3, $4, $5, $6)`,
        [reportId, key, buf.length, fileHash, 'Import PDF seed', authorId]
      )

      await redis.rPush(
        'pdf_processing_queue',
        JSON.stringify({
          report_id: reportId,
          file_key: key,
          file_type: 'pdf',
        })
      )

      created.push({ id: reportId, title, file: baseName, minioKey: key })
      console.log(`✅ Report #${reportId} + queue: ${baseName}`)
    }

    await client.query('COMMIT')

    console.log(
      JSON.stringify(
        {
          ok: true,
          folder: dir,
          count: created.length,
          reports: created,
          next: 'Chạy worker-python: python main.py (hoặc python -m src ở thư mục worker)',
        },
        null,
        2
      )
    )
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
    await redis.quit()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
