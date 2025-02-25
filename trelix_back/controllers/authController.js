const bcryptjs = require ('bcryptjs');
const User = require('../models/userModel');
const generateToken = require('../utils/generateTokenAndSetCookie');
const bcrypt = require('bcrypt');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail } = require("../mailtrap/emails.js");


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
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    await newUser.save();




    //jwt
    generateToken(res, newUser._id);
    //dans utils
    await sendVerificationEmail(newUser.email, verificationToken);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        ...newUser._doc,
        password: undefined
      }

    });

  } catch (err) {
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
};
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const registerLinkedIn = async (req, res) => {
  const client_id = process.env.LINKEDIN_CLIENT_ID;
  const client_secret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirect_uri = process.env.LINKEDIN_REDIRECT_URI;
  console.log("Delaying for 5 seconds...");
      await delay(5000);

  try {
      const authCode = req.body.code;
      // Exchange auth code for access token
      
      const response = await axios.post(
          "https://www.linkedin.com/oauth/v2/accessToken",
          null,
          {
              params: {
                  grant_type: "authorization_code",
                  code: authCode,
                  redirect_uri,
                  client_id,
                  client_secret,
              },
              headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
              },
          }
      );

      // Decode the id_token to get user details
      const idToken = response.data.id_token;
      const decodedToken = jwt.decode(idToken);

      // Extract user information
      const { email, given_name: firstName, family_name: lastName } = decodedToken;

      // Check if user exists in your database or create a new one
      let user = await User.findOne({ email });
      if (!user) {
        const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
          user = new User({
              email,
              firstName,
              lastName,
              password: hashedPassword, 
              role: 'student' // Add other fields as needed
          });
          await user.save();
      }

      // Generate your application's JWT
      const appToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      // Send the token to the frontend
      res.json({ token: appToken });

  } catch (error) {
      console.error("LinkedIn Token Error:", error.response?.data || error.message);
      res.status(500).json({ error: "LinkedIn authentication failed" });
  }
};
const regestergoogle = async (req, res,role) => {
  const { firstName, lastName, email, image, password} = req.body;

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
      image,
      role  
    };

    // If normal signup (not Google), include password
    if (password) {
      newUserData.password = password;
    }

    // Save user to database
    const newUser = new User(newUserData);
    await newUser.save();

    // Generate authentication token
    await generateToken(res, newUser._id);

    // Send success response (hide password)
    res.json({
      success: true,
      message: "Registration successful",
      user: {
        ...newUser._doc,
        password: undefined  // Exclude password from response
      }
    });

  } catch (err) {
    console.error("Google Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
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
    generateToken(res, user._id);
    res.json({
      success: true,
      message: "Registration successful",
      user: {
        ...user._doc,
        password: undefined
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'GitHub OAuth failed' });
  }
};

const checkAuth = async (req, res) => {

  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });

    }


    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
//verifyEmail
const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();
		res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        ...user._doc,
        password: undefined
      }

    });
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
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
  const { email, password, stayLoggedIn } = req.body;
  console.log("StayLoggedIn:", stayLoggedIn);

  try {
    const user = await User.findOne({ email });
    if (stayLoggedIn === undefined) {
      return res.status(400).json({ message: "Missing stayLoggedIn value" });
    }
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

    // Set token expiration based on stayLoggedIn
    generateToken(res, user._id, stayLoggedIn);

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

const signIngithub = async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  try {




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


    const emailResponse = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const emailg = emailResponse.data.find(e => e.primary)?.email || null;

    res.json({ email: emailg });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'GitHub authentication failed' });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  console.log("Requête reçue avec l'email :", email);  // Log de débogage

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Utilisateur non trouvé pour l'email :", email);  // Log de débogage
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Générer le token de réinitialisation
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 heure

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // Envoyer l'email
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log("🔍 Requête reçue pour reset password");
    console.log("📌 Token:", token);
    console.log("📝 Nouveau mot de passe reçu:", password);

    // Hash du mot de passe
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log("🔑 Nouveau mot de passe hashé:", hashedPassword);

    // Mise à jour de l'utilisateur avec findOneAndUpdate
    const user = await User.findOneAndUpdate(
      { resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } }, 
      { 
        password: hashedPassword, 
        resetPasswordToken: null, 
        resetPasswordExpiresAt: null 
      }, 
      { new: true } // Pour retourner l'utilisateur mis à jour
    );

    if (!user) {
      console.log("❌ Token invalide ou expiré");
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    console.log("✅ Utilisateur mis à jour:", user.email);

    // Envoi d'un email de confirmation
    await sendResetSuccessEmail(user.email);

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Erreur dans resetPassword:", error);
    res.status(500).json({ success: false, message: "Erreur interne du serveur" });
  }
};



const signOut = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = { signIngithub,
   signIngoogle, 
   registerStudentgithub, 
   registerStudentgoogle, 
   registerInstructorgithub,
    registerInstructorgoogle,
     registerStudent, 
     registerInstructor,
      checkAuth, signIn, 
      signOut,
       verifyEmail,
        forgotPassword,
         resetPassword ,
         registerLinkedIn};

