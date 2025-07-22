import jwt from 'jsonwebtoken'

const isAuthenticated = (req,res, next)=>{
    try {
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({
                success:false,
                message:"You are not logged in"
            })
        }
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                success:false,
                message:"you are not logged in."
            })
        }
        req.user = {id: decode.id};
        next();

    } catch (error) { 
        if(error.name === "TokenExpiredError"){
           return res.status(401).json({
            success:false,
            message:"Your session had expired! So please login again"
           })
        }
        return res.status(500).json({   
            success: false,
            message: "Internal server error"
        })
    }
}
export default isAuthenticated;