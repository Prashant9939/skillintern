export function getEmailLayout(title: string, contentHtml: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #1E293B; margin: 0; padding: 40px 20px; line-height: 1.6;">
      <table align="center" border="0" cellPadding="0" cellSpacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
        {/* Header/Banner Section */}
        <tr>
          <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #8B5CF6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0 0 10px 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">IQ Intern</h1>
            <p style="color: #E0E7FF; margin: 0; font-size: 16px; font-weight: 400;">${title}</p>
          </td>
        </tr>

        {/* Content Section */}
        <tr>
          <td style="padding: 40px 30px;">
            ${contentHtml}
          </td>
        </tr>

        {/* Footer Section */}
        <tr>
          <td style="border-top: 1px solid #E2E8F0; background-color: #F8FAFC; padding: 30px; text-align: center; border-radius: 0 0 16px 16px;">
            <p style="font-size: 13px; color: #64748B; margin: 0 0 8px 0; font-weight: 500;">Need help?</p>
            <p style="font-size: 13px; color: #4F46E5; margin: 0 0 24px 0; font-weight: 600;">
              Contact us: <a href="mailto:prashantshiwam@gmail.com" style="color: #4F46E5; text-decoration: none;">prashantshiwam@gmail.com</a>
            </p>
            <p style="font-size: 12px; color: #94A3B8; margin: 0;">
              &copy; ${new Date().getFullYear()} IQ Intern. All rights reserved.
            </p>
            <p style="font-size: 11px; color: #94A3B8; margin: 4px 0 0 0; font-style: italic;">
              Empowering Students, Shaping Future
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}
