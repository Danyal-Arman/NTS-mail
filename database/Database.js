import mongoose from 'mongoose'

const ConnectDB = async()=>{
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("connected to database successfully")
  } catch (error) {
    console.error("Database connection error", error)
  }
}
export default ConnectDB;