import pool from '../config/db'

export interface NotificationInput {
  userId: number
  type: string
  title: string
  message: string
  refType?: 'report' | 'project' | 'course' | 'feedback' | 'user' | null
  refId?: number | null
  channels?: string[]
}

export async function createNotification(input: NotificationInput): Promise<number | null> {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, ref_type, ref_id, channels, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [
        input.userId,
        input.type,
        input.title,
        input.message,
        input.refType ?? null,
        input.refId ?? null,
        input.channels ?? ['in_app']
      ]
    )
    return result.rows[0]?.id ?? null
  } catch (err) {
    console.error('❌ createNotification error:', (err as Error).message)
    return null
  }
}

export async function createBulkNotifications(inputs: NotificationInput[]): Promise<number> {
  if (inputs.length === 0) return 0
  let count = 0
  for (const input of inputs) {
    const id = await createNotification(input)
    if (id) count++
  }
  return count
}
