import nodemailer from 'nodemailer'
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} from '../config/env'

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
})

export interface MailOptions {
  to: string
  subject: string
  html: string
}

export async function sendMail(opts: MailOptions): Promise<boolean> {
  if (!SMTP_USER) {
    console.warn('⚠️ SMTP not configured — skipping email to', opts.to)
    return false
  }

  try {
    await transporter.sendMail({ from: SMTP_FROM, ...opts })
    return true
  } catch (err) {
    console.error('❌ sendMail error:', (err as Error).message)
    return false
  }
}

export function activationEmail(to: string, fullName: string, activationLink: string): MailOptions {
  return {
    to,
    subject: '[EduRAG] Kích hoạt tài khoản sinh viên',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#2563eb">Chào ${fullName},</h2>
        <p>Tài khoản EduRAG của bạn đã được tạo. Nhấn nút bên dưới để đặt mật khẩu và kích hoạt tài khoản:</p>
        <a href="${activationLink}"
           style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;
                  border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0">
          Kích hoạt tài khoản
        </a>
        <p style="font-size:13px;color:#64748b">
          Liên kết có hiệu lực 24 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="font-size:12px;color:#94a3b8">Đây là email tự động từ hệ thống EduRAG.</p>
      </div>
    `
  }
}

export function passwordResetEmail(to: string, fullName: string, resetLink: string): MailOptions {
  return {
    to,
    subject: '[EduRAG] Đặt lại mật khẩu',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#2563eb">Chào ${fullName},</h2>
        <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản EduRAG. Nhấn nút bên dưới để tiếp tục:</p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 28px;background:#dc2626;color:#fff;
                  border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0">
          Đặt lại mật khẩu
        </a>
        <p style="font-size:13px;color:#64748b">
          Liên kết có hiệu lực 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="font-size:12px;color:#94a3b8">Đây là email tự động từ hệ thống EduRAG.</p>
      </div>
    `
  }
}
