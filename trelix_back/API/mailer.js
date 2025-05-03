const nodemailer = require("nodemailer")
const SystemSetting = require("../models/SystemSetting.model")
require("dotenv").config()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for port 465, false for others
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

function getEngagementEmailTemplate(user, stage, role) {
  const firstName = user.name || user.email;
  const siteUrl = 'http://localhost:5173/';

  let subject = '';
  let body = '';

  const templates = {
    student: {
      active: {
        subject: 'Keep up the great work on your learning journey!',
        body: `
                  We love seeing your continued progress on Trelix! Stay curious — there are plenty of new lessons, resources, and challenges waiting for you.<br><br>
                  Keep pushing forward. Great things are ahead!
              `
      },
      idle: {
        subject: 'We’ve missed you! Continue where you left off',
        body: `
                  We noticed you’ve been away for a bit — we’re excited to welcome you back! Your learning journey is still waiting, and new materials are ready for you.<br><br>
                  Pick up right where you left off and keep the momentum going.
              `
      },
      at_risk: {
        subject: 'Don’t lose your learning streak — we’re here to help',
        body: `
                  It’s been a while since you last logged in, and we want to help you stay on track! Every step counts, and we’re here to support you.<br><br>
                  Come back today and unlock new learning opportunities crafted just for you.
              `
      },
      churned: {
        subject: 'Let’s reconnect — your learning journey matters',
        body: `
                  We haven’t seen you in a while, and we’d love to welcome you back! Your courses, resources, and progress are still here, waiting for you to pick up again.<br><br>
                  Reignite your passion for learning — we’re ready when you are.
              `
      }
    },
    instructor: {
      active: {
        subject: 'Your students are thriving — thanks to you!',
        body: `
                  Thank you for your ongoing dedication on Trelix! Your contributions are empowering students and shaping their success every day.<br><br>
                  Keep inspiring, keep leading — we’re excited to see what you create next.
              `
      },
      idle: {
        subject: 'We’ve missed your expertise — come back and engage',
        body: `
                  It’s been a short while since we’ve seen you on Trelix. Your students value your insights, and there’s always a space here for your knowledge.<br><br>
                  Re-engage today and continue making an impact.
              `
      },
      at_risk: {
        subject: 'Your students miss you — let’s get back on track',
        body: `
                  We noticed you haven’t logged in recently. Your guidance plays a key role in your students’ progress, and we’d love to see you back.<br><br>
                  Rejoin today and continue shaping the future.
              `
      },
      churned: {
        subject: 'Let’s reconnect — your expertise is invaluable',
        body: `
                  It’s been a while since we last saw you on Trelix. Your expertise has real impact, and we’d love to welcome you back to the instructor community.<br><br>
                  Return today and keep making a difference.
              `
      }
    }
  };

  if (templates[role] && templates[role][stage]) {
    subject = templates[role][stage].subject;
    body = templates[role][stage].body;
  } else {
    subject = 'Stay connected with Trelix';
    body = `
          We’re here to support you on your journey. Log back in anytime to continue learning or teaching with us.
      `;
  }

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; text-align: center; color: #333;">
      <h2 style="font-size: 22px;">${subject}</h2>
      <p style="font-size: 16px; line-height: 1.5; max-width: 600px; margin: 0 auto;">
          Hi ${firstName},<br><br>
          ${body}
      </p>
      <a href="${siteUrl}" style="display: inline-block; margin-top: 30px; padding: 12px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px;">
          Log In Now
      </a>
      <p style="font-size: 12px; color: #888; margin-top: 30px;">
          © ${new Date().getFullYear()} Trelix. All rights reserved.
      </p>
  </div>
  `;

  return { subject, html };
}

function stripHtmlTags(html) {
  if (!html) return '';
  let text = html.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]*>/g, '');
  const entities = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&lt;': '<',
    '&gt;': '>',
  };
  text = text.replace(/&[a-zA-Z#0-9]+;/g, match => entities[match] || match);
  text = text.replace(/\n{2,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ');
  return text.trim();
}

async function triggerEngagementEmail(user, stage) {
  const { subject, html } = getEngagementEmailTemplate(user, stage, user.role);

  await transporter.sendMail({
    from: `"Trelix" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject,
    text: stripHtmlTags(html),
    html,
  });
}

function getStageColor(stage) {
  switch (stage) {
    case 'active': return '#4CAF50';
    case 'idle': return '#FF9800';
    case 'at_risk': return '#FF5722';
    case 'churned': return '#9E9E9E';
    default: return '#333';
  }
}

async function sendAdminSummaryReport(updatedUsers) {
  const subject = 'Daily User Engagement Summary Report';

  const reportHtml = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #333;">
        <h2 style="font-size: 22px; text-align: center;">Daily User Engagement Summary</h2>
        <p style="font-size: 16px;">Total users updated: <strong>${updatedUsers.length}</strong></p>
        <p style="font-size: 16px;">Details:</p>
        <ul style="list-style-type: none; padding-left: 0;">
            ${updatedUsers.map(user => `
                <li style="padding: 8px; background-color: #f9f9f9; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <strong>${user.email}</strong>: <span style="color: ${getStageColor(user.stage)};">${user.stage}</span>
                </li>
            `).join('')}
        </ul>
        <p style="font-size: 12px; color: #888; text-align: center;">
            © ${new Date().getFullYear()} Trelix. All rights reserved.
        </p>
    </div>
  `;

  const reportText = `Total users updated: ${updatedUsers.length}\n\nDetails:\n` +
    updatedUsers.map(u => `- ${u.email}: ${u.stage}`).join('\n');

  const adminEmailSetting = await SystemSetting.findOne({ key: 'admin_emails' }).lean();
  const adminEmails = adminEmailSetting?.value || [];

  await transporter.sendMail({
    from: `"Trelix" <${process.env.SMTP_USER}>`,
    to: adminEmails.join(','),
    subject,
    text: reportText,
    html: reportHtml,
  });
  console.log('Sent summary report to admins.');
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendVerificationConfirmation,
  sendPasswordResetEmail,
  sendAdminSummaryReport,
  triggerEngagementEmail
}
