import { getEmailLayout } from './EmailLayout';

export function getPaymentConfirmationEmailHtml(fullName: string, amount: number, orderId: string, internshipTitle: string): string {
  const content = `
    <h2 style="color: #1E293B; margin: 0 0 20px 0; font-size: 20px; font-weight: 700;">Thank You for Your Payment!</h2>
    <p style="font-size: 15px; color: #475569; margin: 0 0 15px 0;">Hi ${fullName},</p>
    <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">
      This email confirms that your payment of <strong>INR ${(amount / 100).toFixed(2)}</strong> for the <strong>${internshipTitle}</strong> track has been processed successfully.
    </p>
    <div style="border: 1px dashed #CBD5E1; border-radius: 12px; padding: 20px; margin: 25px 0;">
      <table width="100%" cellPadding="0" cellSpacing="0" style="font-size: 14px; color: #475569;">
        <tbody>
          <tr>
            <td style="padding: 4px 0;"><strong>Order ID:</strong></td>
            <td align="right" style="color: #334155;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Amount Paid:</strong></td>
            <td align="right" style="color: #334155; font-weight: bold;">INR ${(amount / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Status:</strong></td>
            <td align="right" style="color: #10B981; font-weight: bold;">Completed</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://ugintern.com/student/payment" target="_blank" rel="noopener noreferrer" style="background-color: #4F46E5; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-weight: 600; display: inline-block;">
        View Payment Details
      </a>
    </div>
  `;
  return getEmailLayout('Payment Confirmed | Receipt', content);
}
