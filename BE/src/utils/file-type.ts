export interface DetectedFileType {
  mime: string
  ext: 'pdf' | 'docx' | 'zip'
  dbType: 'pdf' | 'docx' | 'zip'
}

/**
 * Detect real file type from magic bytes — does NOT trust the file extension.
 * Supports: PDF (%PDF), DOCX (PK + word/ entry), ZIP (PK).
 */
export function detectFileType(buffer: Buffer): DetectedFileType | null {
  if (buffer.length < 4) return null

  // PDF: starts with %PDF (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mime: 'application/pdf', ext: 'pdf', dbType: 'pdf' }
  }

  // ZIP-based: starts with PK\x03\x04
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    const searchArea = buffer.subarray(0, Math.min(buffer.length, 30000)).toString('binary')
    if (searchArea.includes('word/document.xml') || searchArea.includes('word/')) {
      return {
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ext: 'docx',
        dbType: 'docx'
      }
    }
    return { mime: 'application/zip', ext: 'zip', dbType: 'zip' }
  }

  return null
}
