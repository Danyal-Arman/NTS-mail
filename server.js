import express from 'express'
import dotenv from 'dotenv'
import ConnectDB from './database/Database.js'
import cookieParser from 'cookie-parser'
import authRouter from './routes/authRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import userRouter from './routes/userRoutes.js'

const app = express()
const PORT = 6000

dotenv.config()
ConnectDB()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))

app.use("/auth",authRouter)
app.use("/message",messageRouter)
app.use("/user",userRouter)

app.listen(PORT, ()=>{
    console.log(`connected to the port ${PORT}`)
}) 