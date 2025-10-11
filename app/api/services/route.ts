import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/sqlite';
import { cachedResponse, CacheStrategies } from '@/lib/cache-helpers';

export async function GET() {
  try {
    const services = db.prepare('SELECT * FROM services ORDER BY created_at DESC').all();
    // Services change rarely, cache for 1 hour
    return cachedResponse(services, CacheStrategies.Medium);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, icon, price } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO services (title, description, icon, price) 
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(title, description, icon || '', price || '');
    
    // Get inserted record
    const inserted = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json({ 
      success: true, 
      data: inserted,
      message: 'Service successfully created'
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}