import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import connectDB from './config/mongoDb.js'
import userRouter from './routes/userRoutes.js'
import { clerkWebhooks } from './controllers/userController.js' // ✅ import controller

// Initialize app
const app = express()
app.use(cors())

// 🧩 Apply raw body ONLY for Clerk webhooks
app.post('/api/user/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  clerkWebhooks
)

// Apply express.json() for all other routes
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

// Local dev only (Vercel auto handles serverless invocation)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

export default app
