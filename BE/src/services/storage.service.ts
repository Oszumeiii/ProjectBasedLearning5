import { Client } from 'minio'
import {
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
  MINIO_PUBLIC_URL
} from '../config/env.js'

const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY
})

const BUCKET = MINIO_BUCKET

// ─── Bucket ───

export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET)
  if (!exists) {
    await minioClient.makeBucket(BUCKET)
    console.log(`✅ MinIO bucket "${BUCKET}" created`)
  }
}

// ─── Upload ───

export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await minioClient.putObject(BUCKET, key, buffer, buffer.length, {
    'Content-Type': contentType
  })
  return key
}

// ─── Presigned download URL ───

export async function getPresignedUrl(key: string, expirySeconds = 3600): Promise<string> {
  const presigned = await minioClient.presignedGetObject(BUCKET, key, expirySeconds)

  if (!MINIO_PUBLIC_URL) return presigned

  try {
    const source = new URL(presigned)
    const target = new URL(MINIO_PUBLIC_URL)
    source.protocol = target.protocol
    source.hostname = target.hostname
    source.port = target.port
    return source.toString()
  } catch {
    return presigned
  }
}

// ─── Download raw buffer ───

export async function downloadFile(key: string): Promise<Buffer> {
  const stream = await minioClient.getObject(BUCKET, key)
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

// ─── Delete ───

export async function deleteFile(key: string): Promise<void> {
  await minioClient.removeObject(BUCKET, key)
}
