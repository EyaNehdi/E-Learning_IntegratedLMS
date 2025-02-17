const User = require('../models/userModel');
const generateToken = require('../utils/generateTokenAndSetCookie');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const axios = require('axios');
//signup function
const register = async (req, res, role) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }
    const newUser = new User({
      firstName,
      lastName,
      email,
      password ,
      role 
    });
    await newUser.save();
//jwt
generateToken(res,newUser._id);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user:{
        ...newUser._doc,
        password: undefined
      }

    });

  } catch (err) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
};
const regestergoogle = async (req, res, role) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user data object
    const newUserData = {
      firstName,
      lastName,
      email,
      role
    };

    // If the request contains a password (i.e., normal signup), add it to the user data
    if (password) {
      newUserData.password = password;
    }

    const newUser = new User(newUserData);
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
};
const regestergithub = async (req, res, role) => {
  const { code } = req.body;

  try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
          client_id: 'Ov23liQcQlFtxrCS9Hkz',
          client_secret: 'f5af5884e6f5d79e0c7a525180dc22c2cbd679a8',
          code,
      }, {
          headers: {
              'Accept': 'application/json'
          }
      });

      const accessToken = tokenResponse.data.access_token;

      // Fetch user details
      const userResponse = await axios.get('https://api.github.com/user', {
          headers: { Authorization: `Bearer ${accessToken}` }
      });

      const emailResponse = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` }
      });

      const email = emailResponse.data.find(e => e.primary)?.email || null;

      // Generate a random password (optional)
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Save to DB
      const user = new User({
          firstName: userResponse.data.name,
          email: email,
          password: hashedPassword,  // Save hashed random password
          role: role
      });

      await user.save();
      res.json({ success: true, user });

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'GitHub OAuth failed' });
  }
};

const checkAuth = async (req, res) => {
try{
  const user = await User.findById(req.id);
  if(!user) return res.json({error:"User not found"});
  res.json({
    success:true,
    user:{
      ...user._doc,
      password:undefined
    }
  })
}catch{
  res.json({error:"Unauthorized"});
}
};

// Student registration
const registerStudent = async (req, res) => {
  await register(req, res, "student");
};


// Instructor registration
const registerInstructor = async (req, res) => {
  await register(req, res, "instructor");
};
const registerInstructorgoogle = async (req, res) => {
  await regestergoogle(req, res, "instructor");
};
const registerInstructorgithub = async (req, res) => {
  await regestergithub(req, res, "instructor");
};
const registerStudentgoogle = async (req, res) => {
  await regestergoogle(req, res, "student");
};
const registerStudentgithub = async (req, res) => {
  await regestergithub(req, res, "student");
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("🔴 User not found");
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    console.log("🟢 Found user:", user.email);
    console.log("🟢 Stored hashed password:", user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("🔴 Password does not match");
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    generateToken(res, user._id);

    console.log("🟢 Login successful for user:", user.email);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });

  } catch (error) {
    console.error("🔴 Error in login:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const signIngoogle = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("🔴 User not found");
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    console.log("🟢 Found user:", user.email);
    console.log("🟢 Stored hashed password:", user.password);


    generateToken(res, user._id);

    console.log("🟢 Login successful for user:", user.email);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });

  } catch (error) {
    console.error("🔴 Error in login:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




 const signOut = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = {signIngoogle,registerStudentgithub, registerStudentgoogle,registerInstructorgithub, registerInstructorgoogle, registerStudent, registerInstructor,checkAuth , signIn , signOut};