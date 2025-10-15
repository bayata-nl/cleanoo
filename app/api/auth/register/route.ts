import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/sqlite';
import bcrypt from 'bcryptjs';
import { createUserToken, setUserCookie } from '@/lib/auth';
import { notifyNewCustomer } from '@/lib/email-notifications';

export async function POST(request: NextRequest) {
  try {
    const { email, password, phone, address, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, phone, address, password, email_verified)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertUser.run(
      name || email.split('@')[0],
      email,
      phone || '',
      address || '',
      hashedPassword,
      false
    );

    const newUser = db.prepare('SELECT id, name, email, phone, address, email_verified FROM users WHERE id = ?').get(result.lastInsertRowid);

    // Create JWT token
    const token = createUserToken({
      id: String((newUser as any).id),
      email: (newUser as any).email,
      role: 'customer',
      name: (newUser as any).name
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: String((newUser as any).id),
        name: (newUser as any).name,
        email: (newUser as any).email,
        phone: (newUser as any).phone,
        address: (newUser as any).address
      },
      message: 'Account created successfully'
    });

    setUserCookie(response, token);

    // Notify admin of new customer
    await notifyNewCustomer(newUser);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create account' }, { status: 500 });
  }
}

