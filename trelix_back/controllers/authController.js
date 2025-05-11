const bcryptjs = require('bcryptjs');
const User = require('../models/userModel');
const generateToken = require('../utils/generateTokenAndSetCookie');
const bcrypt = require('bcrypt');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const { sendResetSuccessEmail } = require("../mailtrap/emails.js");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../API/mailer.js");

const axios = require('axios');
const { verifyTrustedDeviceToken } = require('../middlewares/UserAccess.js');
//signup function
const register = async (req, res, role) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("❌ Validation Failed: Email already registered", email);
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate a 6-digit verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role: role,
      isVerified: false,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
    });

    await newUser.save();

    await sendVerificationEmail(newUser.email, verificationToken);
    console.log("📧 Verification email sent to:", newUser.email);
    req.actingUser = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
    };
    res.locals.fullyLoggedIn = true;
    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for the verification code.",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        password: undefined,
      },
    });
  } catch (err) {
    console.error("🔥 Unexpected Error:", err);
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
    await generateToken(res, newUser._id);
    res.json({
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
const registerLinkedIn = async (req, res, role) => {
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

    const idToken = response.data.id_token;
    const decodedToken = jwt.decode(idToken);

    // Extract user information
    const { email, given_name: firstName, family_name: lastName } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // Generate random password and hash it
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create new user
    user = new User({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: role
    });
    await user.save();

    await generateToken(res, user._id);

    res.json({
      success: true,
      message: "Registration successful",
      user: {
        ...user._doc,
        password: undefined
      }
    });
  } catch (error) {
    console.error("LinkedIn Token Error:", error.response?.data || error.message);
    res.status(500).json({ error: "LinkedIn authentication failed" });
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
    signOut();
    res.status(400).json({ success: false, message: error.message });
  }
};

const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  // Ensure the email is provided
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If user doesn't exist
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new verification token (you can use a library like UUID or JWT)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();// Implement this function as needed

    // Save the token (optional, depending on your token storage logic)
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 3600000; // 1 hour expiration
    await user.save();

    // Send the verification email with the new token
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      message: "A new verification code has been sent to your email",
    });
  } catch (error) {
    console.error("Error resending verification code:", error);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
};

