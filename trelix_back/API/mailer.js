const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const sendEmail = async (req, res) => {
  const { to, subject, html } = req.body

  if (!to || !subject || !html) {
    return res.status(400).json({ error: "Missing required fields" })
  }

  try {
    const info = await transporter.sendMail({
      from: `"Trelix" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })

    res.status(200).json({ message: "Email sent", messageId: info.messageId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const sendVerificationEmail = async (email, verificationToken) => {
  const emailContent = `<p>Your verification code is: <strong>${verificationToken}</strong></p>`
  try {
    const info = await transporter.sendMail({
      from: `"Trelix" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Email Verification Code",
      html: emailContent,
    })
    console.log("Verification email sent:", info.messageId)
  } catch (error) {
    console.error("Error sending email:", error)
  }
}

const sendVerificationConfirmation = async (req, res) => {
  const { email } = req.body

  try {
    const mailOptions = {
      from: `"Trelix" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Email Verified Successfully!",
      text: "Congratulations, your email has been successfully verified!",
    }

    await transporter.sendMail(mailOptions)

    res.status(200).json({ message: "Verification confirmation sent to email." })
  } catch (err) {
    console.error("Error sending verification email:", err)
    res.status(500).json({ error: "Failed to send verification email." })
  }
}

const sendPasswordResetEmail = async (email, resetToken) => {
  // Use an environment variable for the base URL in production
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173"
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Please click the link below to set a new password:</p>
      <p><a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Trelix" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: emailContent,
    })
    console.log("Password reset email sent:", info.messageId)
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendVerificationConfirmation,
  sendPasswordResetEmail,
}
