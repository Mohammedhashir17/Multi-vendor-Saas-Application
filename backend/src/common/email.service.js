/**
 * email-service.js — Nodemailer-based email sender.
 * Provides a reusable transporter and an OTP-specific HTML mailer.
 */

const nodemailer = require("nodemailer");
const logger = require("./logger");

const CTX = "emailService";

// ─── Transporter Singleton ────────────────────────────────────────────────────

let _transporter = null;

/**
 * Lazily creates and verifies the nodemailer transporter.
 * Reuses the same instance across requests (connection pooling).
 * @returns {Promise<nodemailer.Transporter>}
 */
async function getTransporter() {
  if (_transporter) return _transporter;

  logger.info(CTX, "Initializing nodemailer transporter", {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
  });

  _transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT, 10) || 465,
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (not account password)
    },
  });

  // Verify connection on first boot; non-fatal — app still starts if email fails
  try {
    await _transporter.verify();
    logger.info(CTX, "Nodemailer transporter verified and ready");
  } catch (verifyErr) {
    logger.error(CTX, "Nodemailer transporter verification failed", {
      error: verifyErr.message,
    });
    // Don't throw — email failures are surfaced per-send, not on boot
  }

  return _transporter;
}

// ─── OTP Email Template ───────────────────────────────────────────────────────

/**
 * Returns an HTML string for the OTP verification email.
 * @param {string} otp - Plain-text 6-digit OTP
 * @param {string} username - Recipient's display name
 * @returns {string}
 */
function buildOtpEmailHtml(otp, username) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Your OTP Code</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .header { background: #1a1a2e; color: #ffffff; padding: 32px 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; letter-spacing: 1px; }
        .body { padding: 36px 40px; text-align: center; }
        .greeting { font-size: 16px; color: #333; margin-bottom: 8px; }
        .instruction { font-size: 14px; color: #666; margin-bottom: 28px; line-height: 1.6; }
        .otp-box { display: inline-block; background: #f0f4ff; border: 2px dashed #4a6cf7; border-radius: 10px; padding: 20px 48px; margin-bottom: 24px; }
        .otp-code { font-size: 40px; font-weight: 800; letter-spacing: 12px; color: #1a1a2e; font-family: monospace; }
        .expiry { font-size: 13px; color: #e74c3c; margin-bottom: 16px; }
        .warning { font-size: 12px; color: #999; line-height: 1.5; }
        .footer { background: #f8f9fc; padding: 20px 40px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Email Verification</h1>
        </div>
        <div class="body">
          <p class="greeting">Hello, <strong>${username}</strong>!</p>
          <p class="instruction">
            Use the One-Time Password below to verify your email address.
            Do not share this code with anyone.
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="expiry">⏳ This code expires in <strong>5 minutes</strong>.</p>
          <p class="warning">
            If you did not request this, please ignore this email.<br/>
            Your account remains secure.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} MultiVendor App &mdash; No-reply
        </div>
      </div>
    </body>
    </html>
  `;
}

// ─── Send OTP Email ───────────────────────────────────────────────────────────

/**
 * Sends an OTP verification email to the given recipient.
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.username - Recipient display name
 * @param {string} params.otp - Plain-text 6-digit OTP
 * @returns {Promise<void>}
 * @throws {Error} if nodemailer fails to send
 */
async function sendOtpEmail({ toEmail, username, otp }) {
  const context = `${CTX}.sendOtpEmail`;

  logger.info(context, "Preparing to send OTP email", { toEmail, username });

  const transporter = await getTransporter();

  const mailOptions = {
    from: `"MultiVendor App" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Verification Code",
    html: buildOtpEmailHtml(otp, username),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(context, "OTP email sent successfully", {
      toEmail,
      messageId: info.messageId,
    });
  } catch (sendErr) {
    logger.error(context, "Failed to send OTP email", {
      toEmail,
      error: sendErr.message,
    });
    throw new Error(`Email delivery failed: ${sendErr.message}`);
  }
}

async function sendVendorWelcomeEmail({ to, username, password }) {
  const context = `${CTX}.sendVendorWelcomeEmail`;

  logger.info(context, "Preparing to send vendor welcome email", {
    to,
    username,
  });

  const transporter = await getTransporter();

  const mailOptions = {
    from: `"MultiVendor App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to MultiVendor App — Your Login Credentials",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Vendor Account Created</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f4f6f8;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 480px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          }
          .header {
            background: #1a1a2e;
            color: #ffffff;
            padding: 32px 40px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
            letter-spacing: 1px;
          }
          .body {
            padding: 36px 40px;
            text-align: center;
          }
          .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 8px;
          }
          .instruction {
            font-size: 14px;
            color: #666;
            margin-bottom: 28px;
            line-height: 1.6;
          }
          .credentials-box {
            background: #f0f4ff;
            border: 2px dashed #4a6cf7;
            border-radius: 10px;
            padding: 24px 32px;
            margin-bottom: 24px;
            text-align: left;
          }
          .credential-row {
            margin-bottom: 12px;
          }
          .credential-row:last-child {
            margin-bottom: 0;
          }
          .credential-label {
            font-size: 12px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          .credential-value {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a2e;
            font-family: monospace;
            letter-spacing: 2px;
            word-break: break-all;
          }
          .notice {
            font-size: 13px;
            color: #e67e22;
            margin-bottom: 16px;
            line-height: 1.6;
          }
          .warning {
            font-size: 12px;
            color: #999;
            line-height: 1.5;
          }
          .footer {
            background: #f8f9fc;
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #aaa;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">

          <div class="header">
            <h1>🎉 Welcome Vendor</h1>
          </div>

          <div class="body">

            <p class="greeting">
              Hello, <strong>${username}</strong>!
            </p>

            <p class="instruction">
              Your vendor account has been created by the admin.
              Use the temporary credentials below to log in.
              You will be prompted to set a new password immediately after logging in.
            </p>

            <div class="credentials-box">
              <div class="credential-row">
                <div class="credential-label">Email</div>
                <div class="credential-value">${to}</div>
              </div>
              <div class="credential-row">
                <div class="credential-label">Temporary Password</div>
                <div class="credential-value">${password}</div>
              </div>
            </div>

            <p class="notice">
              ⚠️ This is a temporary password.<br/>
              You must reset it after your first login.
            </p>

            <p class="warning">
              Do not share these credentials with anyone.<br/>
              If you were not expecting this email, please contact support immediately.
            </p>

          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} MultiVendor App &mdash; No-reply
          </div>

        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    logger.info(context, "Vendor welcome email sent successfully", {
      to,
      messageId: info.messageId,
    });
  } catch (sendErr) {
    logger.error(context, "Failed to send vendor welcome email", {
      to,
      error: sendErr.message,
    });

    throw new Error(`Vendor welcome email delivery failed: ${sendErr.message}`);
  }
}

module.exports = { emailService: { sendOtpEmail, sendVendorWelcomeEmail } };