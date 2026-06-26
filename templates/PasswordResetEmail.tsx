import { getEmailLayout } from './EmailLayout';

export function getPasswordResetEmailHtml(fullName: string, resetUrl: string): string {
  const content = `
    <h2 style="color: #1E293B; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">Reset Your Password</h2>
    <p style="font-size: 15px; color: #475569; margin: 0 0 15px 0;">Hi ${fullName},</p>
    <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
      We received a request to reset your password for your IQ Intern account. Click the button below to choose a new password:
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #7C3AED; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-weight: 600; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="font-size: 14px; color: #64748B; margin: 20px 0 0 0;">
      If you did not request this change, you can safely ignore this email. This link will expire in 2 hours.
    </p>
  `;
  return getEmailLayout('Security Alert | Password Reset Request', content);
}
