import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import bcrypt from 'bcryptjs'
import { notifyNewStaff } from '@/lib/email-notifications'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, address, password } = body

    if (!name || !email || !phone || !address || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 })
    }

    const existing = db.prepare('SELECT id FROM staff WHERE email = ?').get(email.toLowerCase())
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex')

    const stmt = db.prepare(`
      INSERT INTO staff (
        name, email, phone, address, password, 
        role, status, approval_status,
        email_verified, verification_token
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    const result = stmt.run(
      name, 
      email.toLowerCase(), 
      phone, 
      address, 
      hashedPassword, 
      'cleaner', 
      'inactive', // Inactive until approved
      'pending_info', // Waiting for detailed info
      false, // Not verified yet
      verificationToken
    )

    // Send verification email
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

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/staff/verify-email?token=${verificationToken}`;
      
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #8b5cf6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👷 Welcome to Cleanoo Team!</h1>
              <p>Verify your email to continue</p>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for applying to join our cleaning team! To continue with your application, please verify your email address.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p style="margin-top: 30px;">After verifying your email, you'll be asked to provide additional information required for employment.</p>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you didn't apply for this position, please ignore this email.
              </p>
              
              <div class="footer">
                <p>Cleanoo - Professional Cleaning Services</p>
                <p>This link will expire in 24 hours</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email.toLowerCase(),
        subject: '✅ Verify Your Email - Cleanoo Team Application',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      // Continue even if email fails
    }

    // Notify admin of new staff application
    await notifyNewStaff({ 
      name, 
      email: email.toLowerCase(), 
      phone, 
      address,
      role: 'cleaner',
      experience_years: 0,
      specialization: 'To be provided'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true
    })
  } catch (error) {
    console.error('Staff self-register error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}




