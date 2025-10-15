import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/sqlite';
import { requireAdminJson } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdminJson(request);
    if (unauthorized) return unauthorized;

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking ID required' 
      }, { status: 400 });
    }

    // Get booking details
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);

    if (!booking) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    // Update booking status to confirmed
    db.prepare('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('confirmed', bookingId);

    // Send confirmation email
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const bookingData = booking as any;
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #4b5563; }
            .value { color: #1f2937; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
              <p>Your cleaning service has been confirmed</p>
            </div>
            <div class="content">
              <p>Dear ${bookingData.name},</p>
              <p>Your booking has been confirmed! Here are the details:</p>
              
              <div class="detail-row">
                <span class="label">Service:</span>
                <span class="value">${bookingData.service_type}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${new Date(bookingData.preferred_date).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${bookingData.preferred_time}</span>
              </div>
              <div class="detail-row">
                <span class="label">Address:</span>
                <span class="value">${bookingData.address}</span>
              </div>
              ${bookingData.notes ? `
              <div class="detail-row">
                <span class="label">Notes:</span>
                <span class="value">${bookingData.notes}</span>
              </div>
              ` : ''}
              
              <p style="margin-top: 20px;">We look forward to serving you!</p>
              
              <div class="footer">
                <p>Cleanoo - Professional Cleaning Services</p>
                <p>If you have any questions, please contact us.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: bookingData.email,
        subject: '✅ Booking Confirmed - Cleanoo',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking confirmed and email sent' 
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to confirm booking' 
    }, { status: 500 });
  }
}

