import { getEmailLayout } from './EmailLayout';

export function getOfferLetterEmailHtml(fullName: string, internshipTitle: string): string {
  const content = `
    <h2 style="color: #1E293B; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">Your Offer Letter is Ready</h2>
    <p style="font-size: 15px; color: #475569; margin: 0 0 15px 0;">Hi ${fullName},</p>
    <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
      We are happy to share that your official offer letter for the <strong>${internshipTitle}</strong> track has been generated.
    </p>
    <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
      You can review, download, and sign your offer letter directly from the documents section on your student portal.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://iqintern.com/student/documents" target="_blank" rel="noopener noreferrer" style="background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-weight: 600; display: inline-block;">
        View Documents
      </a>
    </div>
  `;
  return getEmailLayout('Offer Letter | IQ Intern', content);
}
