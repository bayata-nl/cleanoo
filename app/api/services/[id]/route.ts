import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/sqlite';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    return NextResponse.json(service);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, description, icon, price, detailed_info, duration, features,
      title_nl, title_en, title_tr, title_pl, title_bg, title_uk, title_ro,
      description_nl, description_en, description_tr, description_pl, description_bg, description_uk, description_ro
    } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json({ 
        success: false,
        error: 'Title and description are required' 
      }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE services 
      SET 
        title = ?, description = ?, icon = ?, price = ?, 
        detailed_info = ?, duration = ?, features = ?,
        title_nl = ?, title_en = ?, title_tr = ?, title_pl = ?, title_bg = ?, title_uk = ?, title_ro = ?,
        description_nl = ?, description_en = ?, description_tr = ?, description_pl = ?, description_bg = ?, description_uk = ?, description_ro = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      title, description, icon || '', price || '', detailed_info || '', duration || '', features || '',
      title_nl || '', title_en || '', title_tr || '', title_pl || '', title_bg || '', title_uk || '', title_ro || '',
      description_nl || '', description_en || '', description_tr || '', description_pl || '', description_bg || '', description_uk || '', description_ro || '',
      id
    );
    
    if (result.changes === 0) {
      return NextResponse.json({ 
        success: false,
        error: 'Service not found' 
      }, { status: 404 });
    }
    
    // Get updated record
    const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    
    return NextResponse.json({ 
      success: true, 
      data: updated,
      message: 'Service successfully updated'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stmt = db.prepare('DELETE FROM services WHERE id = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Service successfully deleted'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}