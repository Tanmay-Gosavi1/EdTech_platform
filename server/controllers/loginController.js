const User= require('../models/User.js');
const validator= require('validator');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');

// generate JWT Token
const createToken= (userId)=>{
    const token= jwt.sign({id: userId}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});
    return token;
}

const loginUser= async (req, res)=>{
    try{
        const {email, password}= req.body;

        // Validate input
        if(!email || !password){
            return res.status(400).json({success: false, message: "Email and password are required"});
        }
        if(!validator.isEmail(email)){
            return res.status(400).json({success: false, message: "Invalid email format"});
        }

        // Check if user exists
        const user= await User.findOne({email}).select('+password');
        if(!user){
            return res.status(400).json({success: false, message: "User not found"});
        }

        // Compare passwords
        const isMatch= await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({success: false, message: "Incorrect password"});
        }

        // Create token
        const token= createToken(user._id);

        return res.status(200).json({success: true, message: "Login successful", token,
            user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
        });
    }catch(error){
        console.error("Error during login:", error);
        return res.status(500).json({success: false, message: "Server error during login"});
    }
}

const signupUser= async (req, res)=>{
    try{
        const {name,password, email, imageUrl}= req.body;

        if(!password || !name || !email){
            return res.status(400).json({success: false, message: "All fields are required"});
        }
        if(!validator.isEmail(email)){
            return res.status(400).json({success: false, message: "Invalid email format"});
        }
        if(password.length < 6){
            return res.status(400).json({success: false, message: "Password must be at least 6 characters long"});
        }
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(400).json({success: false, message: "Email is already registered"});
        }
        const hashPass= await bcrypt.hash(password,10);
        
        const user= {
             name: name,
            email: email,
            password: hashPass,
            imageUrl: imageUrl || '',
        }
        const newUser= await User.create(user);

        const token= createToken(newUser._id);

        return res.status(201).json({success: true, message: "User registered successfully", token, 
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                imageUrl: newUser.imageUrl,
            }
        });
    }catch(error){
        console.error("Error during signup:", error);
        return res.status(500).json({success: false, message: "Server error during signup"});
    }
}

const userInfo= async (req, res)=>{
    try{
        const userId= req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const user= await User.findById(userId);
        if(!user){
            return res.status(404).json({success: false, message: "User not found"});
        }
        return res.status(200).json({success: true, user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            imageUrl: user.imageUrl,
        }});
    }catch(error){
        console.error("Error fetching user info:", error);
        return res.status(500).json({success: false, message: "Server error fetching user info"});
    }
}

module.exports= {loginUser, signupUser, userInfo};