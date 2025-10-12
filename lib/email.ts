import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@cleanoo.nl';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface SendVerificationEmailParams {
  to: string;
  name: string;
  token: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
}

export interface SendWelcomeEmailParams {
  to: string;
  name: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  bookingId: string;
}

export async function sendVerificationEmail({
  to,
  name,
  token,
  serviceType,
  preferredDate,
  preferredTime,
}: SendVerificationEmailParams) {
  const verificationUrl = `${APP_URL}/verify-booking?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Verify your booking with Cleanoo',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Booking</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✨ Cleanoo</h1>
                        <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">Professional Cleaning Services</p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">Hi ${name}! 👋</h2>
                        <p style="margin: 0 0 20px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                          Thank you for choosing Cleanoo! We're excited to help you with your cleaning needs.
                        </p>
                        <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                          Please click the button below to verify your email and complete your booking:
                        </p>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 20px 0;">
                              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                                Verify My Booking
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Booking Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                          <tr>
                            <td>
                              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px;">📋 Booking Details</h3>
                              <table width="100%" cellpadding="8" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; width: 40%;">Service:</td>
                                  <td style="color: #111827; font-size: 14px; font-weight: bold;">${serviceType}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;">Date:</td>
                                  <td style="color: #111827; font-size: 14px; font-weight: bold;">${preferredDate}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;">Time:</td>
                                  <td style="color: #111827; font-size: 14px; font-weight: bold;">${preferredTime}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 30px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                          ⏱️ This link expires in 24 hours.
                        </p>
                        <p style="margin: 10px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                          If you didn't request this, please ignore this email.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                          Best regards,<br>
                          <strong>The Cleanoo Team</strong>
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} Cleanoo. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }

    console.log('✅ Verification email sent to:', to);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
}

export async function sendWelcomeEmail({
  to,
  name,
  serviceType,
  preferredDate,
  preferredTime,
  bookingId,
}: SendWelcomeEmailParams) {
  const dashboardUrl = `${APP_URL}/dashboard`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: '🎉 Your Cleanoo booking is confirmed!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmed</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🎉</h1>
                        <h2 style="margin: 10px 0 0; color: #ffffff; font-size: 24px; font-weight: bold;">Booking Confirmed!</h2>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px;">Hi ${name}! 👋</h2>
                        <p style="margin: 0 0 20px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                          Great news! Your account has been created and your booking is confirmed.
                        </p>
                        
                        <!-- Success Badge -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                          <tr>
                            <td align="center">
                              <div style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 12px 24px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                                ✓ Booking ID: #${bookingId}
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Login Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 20px; border-left: 4px solid #2563eb;">
                          <tr>
                            <td>
                              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px;">🔑 Your Login Details</h3>
                              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                <strong>Email:</strong> ${to}
                              </p>
                              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                <strong>Password:</strong> The one you just created
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Booking Details -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                          <tr>
                            <td>
                              <h3 style="margin: 0 0 15px; color: #111827; font-size: 18px;">📋 Booking Details</h3>
                              <table width="100%" cellpadding="8" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; width: 40%;">Service:</td>
                                  <td style="color: #111827; font-size: 14px; font-weight: bold;">${serviceType}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;">Date:</td>
                                  <td style="color: #111827; font-size: 14px; font-weight: bold;">${preferredDate}</td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px;">Time:</td>
                                  <td style="color: #111827; font-size: 14px; font-weight: bold;">${preferredTime}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 30px 0 20px;">
                              <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                                Go to Dashboard
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                          From your dashboard, you can manage your bookings, view history, and book more services.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                          Thank you for choosing Cleanoo!<br>
                          <strong>We look forward to serving you.</strong>
                        </p>
                        <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px;">
                          Need help? Reply to this email or contact us at info@cleanoo.nl
                        </p>
                        <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                          © ${new Date().getFullYear()} Cleanoo. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }

    console.log('✅ Welcome email sent to:', to);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
}

