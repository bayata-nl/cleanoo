import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

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

  // Check if services already exist
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  
  if (existingCount.count > 0) {
    console.log(`⚠️  Found ${existingCount.count} existing services.`);
    console.log('❓ Do you want to:');
    console.log('   1. Keep existing services (abort)');
    console.log('   2. Add new services (append)');
    console.log('   3. Replace all services (delete + insert)');
    console.log('\n💡 Run with flag: --append or --replace\n');
    
    const flag = process.argv[2];
    
    if (flag === '--replace') {
      console.log('🗑️  Deleting existing services...');
      db.prepare('DELETE FROM services').run();
      console.log('✅ Existing services deleted\n');
    } else if (flag !== '--append') {
      console.log('⛔ Aborted. No changes made.\n');
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
    } catch (error: any) {
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

