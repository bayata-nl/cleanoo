import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      staffId,
      zzp_number,
      kvk_number,
      bsn_number,
      brp_number,
      car_type,
      bhv_certificate,
      identity_document,
      passport_number,
      bank_account,
    } = body

    if (!staffId) {
      return NextResponse.json({ success: false, error: 'Staff ID is required' }, { status: 400 })
    }

    // Check if staff exists and is verified
    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(staffId)

    if (!staff) {
      return NextResponse.json({ success: false, error: 'Staff not found' }, { status: 404 })
    }

    const staffData = staff as any

    if (!staffData.email_verified) {
      return NextResponse.json({ success: false, error: 'Email not verified' }, { status: 400 })
    }

    // Update staff with detailed information
    db.prepare(`
      UPDATE staff 
      SET 
        zzp_number = ?,
        kvk_number = ?,
        bsn_number = ?,
        brp_number = ?,
        car_type = ?,
        bhv_certificate = ?,
        identity_document = ?,
        passport_number = ?,
        bank_account = ?,
        approval_status = 'pending_approval',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      zzp_number || null,
      kvk_number || null,
      bsn_number || null,
      brp_number || null,
      car_type || null,
      bhv_certificate ? 1 : 0,
      identity_document || null,
      passport_number || null,
      bank_account || null,
      staffId
    )

    // Send notification to admin
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

      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #4b5563; }
            .value { color: #1f2937; }
            .urgent { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏳ Staff Profile Completed - Approval Required</h1>
              <p>Review and approve new team member</p>
            </div>
            <div class="content">
              <div class="urgent">
                <strong>⚠️ Action Required</strong><br>
                A staff member has completed their profile and is waiting for approval.
              </div>
              
              <h3>Personal Information:</h3>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${staffData.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${staffData.email}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span class="value">${staffData.phone}</span>
              </div>
              
              <h3 style="margin-top: 25px;">Professional Information:</h3>
              ${zzp_number ? `
              <div class="detail-row">
                <span class="label">ZZP Number:</span>
                <span class="value">${zzp_number}</span>
              </div>
              ` : ''}
              ${kvk_number ? `
              <div class="detail-row">
                <span class="label">KVK Number:</span>
                <span class="value">${kvk_number}</span>
              </div>
              ` : ''}
              ${bsn_number ? `
              <div class="detail-row">
                <span class="label">BSN Number:</span>
                <span class="value">${bsn_number}</span>
              </div>
              ` : ''}
              ${brp_number ? `
              <div class="detail-row">
                <span class="label">BRP Number:</span>
                <span class="value">${brp_number}</span>
              </div>
              ` : ''}
              ${car_type ? `
              <div class="detail-row">
                <span class="label">Car Type:</span>
                <span class="value">${car_type}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="label">BHV Certificate:</span>
                <span class="value">${bhv_certificate ? '✅ Yes' : '❌ No'}</span>
              </div>
              ${identity_document ? `
              <div class="detail-row">
                <span class="label">Identity Document:</span>
                <span class="value">${identity_document}</span>
              </div>
              ` : ''}
              ${passport_number ? `
              <div class="detail-row">
                <span class="label">Passport Number:</span>
                <span class="value">${passport_number}</span>
              </div>
              ` : ''}
              ${bank_account ? `
              <div class="detail-row">
                <span class="label">Bank Account:</span>
                <span class="value">${bank_account}</span>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://cleanoo.nl/admin" style="background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                  Review & Approve in Admin Panel
                </a>
              </div>
              
              <div class="footer">
                <p>Cleanoo Admin Panel</p>
                <p>This staff member cannot login until approved</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: adminEmail,
        subject: '⏳ Staff Profile Completed - Approval Required',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Admin notification email failed:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profile completed successfully! Your application is now pending approval.',
    })
  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

