import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/mongoDb.js';
import userRouter from './routes/userRoutes.js';

await connectDB();
// App config 
const PORT=process.env.PORT || 4000;

const app =express()

// Middlewares 
app.use(express.json()) // for parsing
app.use(cors()) // to connect client running on different port
app.get('/',(req,res)=>{res.send("API Working")})

// API routes
app.use('/api/user',userRouter)

if(process.env.NODE_ENV !=='production'){
    app.listen(PORT , (err)=>{
        if(!err){
            console.log(`server is running on ${PORT}`);
        }
    })
}

// app.listen(PORT,()=>{
//     console.log(`Running on PORT: http://localhost:${PORT} `)
// });

export default app;