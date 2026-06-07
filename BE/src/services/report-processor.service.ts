import pool from '../config/db.js'
import { downloadFile } from './storage.service.js'

/**
 * Background task: extract text from PDF/DOCX, update reports.content,
 * transition status  pending -> processing -> under_review.
 * Runs asynchronously after upload — the Node.js equivalent of a Celery task.
 *
 * pdf-parse and mammoth are loaded lazily to avoid crashing at startup
 * if optional dependencies are missing.
 */
export async function processReport(reportId: number, fileBuffer?: Buffer): Promise<void> {
  try {
    await pool.query(
      "UPDATE reports SET status = 'processing', embedding_status = 'processing' WHERE id = $1",
      [reportId]
    )

    const row = (await pool.query(
      'SELECT file_url, file_type FROM reports WHERE id = $1', [reportId]
    )).rows[0]

    if (!row) return

    const buffer = fileBuffer ?? (row.file_url ? await downloadFile(row.file_url) : null)
    if (!buffer) {
      await pool.query(
        "UPDATE reports SET status = 'pending', embedding_status = 'failed', embedding_error = $2 WHERE id = $1",
        [reportId, 'No file to process']
      )
      return
    }

    let content = ''

    if (row.file_type === 'pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      content = data.text
    } else if (row.file_type === 'docx') {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      content = result.value
    } else {
      await pool.query(
        "UPDATE reports SET status = 'under_review', embedding_status = 'pending' WHERE id = $1",
        [reportId]
      )
      return
    }

    await pool.query(
      "UPDATE reports SET content = $2, status = 'under_review', embedding_status = 'pending' WHERE id = $1",
      [reportId, content]
    )

    console.log(`✅ Report #${reportId} processed — ${content.length} chars extracted`)
  } catch (error) {
    console.error(`❌ Failed to process report #${reportId}:`, error)
    await pool.query(
      "UPDATE reports SET embedding_status = 'failed', embedding_error = $2 WHERE id = $1",
      [reportId, (error as Error).message]
    ).catch(() => {})
  }
}
