const jwt = require('jsonwebtoken');
const User= require('../models/User.js');

const authMiddleware= async (req, res, next)=>{
    try{
        const authHeader= req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({success: false, message: "Authorization token is missing"});
        }
        const token= authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({success: false, message: "Authorization token is missing"});
        }
        const decoded= jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId= decoded.id;
        return next();
    }catch(error){
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

const protectEducator= async (req, res, next)=>{
    try{
        const educatorId= req.userId;
                const user= await User.findById(educatorId);
                
                if(!user){
                    return res.status(404).json({success: false, message: "User not found"});
                }
                if(user.role !== 'educator'){
                    return res.status(403).json({success: false, message: "Only educators can add courses"});
                }
        return next();
    } catch(error){
        return res.status(500).json({success: false, message: "Server error verifying educator role"});
    }
}
  
module.exports= {authMiddleware, protectEducator};