# 🚀 SQLite Setup and Usage Guide

## ✨ Features

- **No Installation Required**: Single file database
- **Quick Start**: Works immediately
- **Portable**: Copy the file to move it
- **Production Ready**: Suitable for small-medium scale applications

## 📦 Installation

### 1. Install Dependencies
```bash
npm install better-sqlite3 @types/better-sqlite3
```

### 2. Database Auto-Created
- `database.sqlite` is automatically created when `lib/sqlite.ts` runs
- Tables and sample data are automatically added

## 🗄️ Database Structure

### Tables
- **`bookings`**: Booking information
- **`services`**: Service types
- **`testimonials`**: Customer reviews
- **`personnel`**: Staff information
- **`teams`**: Team information
- **`team_members`**: Team member assignments
- **`assignments`**: Job assignments

### Sample Data
- 8 different service types
- 8 sample customer reviews
- 10 sample bookings
- 8 personnel
- 3 teams
- 9 team members

## 🚀 Running the Application

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## 📊 API Endpoints

### Bookings
- **GET `/api/bookings`**: List all bookings
- **POST `/api/bookings`**: Create new booking
- **PUT `/api/bookings/[id]`**: Update booking
- **DELETE `/api/bookings/[id]`**: Cancel booking (status = 'Cancelled')

### Services
- **GET `/api/services`**: List all services

### Testimonials
- **GET `/api/testimonials`**: List all customer reviews

### Personnel
- **GET `/api/personnel`**: List all personnel
- **POST `/api/personnel`**: Create new personnel
- **PUT `/api/personnel/[id]`**: Update personnel
- **DELETE `/api/personnel/[id]`**: Delete personnel

### Teams
- **GET `/api/teams`**: List all teams
- **POST `/api/teams`**: Create new team
- **PUT `/api/teams/[id]`**: Update team
- **DELETE `/api/teams/[id]`**: Delete team
- **GET `/api/teams/[id]/members`**: List team members
- **POST `/api/teams/[id]/members`**: Add team member
- **DELETE `/api/teams/[id]/members/[memberId]`**: Remove team member

### Assignments
- **GET `/api/assignments`**: List all assignments
- **POST `/api/assignments`**: Create new assignment
- **PUT `/api/assignments/[id]`**: Update assignment
- **DELETE `/api/assignments/[id]`**: Delete assignment

## 🔧 Database Management

### SQLite Browser (Recommended)
1. Download [SQLite Browser](https://sqlitebrowser.org/)
2. Open `database.sqlite` file
3. View and edit tables

### Command Line
```bash
# SQLite CLI installation (optional)
# Windows: https://www.sqlite.org/download.html
# macOS: brew install sqlite3
# Linux: sudo apt install sqlite3

# Connect to database
sqlite3 database.sqlite

# List tables
.tables

# View data
SELECT * FROM bookings;
SELECT * FROM services;
SELECT * FROM testimonials;
SELECT * FROM personnel;
SELECT * FROM teams;
SELECT * FROM team_members;
SELECT * FROM assignments;

# Exit
.quit
```

## 🛠️ Troubleshooting

### Database Connection Error
- Ensure `database.sqlite` file has write permissions
- Restart the application

### Table Not Found
- Tables are automatically created when the application first runs
- Check console for "✅ SQLite database successfully initialized" message

### Performance Issues
- WAL mode is automatically enabled
- Cache size is optimized

## 🔒 Security

### Development
- Run on localhost
- Use test data

### Production
- Secure file permissions
- Take regular backups
- Store file in secure location

## 📈 Future Improvements

- **PostgreSQL Migration**: Easy to switch when scaling
- **Backup System**: Automatic backup
- **Monitoring**: Database performance monitoring

## 📞 Support

If you encounter any issues:
1. Check console logs
2. Verify `database.sqlite` file exists
3. Restart the application