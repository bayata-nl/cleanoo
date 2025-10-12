// Use .js instead of .ts for simpler execution
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'database.sqlite');

// Import db to ensure initialization
let dbModule;
try {
  dbModule = require('../lib/sqlite.ts');
} catch (e) {
  // If TypeScript import fails, manually initialize
  const db = new Database(dbPath);
  
  // Ensure tables exist
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
  
  dbModule = { default: db };
}

const db = dbModule.default;

const services = [
  {
    title: 'Home Cleaning',
    description: 'Complete home cleaning services including kitchen, bathrooms, bedrooms, and living areas.',
    icon: 'Home',
    price: '80'
  },
  {
    title: 'Office Cleaning',
    description: 'Professional office cleaning for businesses of all sizes with flexible scheduling.',
    icon: 'Building',
    price: '120'
  },
  {
    title: 'Deep Cleaning',
    description: 'Thorough deep cleaning service for move-in/move-out or seasonal cleaning needs.',
    icon: 'Broom',
    price: '150'
  },
  {
    title: 'Carpet Cleaning',
    description: 'Professional carpet and upholstery cleaning using eco-friendly products.',
    icon: 'Couch',
    price: '60'
  },
  {
    title: 'Window Cleaning',
    description: 'Interior and exterior window cleaning for crystal clear views.',
    icon: 'Sun',
    price: '40'
  },
  {
    title: 'Move-in/Move-out Cleaning',
    description: 'Comprehensive cleaning service for rental properties and real estate.',
    icon: 'Door',
    price: '200'
  },
  {
    title: 'Kitchen Cleaning',
    description: 'Deep cleaning of kitchen appliances, countertops, and cabinets.',
    icon: 'Utensils',
    price: '70'
  },
  {
    title: 'Bathroom Cleaning',
    description: 'Complete bathroom sanitization and deep cleaning service.',
    icon: 'Shower',
    price: '50'
  },
  {
    title: 'Post-Construction Cleaning',
    description: 'Thorough cleaning after renovation or construction work.',
    icon: 'Tools',
    price: '180'
  },
  {
    title: 'Eco-Friendly Cleaning',
    description: 'Green cleaning services using only eco-friendly and non-toxic products.',
    icon: 'Leaf',
    price: '90'
  },
  {
    title: 'Commercial Cleaning',
    description: 'Cleaning services for retail stores, warehouses, and commercial spaces.',
    icon: 'Store',
    price: '150'
  },
  {
    title: 'Car Interior Cleaning',
    description: 'Professional car interior detailing and cleaning service.',
    icon: 'Car',
    price: '45'
  }
];

try {
  console.log('🌱 Starting service seed...\n');

  const existingCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  
  if (existingCount.count > 0) {
    const flag = process.argv[2];
    
    if (flag === '--replace') {
      console.log('🗑️  Deleting existing services...');
      db.prepare('DELETE FROM services').run();
      console.log('✅ Existing services deleted\n');
    } else if (flag !== '--append') {
      console.log('⛔ Aborted. Use --replace or --append flag.\n');
      process.exit(0);
    }
  }

  const insert = db.prepare(`
    INSERT INTO services (title, description, icon, price)
    VALUES (?, ?, ?, ?)
  `);

  let inserted = 0;
  
  for (const service of services) {
    try {
      insert.run(service.title, service.description, service.icon, service.price);
      console.log(`✅ ${service.title}`);
      inserted++;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        console.log(`⏭️  ${service.title} (already exists, skipping)`);
      } else {
        console.error(`❌ ${service.title}:`, error.message);
      }
    }
  }

  console.log(`\n🎉 Seed completed!`);
  console.log(`   ✅ ${inserted} services inserted`);
  console.log(`   📊 Total services: ${db.prepare('SELECT COUNT(*) as count FROM services').get().count}\n`);

} catch (error) {
  console.error('❌ Seed error:', error);
  process.exit(1);
} finally {
  db.close();
}

