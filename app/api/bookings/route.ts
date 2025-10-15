import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { getAdminFromRequest } from '@/lib/auth'
import nodemailer from 'nodemailer'
import { notifyNewBooking } from '@/lib/email-notifications'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const isAdmin = !!getAdminFromRequest(request)
    
    let query = 'SELECT * FROM bookings ORDER BY created_at DESC'
    let params: string[] = []
    
    if (email) {
      query = 'SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC'
      params = [email]
    } else if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    const stmt = db.prepare(query)
    const result = email ? stmt.all(params) : stmt.all()
    
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.name || !body.email || !body.phone || !body.address || !body.serviceType || !body.preferredDate || !body.preferredTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Check if user exists and get user_id
    let userId = null;
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(body.email.trim().toLowerCase());
    if (existingUser) {
      userId = (existingUser as any).id;
    }
    
    const query = `
      INSERT INTO bookings (name, email, phone, address, service_type, preferred_date, preferred_time, notes, status, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const values = [
      body.name.trim(),
      body.email.trim().toLowerCase(),
      body.phone.trim(),
      body.address.trim(),
      body.serviceType,
      body.preferredDate,
      body.preferredTime,
      body.notes?.trim() || null,
      'pending', // All bookings start as pending, admin confirms
      userId
    ]
    
    const stmt = db.prepare(query)
    const result = stmt.run(values)
    
    // Get inserted record
    const inserted = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid)
    
    // Send "Booking Received" email
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

      const bookingData = inserted as any;
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
            .pending-badge { background: #fef3c7; color: #92400e; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 15px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Booking Received!</h1>
              <p>Thank you for your booking request</p>
            </div>
            <div class="content">
              <p>Dear ${bookingData.name},</p>
              <p>We have received your booking request. Our team will review it and send you a confirmation shortly.</p>
              
              <div class="pending-badge">⏳ Pending Confirmation</div>
              
              <div class="detail-row">
                <span class="label">Service:</span>
                <span class="value">${bookingData.service_type}</span>
              </div>
              <div class="detail-row">
                <span class="label">Requested Date:</span>
                <span class="value">${new Date(bookingData.preferred_date).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Requested Time:</span>
                <span class="value">${bookingData.preferred_time}</span>
              </div>
              <div class="detail-row">
                <span class="label">Address:</span>
                <span class="value">${bookingData.address}</span>
              </div>
              
              <p style="margin-top: 20px;">You will receive a confirmation email once your booking is approved.</p>
              
              <div class="footer">
                <p>Cleanoo - Professional Cleaning Services</p>
                <p>Questions? Contact us at info@cleanoo.nl</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: bookingData.email,
        subject: '📋 Booking Received - Cleanoo',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }

    // Notify admin of new booking
    await notifyNewBooking(inserted);
    
    return NextResponse.json({ 
      success: true, 
      data: inserted,
      message: 'Booking successfully created'
    }, { status: 201 })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
