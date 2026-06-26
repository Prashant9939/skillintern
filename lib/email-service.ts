import nodemailer from 'nodemailer';
import { supabase, isSupabaseConfigured } from './supabase/client';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  studentId: string;
}

export async function sendEmail({ to, subject, html, studentId }: EmailOptions) {
  try {
    // We use ethereal email (free fake SMTP) to demonstrate email sending
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"UG Intern Support" <prashantshiwam@gmail.com>',
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", previewUrl);

    // Log the email in Supabase (or mock)
    if (isSupabaseConfigured() && supabase) {
      await supabase.from("email_logs").insert({
        student_id: studentId,
        recipient_email: to,
        subject,
        status: "sent",
        message_id: info.messageId,
        preview_url: previewUrl,
      });
    } else {
      // Mock log to local storage when in dev mode
      if (typeof window === "undefined") {
        console.log("Email logged (mock mode)");
      }
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error: any) {
    console.error("Failed to send email:", error);

    if (isSupabaseConfigured() && supabase) {
      await supabase.from("email_logs").insert({
        student_id: studentId,
        recipient_email: to,
        subject,
        status: "failed",
      });
    }

    return { success: false, error: error.message };
  }
}
