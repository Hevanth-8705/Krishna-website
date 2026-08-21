import nodemailer from 'nodemailer';
import crypto from 'crypto';

// In-memory token storage (with hash protection)
interface ResetTokenRecord {
  tokenHash: string;
  email: string;
  expiresAt: number; // Unix timestamp ms
  used: boolean;
  createdAt: number;
}

interface VerificationTokenRecord {
  tokenHash: string;
  email: string;
  expiresAt: number;
  used: boolean;
  createdAt: number;
}

// In-memory maps for tokens and rate limiting
const resetTokens = new Map<string, ResetTokenRecord>();
const verificationTokens = new Map<string, VerificationTokenRecord>();
const rateLimitMap = new Map<string, number[]>(); // key: email or IP -> array of timestamps

// Helper to sanitize log outputs
function sanitizeEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}***@${domain}`;
}

// Rate Limiting Check: Max 3 requests per 15 minutes per email/IP, 60-second cooldown
export function checkRateLimit(key: string): { allowed: boolean; waitSeconds?: number; reason?: string } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 mins
  const maxRequests = 3;
  const cooldownMs = 60 * 1000; // 60s cooldown between emails

  const timestamps = (rateLimitMap.get(key) || []).filter(ts => now - ts < windowMs);
  rateLimitMap.set(key, timestamps);

  if (timestamps.length > 0) {
    const lastRequest = timestamps[timestamps.length - 1];
    const timeSinceLast = now - lastRequest;
    if (timeSinceLast < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - timeSinceLast) / 1000);
      return { allowed: false, waitSeconds, reason: `Please wait ${waitSeconds} seconds before requesting another email.` };
    }
  }

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const waitSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, waitSeconds, reason: `Rate limit exceeded. Try again in ${Math.ceil(waitSeconds / 60)} minutes.` };
  }

  return { allowed: true };
}

export function recordRateLimit(key: string): void {
  const timestamps = rateLimitMap.get(key) || [];
  timestamps.push(Date.now());
  rateLimitMap.set(key, timestamps);
}

// SMTP Transporter setup
export function getSmtpTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== 'false';
  const user = process.env.SMTP_USER || 'krishnab3032@gmail.com';
  const pass = (process.env.SMTP_PASSWORD || '').trim();

  const transportOptions: any = {
    host,
    port,
    secure, // true for 465, false for other ports
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 15000,     // 15 seconds
    tls: {
      rejectUnauthorized: true, // Production TLS verification
    },
  };

  if (user && pass) {
    transportOptions.auth = {
      user,
      pass,
    };
  }

  const transporter = nodemailer.createTransport(transportOptions);
  return { transporter, host, port, user };
}

// Verify SMTP Connection
export async function verifySmtpConnection(): Promise<{ success: boolean; message: string; host: string; port: number }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const pass = (process.env.SMTP_PASSWORD || '').trim();

  if (!pass) {
    return {
      success: false,
      message: 'SMTP credentials unconfigured (SMTP_PASSWORD empty in .env). Email service in local simulation mode.',
      host,
      port,
    };
  }

  try {
    const { transporter } = getSmtpTransporter();
    await transporter.verify();
    return {
      success: true,
      message: 'SMTP configuration loaded and connection verified successfully.',
      host,
      port,
    };
  } catch (error: any) {
    console.warn('[SMTP Diagnostic Warning]:', error.message || error);
    return {
      success: false,
      message: 'Failed to establish connection with SMTP server.',
      host,
      port,
    };
  }
}

// Hash token for secure storage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate Password Reset Token & Send SMTP Email
 */
export async function sendPasswordResetEmail(email: string, appUrl: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  
  // Generate cryptographically secure random token (64 hex characters)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour validity

  // Store hashed token record
  resetTokens.set(tokenHash, {
    tokenHash,
    email: cleanEmail,
    expiresAt,
    used: false,
    createdAt: Date.now(),
  });

  // Construct reset link
  const resetUrl = `${appUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'krishnab3032@gmail.com';
  const fromName = process.env.SMTP_FROM_NAME || 'KRISHNA_OS Neural Core';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your KRISHNA_OS password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #02040a; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 40px auto; background: #0b0f19; border: 1px solid #00e5ff33; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 229, 255, 0.1); }
        .header { background: linear-gradient(135deg, #090d16 0%, #10172a 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: 3px; color: #00e5ff; font-family: monospace; }
        .content { padding: 36px 32px; line-height: 1.6; }
        .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
        .text { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
        .button-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #00e5ff 0%, #0099ff 100%); color: #000000; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 10px; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3); }
        .footer { background: #060911; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); }
        .warning { font-size: 12px; color: #64748b; margin-top: 24px; padding-top: 16px; border-top: 1px dashed rgba(255,255,255,0.1); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ KRISHNA_OS</div>
        </div>
        <div class="content">
          <div class="title">Reset your KRISHNA_OS password</div>
          <p class="text">Hello,</p>
          <p class="text">We received a security request to reset the password associated with your KRISHNA_OS neural session (<strong>${cleanEmail}</strong>).</p>
          <div class="button-wrapper">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p class="text">This cryptographic link expires after <strong>1 hour</strong>. If the button above does not work, copy and paste the following URL into your browser:</p>
          <p style="font-family: monospace; font-size: 11px; color: #00e5ff; word-break: break-all;">${resetUrl}</p>
          <div class="warning">
            If you did not request a password reset, you can safely ignore this security notification. Your password will remain unchanged and your account remains secure.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} KRISHNA_OS Security Infrastructure. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Hello,

We received a request to reset your KRISHNA_OS password for ${cleanEmail}.

Reset your password by opening this link:
${resetUrl}

This link expires in 1 hour.

If you did not request this reset, you can safely ignore this email.

KRISHNA_OS Security Core
`;

  const pass = (process.env.SMTP_PASSWORD || '').trim();
  if (!pass) {
    console.log(`[SMTP Mailer (Local Dev Simulation)] Password reset link generated for ${sanitizeEmail(cleanEmail)}: ${resetUrl}`);
    return { 
      success: true, 
      message: 'Password reset link generated. (Local mode: Link logged to server terminal).' 
    };
  }

  try {
    const { transporter } = getSmtpTransporter();
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: cleanEmail,
      subject: 'Reset your KRISHNA_OS password',
      text: textContent,
      html: htmlContent,
    });

    console.log(`[SMTP Mailer] Password reset email dispatched to ${sanitizeEmail(cleanEmail)}`);
    return { success: true, message: 'Password reset email sent.' };
  } catch (error: any) {
    console.error(`[SMTP Mailer Error] Failed to send email to ${sanitizeEmail(cleanEmail)}:`, error.message || error);
    // Delete token if sending failed
    resetTokens.delete(tokenHash);
    throw new Error('SMTP service temporarily unavailable. Failed to deliver reset message.');
  }
}

/**
 * Verify if a reset token is valid
 */
export function verifyResetToken(rawToken: string): { valid: boolean; email?: string; message?: string } {
  if (!rawToken || typeof rawToken !== 'string') {
    return { valid: false, message: 'Missing token parameter.' };
  }

  const tokenHash = hashToken(rawToken);
  const record = resetTokens.get(tokenHash);

  if (!record) {
    return { valid: false, message: 'Invalid or unrecognized password reset token.' };
  }

  if (record.used) {
    return { valid: false, message: 'This password reset link has already been used.' };
  }

  if (Date.now() > record.expiresAt) {
    resetTokens.delete(tokenHash);
    return { valid: false, message: 'This password reset link has expired. Please request a new one.' };
  }

  return { valid: true, email: record.email };
}

/**
 * Complete Password Reset with Token
 */
export function completePasswordReset(rawToken: string, newPassword: string): { success: boolean; email: string; message: string } {
  const verification = verifyResetToken(rawToken);
  if (!verification.valid || !verification.email) {
    return { success: false, email: '', message: verification.message || 'Invalid or expired reset token.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, email: verification.email, message: 'Password must be at least 6 characters long.' };
  }

  const tokenHash = hashToken(rawToken);
  const record = resetTokens.get(tokenHash);
  if (record) {
    record.used = true;
    resetTokens.delete(tokenHash); // Single-use consumption
  }

  console.log(`[SMTP Mailer] Password successfully updated for ${sanitizeEmail(verification.email)}`);
  return { success: true, email: verification.email, message: 'Password reset completed successfully.' };
}

/**
 * Send Email Verification Token via SMTP
 */
export async function sendEmailVerification(email: string, appUrl: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity

  verificationTokens.set(tokenHash, {
    tokenHash,
    email: cleanEmail,
    expiresAt,
    used: false,
    createdAt: Date.now(),
  });

  const verifyUrl = `${appUrl.replace(/\/$/, '')}/login?action=verify-email&token=${rawToken}`;
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'krishnab3032@gmail.com';
  const fromName = process.env.SMTP_FROM_NAME || 'KRISHNA_OS Neural Core';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify your KRISHNA_OS account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #02040a; color: #e2e8f0; margin: 0; padding: 0; }
        .container { max-width: 580px; margin: 40px auto; background: #0b0f19; border: 1px solid #7c3aed33; border-radius: 16px; overflow: hidden; }
        .header { background: #090d16; padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .logo { font-size: 24px; font-weight: 800; color: #a78bfa; font-family: monospace; }
        .content { padding: 36px 32px; line-height: 1.6; }
        .btn { display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 10px; }
        .footer { background: #060911; padding: 24px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ KRISHNA_OS ACCOUNT VERIFICATION</div>
        </div>
        <div class="content">
          <h2 style="color:#ffffff;">Verify your identity</h2>
          <p style="color:#94a3b8;">Welcome to KRISHNA_OS! Please verify your email address (<strong>${cleanEmail}</strong>) to activate full system capabilities.</p>
          <div style="text-align:center; margin: 30px 0;">
            <a href="${verifyUrl}" class="btn" target="_blank">Verify Email Address</a>
          </div>
          <p style="font-size:12px; color:#64748b;">Or paste this link into your browser: <br><span style="color:#a78bfa; font-family:monospace;">${verifyUrl}</span></p>
        </div>
        <div class="footer">&copy; KRISHNA_OS Security Core</div>
      </div>
    </body>
    </html>
  `;

  try {
    const { transporter } = getSmtpTransporter();
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: cleanEmail,
      subject: 'Verify your KRISHNA_OS account',
      text: `Welcome to KRISHNA_OS! Please verify your account using this link: ${verifyUrl}`,
      html: htmlContent,
    });

    console.log(`[SMTP Mailer] Verification email dispatched to ${sanitizeEmail(cleanEmail)}`);
    return { success: true, message: 'Verification email sent.' };
  } catch (error: any) {
    console.error(`[SMTP Mailer Error] Verification email failed for ${sanitizeEmail(cleanEmail)}:`, error.message || error);
    verificationTokens.delete(tokenHash);
    throw new Error('Failed to deliver verification email via SMTP.');
  }
}

/**
 * Verify Email Token
 */
export function verifyEmailToken(rawToken: string): { success: boolean; email?: string; message: string } {
  if (!rawToken) {
    return { success: false, message: 'Missing verification token.' };
  }

  const tokenHash = hashToken(rawToken);
  const record = verificationTokens.get(tokenHash);

  if (!record || record.used) {
    return { success: false, message: 'Invalid or already used verification token.' };
  }

  if (Date.now() > record.expiresAt) {
    verificationTokens.delete(tokenHash);
    return { success: false, message: 'Verification token has expired.' };
  }

  record.used = true;
  verificationTokens.delete(tokenHash);
  return { success: true, email: record.email, message: 'Email address verified successfully!' };
}
