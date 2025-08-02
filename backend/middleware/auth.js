import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next)=>{
    try{
        const token = req.header("Authorization").replace("Bearer ", "");
        if(!token){
            return res.status(401).json({message: "auth token not present"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userID);
        if(!user){
            return res.json({message: "user not found"});
        }
        req.user = user;
        next();
        

    }
    catch(error){
        if(error === "JsonWebTokenError"){
            return res.status(401).json({message: "Invalid token"});
        }

        return res.status(401).json({message: "Unauthorized"});
    }
}

export default auth;
