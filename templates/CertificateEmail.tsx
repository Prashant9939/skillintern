import { getEmailLayout } from './EmailLayout';

export function getCertificateEmailHtml(fullName: string, internshipTitle: string): string {
  const content = `
    <h2 style="color: #1E293B; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">Congratulations on Your Graduation!</h2>
    <p style="font-size: 15px; color: #475569; margin: 0 0 15px 0;">Hi ${fullName},</p>
    <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
      You have successfully completed all the requirements, assessments, and tasks for the <strong>${internshipTitle}</strong> track.
    </p>
    <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
      Your official skill certificate has been verified and generated. You can view, verify, and download it from the certificates section of your portal.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://iqintern.com/student/certificates" target="_blank" rel="noopener noreferrer" style="background-color: #8B5CF6; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-weight: 600; display: inline-block;">
        Get Certificate
      </a>
    </div>
    <p style="font-size: 14px; color: #475569; margin: 20px 0 0 0;">
      We are incredibly proud of your hard work and dedication. Keep learning and building amazing things!
    </p>
  `;
  return getEmailLayout('Certificate Generated 🎓', content);
}
