import nodemailer from 'nodemailer';

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'admin@cleanoo.nl';

function getTransporter() {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Notify admin of new booking
export async function notifyNewBooking(booking: any) {
  try {
    const transporter = getTransporter();
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .label { font-weight: bold; color: #4b5563; }
          .value { color: #1f2937; }
          .badge { background: #fef3c7; color: #92400e; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 15px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .urgent { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Booking Alert!</h1>
            <p>Action Required: Review and Confirm</p>
          </div>
          <div class="content">
            <div class="urgent">
              <strong>⚠️ Pending Confirmation</strong><br>
              A new booking is waiting for your review and confirmation.
            </div>
            
            <h3>Customer Information:</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${booking.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${booking.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${booking.phone}</span>
            </div>
            <div class="detail-row">
              <span class="label">Address:</span>
              <span class="value">${booking.address}</span>
            </div>
            
            <h3 style="margin-top: 25px;">Booking Details:</h3>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${booking.service_type}</span>
            </div>
            <div class="detail-row">
              <span class="label">Requested Date:</span>
              <span class="value">${new Date(booking.preferred_date).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Requested Time:</span>
              <span class="value">${booking.preferred_time}</span>
            </div>
            ${booking.notes ? `
            <div class="detail-row">
              <span class="label">Notes:</span>
              <span class="value">${booking.notes}</span>
            </div>
            ` : ''}
            
            <p style="margin-top: 25px; font-weight: bold; color: #dc2626;">
              Please review this booking and confirm or reschedule via the admin panel.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://cleanoo.nl/admin" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Go to Admin Panel
              </a>
            </div>
            
            <div class="footer">
              <p>Cleanoo Admin Panel</p>
              <p>This is an automated notification</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: ADMIN_EMAIL,
      subject: '🔔 New Booking Alert - Action Required',
      html: emailHtml,
    });

    console.log('✅ Admin notification sent for new booking');
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
  }
}

// Notify admin of new customer registration
export async function notifyNewCustomer(customer: any) {
  try {
    const transporter = getTransporter();
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .label { font-weight: bold; color: #4b5563; }
          .value { color: #1f2937; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👤 New Customer Registered!</h1>
            <p>A new customer has joined Cleanoo</p>
          </div>
          <div class="content">
            <h3>Customer Details:</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${customer.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${customer.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${customer.phone || 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Address:</span>
              <span class="value">${customer.address || 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Registered:</span>
              <span class="value">${new Date().toLocaleString()}</span>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://cleanoo.nl/admin" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View in Admin Panel
              </a>
            </div>
            
            <div class="footer">
              <p>Cleanoo Admin Panel</p>
              <p>This is an automated notification</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: ADMIN_EMAIL,
      subject: '👤 New Customer Registration - Cleanoo',
      html: emailHtml,
    });

    console.log('✅ Admin notification sent for new customer');
  } catch (error) {
    console.error('❌ Failed to send customer notification:', error);
  }
}

// Notify admin of new staff registration
export async function notifyNewStaff(staff: any) {
  try {
    const transporter = getTransporter();
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .label { font-weight: bold; color: #4b5563; }
          .value { color: #1f2937; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👷 New Staff Member!</h1>
            <p>Someone has applied to join the team</p>
          </div>
          <div class="content">
            <h3>Staff Details:</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">${staff.name}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${staff.email}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${staff.phone || 'Not provided'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Role:</span>
              <span class="value">${staff.role || 'cleaner'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Experience:</span>
              <span class="value">${staff.experience_years || 0} years</span>
            </div>
            <div class="detail-row">
              <span class="label">Specialization:</span>
              <span class="value">${staff.specialization || 'Not specified'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Registered:</span>
              <span class="value">${new Date().toLocaleString()}</span>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://cleanoo.nl/admin" style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Review in Admin Panel
              </a>
            </div>
            
            <div class="footer">
              <p>Cleanoo Admin Panel</p>
              <p>This is an automated notification</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: ADMIN_EMAIL,
      subject: '👷 New Staff Application - Cleanoo',
      html: emailHtml,
    });

    console.log('✅ Admin notification sent for new staff');
  } catch (error) {
    console.error('❌ Failed to send staff notification:', error);
  }
}

// Notify staff of new assignment
export async function sendAssignmentNotification(assignment: any) {
  try {
    const transporter = getTransporter();
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 5px; }
          .label { font-weight: bold; color: #4b5563; }
          .value { color: #1f2937; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Assignment</h1>
            <p>You have a new cleaning assignment</p>
          </div>
          <div class="content">
            <p>Dear ${assignment.staff_name || 'Team Member'},</p>
            <p>You have been assigned to a new cleaning job. Please review the details below:</p>
            
            <h3>Job Details:</h3>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${assignment.service_type}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${assignment.preferred_date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${assignment.preferred_time}</span>
            </div>
            <div class="detail-row">
              <span class="label">Address:</span>
              <span class="value">${assignment.customer_address}</span>
            </div>
            <div class="detail-row">
              <span class="label">Customer:</span>
              <span class="value">${assignment.customer_name}</span>
            </div>
            ${assignment.booking_notes ? `
            <div class="detail-row">
              <span class="label">Notes:</span>
              <span class="value">${assignment.booking_notes}</span>
            </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="https://cleanoo.nl/staff/dashboard" class="button">View in Dashboard</a>
            </div>
            
            <div class="footer">
              <p>Cleanoo - Professional Cleaning Services</p>
              <p>Please check your dashboard for more details</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: assignment.staff_email,
      subject: '📋 New Assignment - Cleanoo',
      html: emailHtml,
    });

    console.log('✅ Assignment notification sent to staff');
  } catch (error) {
    console.error('❌ Failed to send assignment notification:', error);
  }
}
