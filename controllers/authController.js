import { User } from "../models/User.js";
import bcrypt from 'bcrypt';
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    try {
    const { username, email, password } = req.body
        const normalizedEmail = email?.toLowerCase();

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const user = await User.findOne({ email: normalizedEmail })
        if (user) {
            return res.status(400).send({
                message: "Accout already existed"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            username,
            email: normalizedEmail,
            password: hashedPassword
        })

        let token = generateToken(newUser)
        await newUser.save()
        return res.status(201).cookie("token", token, {
            httpOnly: true,
            secure: true,
            samesite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        }).json({
            success: true,
            message: "Account created successfully"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}



export const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body
        let normalizedEmail = email?.toLowerCase()

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const user = await User.findOne({ email: normalizedEmail })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Wrong email or password"
            })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Wrong email or password"
            })
        }
        let token = generateToken(user)
        return res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: true,
            samesite: "strict"
        }).json({
            success: true,
            message: `Welcome back ${user.username}`
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}



export const logoutUser = (req, res) => {
    try {
        return res.status(200).clearCookie("token", {
            httpOnly: true,
            samesite: "strict",
            secure: true,
        }).json({
            success: true,
            message: "You are successfully logged out"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
} 

