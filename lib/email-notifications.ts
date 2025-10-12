import { sendVerificationEmail } from './email';

export async function sendAssignmentNotification({
  staffEmail,
  staffName,
  serviceType,
  customerName,
  preferredDate,
  preferredTime,
  address,
}: {
  staffEmail: string;
  staffName: string;
  serviceType: string;
  customerName: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
}) {
  // Reuse email infrastructure
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cleanoo.nl';

  try {
    await transporter.sendMail({
      from: `"Cleanoo" <${FROM_EMAIL}>`,
      to: staffEmail,
      subject: '🔔 New Assignment - Cleanoo',
      html: `
        <h2>Hi ${staffName}!</h2>
        <p>You have been assigned a new cleaning task:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Service:</strong> ${serviceType}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Date:</strong> ${preferredDate}</p>
          <p><strong>Time:</strong> ${preferredTime}</p>
          <p><strong>Address:</strong> ${address}</p>
        </div>
        <p>Please log in to your dashboard to view full details and accept the assignment.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/staff/dashboard" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Assignment</a></p>
        <p>Best regards,<br>Cleanoo Team</p>
      `,
    });

    console.log('✅ Assignment notification sent to:', staffEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send assignment notification:', error);
    return { success: false, error };
  }
}

