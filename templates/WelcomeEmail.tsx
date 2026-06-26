import { getEmailLayout } from './EmailLayout';

export function getWelcomeEmailHtml(fullName: string): string {
  const content = `
    <h2 style="color: #1E293B; margin: 0 0 20px 0; font-size: 22px; font-weight: 700;">Welcome to IQ Intern!</h2>

    <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
      Hi <strong>${fullName}</strong>,
    </p>

    <p style="font-size: 15px; color: #475569; margin: 0 0 25px 0;">
      Thank you for registering with IQ Intern. Your account has been created successfully.
    </p>

    <div style="background-color: #F1F5F9; border-radius: 12px; padding: 24px; margin: 0 0 30px 0;">
      <p style="font-size: 14px; font-weight: 700; color: #334155; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 0.5px;">You can now:</p>

      <table width="100%" cellPadding="0" cellSpacing="0">
        <tbody>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #475569;">
              <span style="margin-right: 8px;">✅</span> Explore internship opportunities
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #475569;">
              <span style="margin-right: 8px;">✅</span> Take internship assessments
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #475569;">
              <span style="margin-right: 8px;">✅</span> Download offer letters
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #475569;">
              <span style="margin-right: 8px;">✅</span> Access project reports
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #475569;">
              <span style="margin-right: 8px;">✅</span> Earn internship certificates
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #475569;">
              <span style="margin-right: 8px;">✅</span> Track your progress from your dashboard
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p style="font-size: 15px; color: #475569; margin: 0 0 30px 0;">
      We're excited to help you build real-world skills and advance your career.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://iqintern.com/dashboard" target="_blank" rel="noopener noreferrer" style="background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-size: 15px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);">
        Go to Dashboard
      </a>
    </div>
  `;

  return getEmailLayout('Empowering Students, Shaping Future', content);
}
