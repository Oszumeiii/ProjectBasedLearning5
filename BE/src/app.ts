import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.routes'
import reportRoutes from './routes/report.routes'
import ragRoutes from './routes/rag.routes'
import statsRoutes from './routes/stats.routes'
import userRoutes from './routes/user.routes'
import courseRoutes from './routes/course.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/rag', ragRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)

export default app
