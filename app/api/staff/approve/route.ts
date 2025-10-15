import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { requireAdminJson } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdminJson(request)
    if (unauthorized) return unauthorized

    const body = await request.json()
    const { staffId, action, rejectionReason } = body

    if (!staffId || !action) {
      return NextResponse.json({ success: false, error: 'Staff ID and action required' }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    // Get staff details
    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId)

    if (!staff) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 })
    }

    const staffData = staff as any

    if (action === 'approve') {
      // Approve staff
      db.prepare(`
        UPDATE staff 
        SET 
          approval_status = 'approved',
          status = 'active',
          approved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(staffId)

      // Send approval email
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

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-badge { background: #d1fae5; color: #065f46; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; font-weight: bold; }
              .button { display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to Cleanoo Team!</h1>
                <p>Your application has been approved</p>
              </div>
              <div class="content">
                <div class="success-badge">✅ APPROVED</div>
                
                <p>Dear ${staffData.name},</p>
                <p>Congratulations! Your application to join Cleanoo has been approved. You can now log in and start working with us.</p>
                
                <h3 style="margin-top: 25px;">Next Steps:</h3>
                <ul style="color: #4b5563;">
                  <li>Log in to your staff dashboard using your email and password</li>
                  <li>Complete your profile if needed</li>
                  <li>Check your assignments and schedule</li>
                  <li>Contact your supervisor for any questions</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="https://cleanoo.nl/staff/login" class="button">Login to Dashboard</a>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                  <strong>Login Details:</strong><br>
                  Email: ${staffData.email}<br>
                  Use the password you created during registration
                </p>
                
                <div class="footer">
                  <p>Cleanoo - Professional Cleaning Services</p>
                  <p>Welcome to the team! We're excited to work with you.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: staffData.email,
          subject: '🎉 Application Approved - Welcome to Cleanoo Team!',
          html: emailHtml,
        });
      } catch (emailError) {
        console.error('Approval email failed:', emailError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Staff approved successfully. Approval email sent.',
      })
    } else {
      // Reject staff
      db.prepare(`
        UPDATE staff 
        SET 
          approval_status = 'rejected',
          status = 'inactive',
          rejection_reason = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(rejectionReason || 'Application rejected', staffId)

      // Send rejection email
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

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Application Status Update</h1>
              </div>
              <div class="content">
                <p>Dear ${staffData.name},</p>
                <p>Thank you for your interest in joining Cleanoo. After reviewing your application, we regret to inform you that we are unable to proceed with your application at this time.</p>
                
                ${rejectionReason ? `
                <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <strong>Reason:</strong><br>
                  ${rejectionReason}
                </div>
                ` : ''}
                
                <p>If you believe this is a mistake or would like more information, please contact us.</p>
                
                <div class="footer">
                  <p>Cleanoo - Professional Cleaning Services</p>
                  <p>Email: admin@cleanoo.nl | Phone: +31 12 345 6789</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: staffData.email,
          subject: 'Application Status Update - Cleanoo',
          html: emailHtml,
        });
      } catch (emailError) {
        console.error('Rejection email failed:', emailError);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Staff application rejected. Notification email sent.',
      })
    }
  } catch (error) {
    console.error('Staff approval error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

