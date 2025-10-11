import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'
import { requireAdminJson } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAdminJson(request)
    if (unauthorized) return unauthorized

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // day, week, month, year
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Overall Statistics
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get() as any
    const totalAssignments = db.prepare('SELECT COUNT(*) as count FROM assignments').get() as any
    const totalStaff = db.prepare('SELECT COUNT(*) as count FROM staff WHERE status = ?').get('active') as any
    const totalTeams = db.prepare('SELECT COUNT(*) as count FROM teams WHERE status = ?').get('active') as any

    // Recent Activity
    const recentBookings = db.prepare(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE created_at >= ?
    `).get(startDate.toISOString()) as any

    const recentAssignments = db.prepare(`
      SELECT COUNT(*) as count FROM assignments 
      WHERE assigned_at >= ?
    `).get(startDate.toISOString()) as any

    // Status Breakdown
    const bookingStatusBreakdown = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM bookings 
      GROUP BY status
    `).all()

    const assignmentStatusBreakdown = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM assignments 
      GROUP BY status
    `).all()

    // Staff Performance
    const staffPerformance = db.prepare(`
      SELECT 
        s.name,
        s.role,
        COUNT(a.id) as total_assignments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_assignments,
        COUNT(CASE WHEN a.status = 'in_progress' THEN 1 END) as in_progress_assignments,
        COUNT(CASE WHEN a.status = 'assigned' THEN 1 END) as pending_assignments
      FROM staff s
      LEFT JOIN assignments a ON s.id = a.staff_id
      WHERE s.status = 'active'
      GROUP BY s.id, s.name, s.role
      ORDER BY completed_assignments DESC
    `).all()

    // Team Performance
    const teamPerformance = db.prepare(`
      SELECT 
        t.name,
        COUNT(tm.staff_id) as member_count,
        COUNT(a.id) as total_assignments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_assignments
      FROM teams t
      LEFT JOIN team_members tm ON t.id = tm.team_id
      LEFT JOIN assignments a ON t.id = a.team_id
      WHERE t.status = 'active'
      GROUP BY t.id, t.name
      ORDER BY completed_assignments DESC
    `).all()

    // Daily Activity (last 7 days)
    const dailyActivity = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bookings
      FROM bookings 
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all(startDate.toISOString())

    // Service Type Breakdown
    const serviceBreakdown = db.prepare(`
      SELECT 
        service_type,
        COUNT(*) as count
      FROM bookings 
      GROUP BY service_type
      ORDER BY count DESC
    `).all()

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalBookings: totalBookings.count,
          totalAssignments: totalAssignments.count,
          totalStaff: totalStaff.count,
          totalTeams: totalTeams.count,
          recentBookings: recentBookings.count,
          recentAssignments: recentAssignments.count
        },
        bookingStatusBreakdown,
        assignmentStatusBreakdown,
        staffPerformance,
        teamPerformance,
        dailyActivity,
        serviceBreakdown,
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}


