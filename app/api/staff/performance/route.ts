import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/sqlite'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staff_id = searchParams.get('staff_id')
    const period = searchParams.get('period') || 'week' // day, week, month, year

    if (!staff_id) {
      return NextResponse.json({
        success: false,
        error: 'Staff ID is required'
      }, { status: 400 })
    }

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

    // Staff Performance Overview
    const performanceOverview = db.prepare(`
      SELECT 
        COUNT(*) as total_assignments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_assignments,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_assignments,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as pending_assignments,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_assignments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_assignments
      FROM assignments 
      WHERE staff_id = ? AND assigned_at >= ?
    `).get(staff_id, startDate.toISOString()) as any

    // Recent Activity (last 7 days)
    const recentActivity = db.prepare(`
      SELECT 
        DATE(assigned_at) as date,
        COUNT(*) as assignments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM assignments 
      WHERE staff_id = ? AND assigned_at >= ?
      GROUP BY DATE(assigned_at)
      ORDER BY date DESC
    `).all(staff_id, startDate.toISOString())

    // Service Type Performance
    const servicePerformance = db.prepare(`
      SELECT 
        b.service_type,
        COUNT(a.id) as total_assignments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_assignments,
        ROUND(
          (COUNT(CASE WHEN a.status = 'completed' THEN 1 END) * 100.0 / COUNT(a.id)), 2
        ) as success_rate
      FROM assignments a
      JOIN bookings b ON a.booking_id = b.id
      WHERE a.staff_id = ? AND a.assigned_at >= ?
      GROUP BY b.service_type
      ORDER BY completed_assignments DESC
    `).all(staff_id, startDate.toISOString())

    // Time-based Performance
    const timePerformance = db.prepare(`
      SELECT 
        CASE 
          WHEN strftime('%H', assigned_at) BETWEEN '06' AND '11' THEN 'Morning (6-11)'
          WHEN strftime('%H', assigned_at) BETWEEN '12' AND '17' THEN 'Afternoon (12-17)'
          WHEN strftime('%H', assigned_at) BETWEEN '18' AND '23' THEN 'Evening (18-23)'
          ELSE 'Night (0-5)'
        END as time_period,
        COUNT(*) as assignments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        ROUND(
          (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2
        ) as success_rate
      FROM assignments 
      WHERE staff_id = ? AND assigned_at >= ?
      GROUP BY time_period
      ORDER BY success_rate DESC
    `).all(staff_id, startDate.toISOString())

    // Team Performance (if staff is in teams)
    const teamPerformance = db.prepare(`
      SELECT 
        t.name as team_name,
        COUNT(a.id) as team_assignments,
        COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as team_completed,
        ROUND(
          (COUNT(CASE WHEN a.status = 'completed' THEN 1 END) * 100.0 / COUNT(a.id)), 2
        ) as team_success_rate
      FROM assignments a
      JOIN teams t ON a.team_id = t.id
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.staff_id = ? AND a.assigned_at >= ?
      GROUP BY t.id, t.name
      ORDER BY team_success_rate DESC
    `).all(staff_id, startDate.toISOString())

    // Average Completion Time
    const avgCompletionTime = db.prepare(`
      SELECT 
        AVG(
          (julianday(completed_at) - julianday(assigned_at)) * 24
        ) as avg_hours,
        MIN(
          (julianday(completed_at) - julianday(assigned_at)) * 24
        ) as fastest_hours,
        MAX(
          (julianday(completed_at) - julianday(assigned_at)) * 24
        ) as slowest_hours
      FROM assignments 
      WHERE staff_id = ? AND status = 'completed' AND assigned_at >= ?
    `).get(staff_id, startDate.toISOString()) as any

    // Weekly Trends
    const weeklyTrends = db.prepare(`
      SELECT 
        strftime('%W', assigned_at) as week_number,
        COUNT(*) as assignments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM assignments 
      WHERE staff_id = ? AND assigned_at >= ?
      GROUP BY strftime('%W', assigned_at)
      ORDER BY week_number DESC
      LIMIT 8
    `).all(staff_id, startDate.toISOString())

    // Calculate success rate
    const successRate = performanceOverview.total_assignments > 0 
      ? Math.round((performanceOverview.completed_assignments / performanceOverview.total_assignments) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          ...performanceOverview,
          success_rate: successRate
        },
        recentActivity,
        servicePerformance,
        timePerformance,
        teamPerformance,
        avgCompletionTime,
        weeklyTrends,
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Staff performance error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}


