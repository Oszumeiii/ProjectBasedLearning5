import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number
      email: string
      role: 'student' | 'lecturer' | 'admin'
    }
  }
}

declare module 'bcryptjs'

