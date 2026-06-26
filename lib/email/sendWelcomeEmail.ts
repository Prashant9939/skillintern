import nodemailer from 'nodemailer';
import { getWelcomeEmailHtml } from '@/templates/WelcomeEmail';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

export interface WelcomeEmailOptions {
  email: string;
  fullName: string;
  userId?: string;
}

export async function sendWelcomeEmail({ email, fullName, userId }: WelcomeEmailOptions) {
  let studentId = userId;
  const templateName = 'WelcomeEmail';
  const subject = 'Welcome to UG Intern 🚀 | Your Internship Journey Starts Here';

  // 1. Fetch user ID by email if not provided (needed for database logging)
  if (!studentId && isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email.trim())
        .maybeSingle();
      if (data) {
        studentId = data.id;
      }
    } catch (dbErr) {
      console.warn('Failed to retrieve user ID for email logging:', dbErr);
    }
  }

  // 2. Validate email address format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    console.error('Invalid email address format:', email);
    return { success: false, error: 'Invalid email address' };
  }

  try {
    // 3. Render the Welcome Email template to static HTML (via string template)
    const emailHtml = getWelcomeEmailHtml(fullName);

    // 4. Configure Nodemailer Transporter securely using environment variables
    let transporter;
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      // Use production SMTP configuration
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // True for 465, false for 587/other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Fallback: Create ethereal email test account for development/testing
      console.log('SMTP credentials not configured. Falling back to Ethereal Mail...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // 5. Send the Welcome Email
    const info = await transporter.sendMail({
      from: '"UG Intern Team" <prashantshiwam@gmail.com>',
      to: email,
      replyTo: 'prashantshiwam@gmail.com',
      subject,
      html: emailHtml,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`Welcome email successfully sent to ${email}. Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`Welcome email preview URL: ${previewUrl}`);
    }

    // 6. Log success to database (if configured)
    if (studentId && isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('email_logs').insert({
          student_id: studentId,
          recipient_email: email,
          subject,
          status: 'sent',
          message_id: info.messageId,
          preview_url: previewUrl,
          template_name: templateName,
        });
      } catch (logErr) {
        console.error('Failed to write successful email log to database:', logErr);
      }
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error: any) {
    console.error(`Failed to send welcome email to ${email}:`, error);

    // 7. Log failure to database (if configured)
    if (studentId && isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('email_logs').insert({
          student_id: studentId,
          recipient_email: email,
          subject,
          status: 'failed',
          error_message: error.message,
          template_name: templateName,
        });
      } catch (logErr) {
        console.error('Failed to write failed email log to database:', logErr);
      }
    }

    return { success: false, error: error.message };
  }
}
