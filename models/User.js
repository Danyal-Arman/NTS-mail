import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        minlength: 3,
        maxlenght: 20,
    },
    email: {
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        match: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/
    },

    password: {
        type: String,
        require: true,
        minlength: 8 
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    
    avatar: String,  
    resetPasswordToken: String,
    resetPasswordTokenExpires:Date,
    verificationCode:String,
    verificationCodeExpire:Date,
    emailVerified:{type:Boolean, default: false},

}, { timestamps: true })
export const User = mongoose.model('User', userSchema)