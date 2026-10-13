import nodemailer from 'nodemailer';

/**
 * Email transporter configuration.
 *
 * These environment variables should be set in your .env file:
 * - SMTP_HOST: SMTP server hostname (e.g., smtp.gmail.com)
 * - SMTP_PORT: SMTP server port (e.g., 587 for TLS, 465 for SSL)
 * - SMTP_SECURE: Use SSL (true for port 465, false for 587)
 * - SMTP_USER: SMTP authentication username
 * - SMTP_PASS: SMTP authentication password or app password
 * - SMTP_FROM: From email address (e.g., "Asset Manager <noreply@company.com>")
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.example.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER || 'user@example.com';
  const pass = process.env.SMTP_PASS || 'password';

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send an email notification
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const from = process.env.SMTP_FROM || 'Asset Manager <noreply@company.com>';

    const mailer = getTransporter();
    await mailer.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
    });

    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send a notification email with standard template
 */
export async function sendNotificationEmail({
  to,
  title,
  message,
  type,
  link,
}: {
  to: string;
  title: string;
  message: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'ERROR';
  link?: string;
}): Promise<boolean> {
  const typeColors: Record<string, string> = {
    WARNING: '#f59e0b',
    INFO: '#3b82f6',
    SUCCESS: '#10b981',
    ERROR: '#ef4444',
  };

  const color = typeColors[type] || '#6b7280';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${color}; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
      </div>
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">${message}</p>
        ${link ? `<a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${link}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; border-radius: 6px;">View Details</a>` : ''}
      </div>
      <div style="background: #f3f4f6; padding: 12px; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated notification from the Asset Management System.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `[Asset Manager] ${title}`,
    html,
  });
}
