import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import connectDB from './config/mongoDb.js'
import userRouter from './routes/userRoutes.js'

// Initialize app
const app = express()
app.use(cors())

// 👇 Apply raw body only for Clerk webhooks
app.use('/api/user/webhooks', bodyParser.raw({ type: 'application/json' }))

// 👇 Then normal JSON parser for all other routes
app.use(express.json())

// Routes
app.get('/', (req, res) => res.send('API Working ✅'))
app.use('/api/user', userRouter)

// Connect DB safely
const init = async () => {
  try {
    await connectDB()
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
  }
}

init()

// Local dev only (Vercel handles production automatically)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

export default app
