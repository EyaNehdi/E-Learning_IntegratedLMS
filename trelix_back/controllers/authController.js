const User = require('../models/userModel');

const register = async (req, res, role) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      role 
    });
    await newUser.save();


  } catch (err) {
    res.status(500).json({ error: "Registration failed: " + err.message });
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

module.exports = { registerStudent, registerInstructor };