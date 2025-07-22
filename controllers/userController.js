import { User } from "../models/User.js"

export const getUser = async(req, res)=>{
    try {
        const id = req.user.id
       const user = await User.findById(id) 

       if(!user){
        return res.status(404).json({
            success:false,
            message:"No user found"
        })
       }

        return res.status(200).json({
            success:true,
            user
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}