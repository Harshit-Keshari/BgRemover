import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/mongoDb.js';
import userRouter from './routes/userRoutes.js';




// App config 
const PORT=process.env.PORT || 4000;

const app =express()
await connectDB()

// Middlewares 
app.use(express.json()) // for parsing
app.use(cors()) // to connect client running on different port

// API routes
app.use('/api/user',userRouter)
app.get('/',(req,res)=>{res.send("API Working")})


// app.listen(PORT,()=>{
//     console.log(`Running on PORT: http://localhost:${PORT} `)
// });

export default app;