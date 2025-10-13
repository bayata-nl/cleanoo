import db from './sqlite';
import { ApiError } from './api-helpers';

/**
 * Database query helpers with consistent error handling
 */

/**
 * Safely executes a SELECT query and returns all results
 */
export function selectAll<T = any>(query: string, params: any[] = []): T[] {
  try {
    const stmt = db.prepare(query);
    return stmt.all(...params) as T[];
  } catch (error) {
    console.error('Database SELECT error:', error);
    throw new ApiError(500, 'Database query failed');
  }
}

/**
 * Safely executes a SELECT query and returns a single result
 */
export function selectOne<T = any>(query: string, params: any[] = []): T | null {
  try {
    const stmt = db.prepare(query);
    const result = stmt.get(...params);
    return (result as T) || null;
  } catch (error) {
    console.error('Database SELECT error:', error);
    throw new ApiError(500, 'Database query failed');
  }
}

/**
 * Safely executes an INSERT query and returns the inserted ID
 */
export function insert(query: string, params: any[] = []): number {
  try {
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    return Number(result.lastInsertRowid);
  } catch (error: any) {
    // Check for unique constraint violations
    if (error.code === 'SQLITE_CONSTRAINT' && error.message?.includes('UNIQUE')) {
      throw new ApiError(400, 'Record with this value already exists');
    }
    console.error('Database INSERT error:', error);
    throw new ApiError(500, 'Database insert failed');
  }
}

/**
 * Safely executes an UPDATE query and returns the number of affected rows
 */
export function update(query: string, params: any[] = []): number {
  try {
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    return result.changes;
  } catch (error) {
    console.error('Database UPDATE error:', error);
    throw new ApiError(500, 'Database update failed');
  }
}

/**
 * Safely executes a DELETE query and returns the number of affected rows
 */
export function deleteRecord(query: string, params: any[] = []): number {
  try {
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    return result.changes;
  } catch (error) {
    console.error('Database DELETE error:', error);
    throw new ApiError(500, 'Database delete failed');
  }
}

/**
 * Common database queries
 */
export const queries = {
  // Bookings
  bookings: {
    getAll: () => selectAll('SELECT * FROM bookings ORDER BY created_at DESC'),
    getByEmail: (email: string) =>
      selectAll('SELECT * FROM bookings WHERE email = ? ORDER BY created_at DESC', [email]),
    getById: (id: number | string) => selectOne('SELECT * FROM bookings WHERE id = ?', [id]),
    create: (data: {
      name: string;
      email: string;
      phone: string;
      address: string;
      service_type: string;
      preferred_date: string;
      preferred_time: string;
      notes?: string | null;
      status?: string;
    }) =>
      insert(
        `INSERT INTO bookings (name, email, phone, address, service_type, preferred_date, preferred_time, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.email,
          data.phone,
          data.address,
          data.service_type,
          data.preferred_date,
          data.preferred_time,
          data.notes || null,
          data.status || 'pending',
        ]
      ),
    updateStatus: (id: number | string, status: string) =>
      update('UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        status,
        id,
      ]),
    delete: (id: number | string) => deleteRecord('DELETE FROM bookings WHERE id = ?', [id]),
  },

  // Services
  services: {
    getAll: () => selectAll('SELECT * FROM services ORDER BY created_at DESC'),
    getById: (id: number | string) => selectOne('SELECT * FROM services WHERE id = ?', [id]),
    create: (data: { title: string; description: string; icon?: string; price?: string }) =>
      insert(
        'INSERT INTO services (title, description, icon, price) VALUES (?, ?, ?, ?)',
        [data.title, data.description, data.icon || '', data.price || '']
      ),
    update: (
      id: number | string,
      data: { title?: string; description?: string; icon?: string; price?: string }
    ) => {
      const fields: string[] = [];
      const params: any[] = [];

      if (data.title !== undefined) {
        fields.push('title = ?');
        params.push(data.title);
      }
      if (data.description !== undefined) {
        fields.push('description = ?');
        params.push(data.description);
      }
      if (data.icon !== undefined) {
        fields.push('icon = ?');
        params.push(data.icon);
      }
      if (data.price !== undefined) {
        fields.push('price = ?');
        params.push(data.price);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      return update(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, params);
    },
    delete: (id: number | string) => deleteRecord('DELETE FROM services WHERE id = ?', [id]),
  },

  // Staff
  staff: {
    getAll: () =>
      selectAll(
        'SELECT id, name, email, phone, address, role, status, specialization, experience_years, hourly_rate, created_at, updated_at FROM staff ORDER BY created_at DESC'
      ),
    getById: (id: number | string) =>
      selectOne(
        'SELECT id, name, email, phone, address, role, status, specialization, experience_years, hourly_rate, created_at, updated_at FROM staff WHERE id = ?',
        [id]
      ),
    getByEmail: (email: string) => selectOne('SELECT * FROM staff WHERE email = ?', [email]),
    create: (data: {
      name: string;
      email: string;
      phone: string;
      address?: string;
      password: string;
      role: string;
      status: string;
      specialization?: string;
      experience_years?: number;
      hourly_rate?: number;
    }) =>
      insert(
        `INSERT INTO staff (name, email, phone, address, password, role, status, specialization, experience_years, hourly_rate)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.email,
          data.phone,
          data.address || null,
          data.password,
          data.role,
          data.status,
          data.specialization || null,
          data.experience_years || 0,
          data.hourly_rate || null,
        ]
      ),
    delete: (id: number | string) => deleteRecord('DELETE FROM staff WHERE id = ?', [id]),
  },

  // Teams
  teams: {
    getAll: () => selectAll('SELECT * FROM teams ORDER BY created_at DESC'),
    getById: (id: number | string) => selectOne('SELECT * FROM teams WHERE id = ?', [id]),
    create: (data: {
      name: string;
      description?: string;
      team_leader_id?: string | number;
      status: string;
    }) =>
      insert(
        'INSERT INTO teams (name, description, team_leader_id, status) VALUES (?, ?, ?, ?)',
        [data.name, data.description || null, data.team_leader_id || null, data.status]
      ),
    delete: (id: number | string) => deleteRecord('DELETE FROM teams WHERE id = ?', [id]),
  },

  // Assignments
  assignments: {
    getAll: () => selectAll('SELECT * FROM assignments ORDER BY assigned_at DESC'),
    getByBooking: (bookingId: number | string) =>
      selectAll('SELECT * FROM assignments WHERE booking_id = ?', [bookingId]),
    getByStaff: (staffId: number | string) =>
      selectAll('SELECT * FROM assignments WHERE staff_id = ? ORDER BY assigned_at DESC', [
        staffId,
      ]),
    getById: (id: number | string) => selectOne('SELECT * FROM assignments WHERE id = ?', [id]),
    updateStatus: (id: number | string, status: string, dateField?: string) => {
      const fields = ['status = ?'];
      const params = [status];

      if (dateField) {
        fields.push(`${dateField} = CURRENT_TIMESTAMP`);
      }

      params.push(String(id));
      return update(`UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`, params);
    },
  },
};

