// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// //generate token

// const generateToken = (userID)=>{
//     return jwt.sign({userID}, process.env.JWT_SECRET, {expiresIn: "1d"})
// };

// //register controller

// export const register = async(req, res)=>{
//     try{
//         const {username, email, password} = req.body;
//         if(!username || !email || !password){
//             return res.status(400).json({message: "All fields are required"});
//         }
//         if(password.length < 6){
//             return res.status(400).json({message: "Password must be at least 6 characters long"});
//         }
//         //agar yha pe aa gya means it has all the fields that are required
//         //ab dekho ki pehle se present hai ki nhi
//         const existingUser = await User.findOne({email});
//         if(existingUser){
//             return res.status(400).json({message: "User already exists"});
//         }
//         //agar yha pe aa gya means it is a new user
//         const user = await User.create({username, email, password});
//         await user.save();

//         const token = generateToken(user._id);
//         res.status(201).json({
//             message: "User registered successfully",
//             data:{
//                 user: user.toJSON(),
//                 token
//             }
//         })
        

//     }
//     catch(error){
//         console.log(error);
//         if(error.name === "ValidationError"){
//             return res.status(400).json({message: error.message});
//         }
//         if(error.name === "MongoServerError" && error.code === 11000){
//             return res.status(400).json({message: "User already exists"});
//         }
//         res.status(500).json({message: "Internal server error"});
//     }
// }

// //login controller

// export const login = async(req, res)=>{
//     try{
//         const {email, password} = req.body;
//         if(!email || !password){
//             return res.status(400).json({message: "All fields are required"});
//         }
//         const user = await User.findOne({email});
//         if(!user){
//             return res.status(401).json({message: "Invalid credentials"});
//         }
//         //ab password check karlo
//         const isPasswordMatch = await user.comparePassword(password);
//         if(!isPasswordMatch){
//             return res.status(401).json({message: "Invalid credentials"});
//         }
//         const token = generateToken(user._id);
//         res.status(200).json({
//             message: "User logged in successfully",
//             data:{
//                 user: user.toJSON(),
//                 token
//             }
//         })



//     }
//     catch(error){
//         console.log(error);
//         if(error.name === "ValidationError"){
//             return res.status(400).json({message: error.message});
//         }
//         if(error.name === "MongoServerError" && error.code === 11000){
//             return res.status(400).json({message: "User already exists"});
//         }
//         res.status(500).json({message: "Internal server error"});
//     }
// }

// //logout controller


// export const logout = async(req, res)=>{
//     try{
//         res.clearCookie("token");
//         res.status(200).json({message: "User logged out successfully"});



//     }
//     catch(error){
//         console.log(error);
//         res.status(500).json({message: "Internal server error"});
//     }
// }

// export const getMe = async(req, res)=>{
//     try{
//         const user = await User.findById(req.user._id);
//         if(!user){
//             return res.status(404).json({message: "User not found"});
//         }
//         res.status(200).json({
//             message: "User fetched successfully",
//             data: user
//         })
//     }
//     catch(error){
//         console.log(error);
//         res.status(500).json({message: "Internal server error"});
//     }
// }


import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Generate JWT
const generateToken = (userID) => {
  return jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register Controller
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, email, password });

    const token = generateToken(user._id);
    res.status(201).json({
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User logged in successfully",
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout Controller (for JWT just a frontend action)
export const logout = (req, res) => {
  try {
    // Since we use JWT in headers, just tell frontend to remove it
    res.status(200).json({ message: "User logged out successfully. Please remove token on client side." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Current User
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      data: user.toJSON(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



