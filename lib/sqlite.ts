import Database from 'better-sqlite3';
import path from 'path';

// Database file will be in project root
const dbPath = path.join(process.cwd(), 'database.sqlite');

// Singleton database connection
let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  try {
    db = new Database(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });
    
    // Performance optimizations
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
    db.pragma('synchronous = NORMAL'); // Faster writes, still safe
    db.pragma('cache_size = 10000'); // 10,000 pages cache (~40MB)
    db.pragma('temp_store = memory'); // Temporary tables in memory
    db.pragma('mmap_size = 30000000000'); // Memory-mapped I/O (30GB)
    db.pragma('page_size = 4096'); // Optimal page size
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Set busy timeout (milliseconds)
    db.pragma('busy_timeout = 5000');
    
    console.log('✅ SQLite database successfully initialized');
    console.log('📊 Database path:', dbPath);
    
    return db;
  } catch (error) {
    console.error('❌ SQLite database connection error:', error);
    throw error;
  }
}

// Initialize database connection
db = getDatabase();

// Create database tables
function initializeDatabase() {
  try {
    // Bookings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        service_type TEXT NOT NULL,
        preferred_date TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for bookings table
    db.exec(`CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(preferred_date)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC)`);

    // Services table
    db.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT,
        price TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Testimonials table removed per requirements
    try {
      db.exec(`DROP TABLE IF EXISTS testimonials`);
    } catch (e) {
      console.warn('Testimonials table drop warning:', e);
    }

    // Staff table
    db.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        address TEXT,
        password TEXT DEFAULT 'welcome',
        role TEXT NOT NULL CHECK (role IN ('cleaner', 'supervisor', 'manager')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
        specialization TEXT,
        experience_years INTEGER DEFAULT 0,
        hourly_rate DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for staff table
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role)`);

    // Ensure address column exists for existing databases
    try {
      const cols = db.prepare("PRAGMA table_info(staff)").all() as any[];
      const hasAddress = cols.some((c: any) => c.name === 'address');
      if (!hasAddress) {
        db.exec("ALTER TABLE staff ADD COLUMN address TEXT");
      }
    } catch (e) {
      console.warn('Could not ensure staff.address column:', e);
    }

    // Teams table
    db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        team_leader_id INTEGER,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_leader_id) REFERENCES staff(id)
      )
    `);

    // Team members table
    db.exec(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id INTEGER NOT NULL,
        staff_id INTEGER NOT NULL,
        role_in_team TEXT DEFAULT 'member' CHECK (role_in_team IN ('leader', 'member', 'specialist')),
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
        UNIQUE(team_id, staff_id)
      )
    `);

    // Assignments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        team_id INTEGER,
        staff_id INTEGER,
        assigned_by INTEGER NOT NULL,
        assignment_type TEXT NOT NULL CHECK (assignment_type IN ('team', 'individual')),
        status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected')),
        priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        accepted_at DATETIME,
        started_at DATETIME,
        completed_at DATETIME,
        rejected_at DATETIME,
        rejection_reason TEXT,
        notes TEXT,
        admin_notes TEXT,
        staff_notes TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_by) REFERENCES staff(id) ON DELETE SET NULL,
        CHECK (
          (assignment_type = 'team' AND team_id IS NOT NULL AND staff_id IS NULL) OR
          (assignment_type = 'individual' AND staff_id IS NOT NULL AND team_id IS NULL)
        )
      )
    `);

    // Create indexes for assignments table
    db.exec(`CREATE INDEX IF NOT EXISTS idx_assignments_booking ON assignments(booking_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_assignments_staff ON assignments(staff_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_assignments_team ON assignments(team_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_assignments_date ON assignments(assigned_at DESC)`);

    // Assignment notifications table
    db.exec(`
      CREATE TABLE IF NOT EXISTS assignment_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        staff_id INTEGER,
        team_id INTEGER,
        notification_type TEXT NOT NULL CHECK (notification_type IN ('new_assignment', 'status_update', 'admin_message', 'reminder')),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
      )
    `);

    // Assignment status history table
    db.exec(`
      CREATE TABLE IF NOT EXISTS assignment_status_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assignment_id INTEGER NOT NULL,
        old_status TEXT,
        new_status TEXT NOT NULL,
        changed_by INTEGER NOT NULL,
        change_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES staff(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ SQLite database successfully initialized');
    console.log('📊 Database tables created successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Initialize database
initializeDatabase();

// Graceful shutdown
process.on('SIGINT', () => {
  if (db) {
    db.close();
    console.log('🔒 SQLite database connection closed');
  }
  process.exit(0);
});

export default db;