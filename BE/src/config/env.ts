import 'dotenv/config'

export const JWT_SECRET = process.env.JWT_SECRET
export const PORT = Number(process.env.PORT) || 3000

/** Chuỗi expiresIn của jsonwebtoken, ví dụ: 30m, 1h, 7d */
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h'

/** Sau N lần sai mật khẩu → khóa (mặc định khớp system_configs auth.max_failed_login) */
export const AUTH_MAX_FAILED_LOGIN = Number(process.env.AUTH_MAX_FAILED_LOGIN ?? '5')

/** Phút khóa tài khoản (mặc định khớp auth.lock_duration_minutes) */
export const AUTH_LOCK_DURATION_MINUTES = Number(process.env.AUTH_LOCK_DURATION_MINUTES ?? '30')

// ─── Email (SMTP) ───
export const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com'
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? '587')
export const SMTP_USER = process.env.SMTP_USER ?? ''
export const SMTP_PASS = process.env.SMTP_PASS ?? ''
export const SMTP_FROM = process.env.SMTP_FROM ?? `"EduRAG" <${SMTP_USER}>`

// ─── Refresh Token ───
/** Số ngày refresh token có hiệu lực (khớp system_configs auth.refresh_token_expire_days) */
export const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS ?? '30')

// ─── Password Reset ───
/** Số giờ token reset mật khẩu có hiệu lực */
export const PASSWORD_RESET_HOURS = Number(process.env.PASSWORD_RESET_HOURS ?? '1')

// ─── Activation ───
/** Số giờ token kích hoạt có hiệu lực */
export const ACTIVATION_TOKEN_HOURS = Number(process.env.ACTIVATION_TOKEN_HOURS ?? '24')

/** URL FE nhận link kích hoạt — FE sẽ gọi API /api/auth/activate */
export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000'

// ─── MinIO / S3 Storage ───
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? 'localhost'
export const MINIO_PORT = Number(process.env.MINIO_PORT ?? '9000')
export const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true'
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? 'minioadmin'
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? 'minioadmin'
export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'edurag-reports'

// ─── Upload ───
export const UPLOAD_MAX_SIZE_MB = Number(process.env.UPLOAD_MAX_SIZE_MB ?? '50')

if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not set. Please set it in your .env file.')
}

if (!SMTP_USER) {
  console.warn('⚠️ SMTP_USER is not set — activation emails will not be sent.')
}

