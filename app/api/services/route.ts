import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/sqlite';

export async function GET() {
  try {
    const services = db.prepare('SELECT * FROM services ORDER BY created_at DESC').all();
    
    // No cache for admin operations - always get fresh data
    const response = NextResponse.json({ 
      success: true, 
      data: services 
    });
    
    // Set no-cache headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
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
    const { 
      title, description, icon, price, detailed_info, duration, features,
      title_nl, title_en, title_tr, title_pl, title_bg, title_uk, title_ro,
      description_nl, description_en, description_tr, description_pl, description_bg, description_uk, description_ro
    } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO services (
        title, description, icon, price, detailed_info, duration, features,
        title_nl, title_en, title_tr, title_pl, title_bg, title_uk, title_ro,
        description_nl, description_en, description_tr, description_pl, description_bg, description_uk, description_ro
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      title, description, icon || '', price || '', detailed_info || '', duration || '', features || '',
      title_nl || '', title_en || '', title_tr || '', title_pl || '', title_bg || '', title_uk || '', title_ro || '',
      description_nl || '', description_en || '', description_tr || '', description_pl || '', description_bg || '', description_uk || '', description_ro || ''
    );
    
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