import { getEmailLayout } from './EmailLayout';

export function getInternshipApprovalEmailHtml(fullName: string, internshipTitle: string): string {
  const content = `
    <h2 style="color: #1E293B; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">Your Internship Has Been Approved!</h2>
    <p style="font-size: 15px; color: #475569; margin: 0 0 15px 0;">Hi ${fullName},</p>
    <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
      We are thrilled to inform you that your application for the <strong>${internshipTitle}</strong> track has been approved by our mentors.
    </p>
    <div style="background-color: #F1F5F9; border-radius: 12px; padding: 20px; margin: 25px 0;">
      <p style="font-size: 14px; color: #334155; margin: 0 0 8px 0;"><strong>Next Steps:</strong></p>
      <ol style="font-size: 14px; color: #475569; margin: 0; padding-left: 20px;">
        <li style="margin: 6px 0;">Go to your dashboard to download your official offer letter.</li>
        <li style="margin: 6px 0;">Explore the training modules and assignments.</li>
        <li style="margin: 6px 0;">Join the community groups for mentor guidance.</li>
      </ol>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://ugintern.com/student/dashboard" target="_blank" rel="noopener noreferrer" style="background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-weight: 600; display: inline-block;">
        Access Dashboard
      </a>
    </div>
  `;
  return getEmailLayout('Congratulations | Internship Approved', content);
}
