import express from 'express'
import cors from 'cors'

import { CLIENT_URL } from './config/env'
import authRoutes from './routes/auth.routes'
import adminRoutes from './routes/admin.routes'
import reportRoutes from './routes/report.routes'
import ragRoutes from './routes/rag.routes'
import statsRoutes from './routes/stats.routes'
import userRoutes from './routes/user.routes'
import courseRoutes from './routes/course.routes'
import projectRoutes from './routes/project.routes'
import researchRoutes from './routes/research.routes'
import milestoneRoutes from './routes/milestone.routes'
import mentorshipRoutes from './routes/mentorship.routes'
import notificationRoutes from './routes/notification.routes'
import assignmentRoutes from './routes/assignment.routes'

const app = express()

const allowedOrigins = CLIENT_URL.split(',').map(origin => origin.trim()).filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Not allowed by CORS'))
  }
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/rag', ragRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/research-papers', researchRoutes)
app.use('/api/milestones', milestoneRoutes)
app.use('/api/mentorships', mentorshipRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/assignments', assignmentRoutes)

export default app