//verifyEmail
const verifyEmail = async (req, res) => {
  const { email, verificationCode, source } = req.body;

  try {
    console.log("🔍 Verifying email for:", email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (verificationCode !== user.verificationToken) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (source === "login") {
      req.actingUser = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      res.locals.fullyLoggedIn = true;
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    generateToken(res, user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: { ...user.toObject(), password: undefined },
    });

  } catch (error) {
    console.error("🔥 Error verifying email:", error.message);
    res.status(500).json({ error: "Email verification failed" });
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
const registerInstructorLinkedin = async (req, res) => {
  await registerLinkedIn(req, res, "instructor");
};
const registerStudentLinkedin = async (req, res) => {
  await registerLinkedIn(req, res, "student");
};

const signIn = async (req, res) => {
  const { email, password, stayLoggedIn } = req.body;
  if (stayLoggedIn === undefined) {
    return res.status(400).json({ message: "Missing stayLoggedIn value" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("🔴 User not found");
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("🔴 Password does not match");
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    if (user?.role !== "admin") {
      if (!user.isVerified) {
        await sendVerificationEmail(user.email, user.verificationToken);
        return res.status(403).json({
          success: false,
          message: "Account not verified. A new verification email has been sent.",
          verificationRequired: true,
          userId: user._id
        });
      }
      if (user.mfa?.enabled) {
        const trustedToken = req.cookies["trusted_device_token"];
        const decoded = trustedToken ? verifyTrustedDeviceToken(trustedToken) : null;

        if (!decoded || !decoded.deviceId) {
          return res.status(200).json({
            success: true,
            mfaRequired: true,
            backupCodesExist: user.mfa?.backupCodes?.length !== 0,
            message: "Unrecognized device. MFA is required.",
            userId: user._id,
          });
        }
        const trusted = user.mfa.trustedDevices.some((d) => d.deviceId === decoded.deviceId);
        if (!trusted) {
          return res.status(200).json({
            success: true,
            mfaRequired: true,
            backupCodesExist: user.mfa?.backupCodes?.length !== 0,
            message: "MFA is required",
            userId: user._id,
          });
        }
      }
    }
    generateToken(res, user._id, stayLoggedIn);
    req.actingUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    res.locals.fullyLoggedIn = true;
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      mfaRequired: false,
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
const signInlinkedin = async (req, res) => {
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

    const idToken = response.data.id_token;
    const decodedToken = jwt.decode(idToken);

    // Extract user information
    const { email, given_name: firstName, family_name: lastName } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User with this email doses not exist" });
    }



    // Create new user



    await generateToken(res, user._id);

    res.json({ email: email });
  } catch (error) {
    console.error("LinkedIn Authentication Error:", error.response?.data || error.message);
    res.status(500).json({ error: "LinkedIn authentication failed" });
  }
};



// Generate a secure random token
const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a password reset token (using a library like crypto)
    const resetToken = generateResetToken(); // Implement this function to generate a secure token
    user.resetToken = resetToken;
    user.resetTokenExpiresAt = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    // Send the password reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      message: "Password reset email sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
};


const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body
  console.log("Reset password request body:", { token, passwordLength: newPassword?.length })

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Token and new password are required" })
  }

  try {
    // Find user with valid token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiresAt: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" })
    }

    console.log("✅ Found user with valid token:", user.email)

    // Set the plain text password - the pre-save hook will handle hashing
    user.password = newPassword
    user.resetToken = undefined
    user.resetTokenExpiresAt = undefined

    // Save the user
    await user.save()

    // Verify the password was saved correctly
    const updatedUser = await User.findById(user._id)
    console.log("Stored password hash after save:", updatedUser.password)

    // Test password verification using the model's method
    const verificationTest = await updatedUser.comparePassword(newPassword)
    console.log("Password verification test:", verificationTest ? "PASSED ✅" : "FAILED ❌")

    // Generate token after resetting password
    generateToken(res, user._id, false)

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    })
  } catch (error) {
    console.error("❌ Error resetting password:", error)
    res.status(500).json({
      success: false,
      error: "Failed to reset password",
    })
  }
}

const signOut = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};


const trackCurrentLocation = async (req, res) => {
  console.log("User ID from Token:", req.userId); // Log this to verify it is available here

  if (!req.userId) return res.status(400).json({ error: "User ID not found in token" });

  try {
    let location;
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const ip = ipData.ip;

      const geoResponse = await fetch(`https://ipinfo.io/${ip}/json`);
      location = await geoResponse.json();

      console.log("Location Data:", location);

      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      user.lastLoginLocation = {
        city: location.city || "Unknown",
        region: location.region || "",
        country: location.country || "Unknown",
        loggedInAt: new Date(),
      };

      await user.save();
      res.json({ message: "Location updated", location: user.lastLoginLocation, userId: req.userId, userData: user });
    } catch (apiError) {
      console.error("API Error:", apiError);
      if (req.userId) {
        const user = await User.findById(req.userId);
        if (user) {
          user.lastLoginLocation = {
            city: "Fallback City",
            region: "",
            country: "Fallback Country",
            loggedInAt: new Date(),
          };
          await user.save();
          return res.json({ message: "Using fallback location due to API errors", location: user.lastLoginLocation });
        }
      }
      return res.status(500).json({ error: "Could not fetch location data" });
    }
  } catch (err) {
    console.error("Failed to track location:", err);
    res.status(500).json({ error: "Could not update location" });
  }
};



module.exports = {
  signIngithub,
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
  resetPassword,
  registerLinkedIn,
  registerInstructorLinkedin,
  registerStudentLinkedin,
  signInlinkedin,
  trackCurrentLocation,
  resendVerificationCode
};

