# Cleaning Service Website

A modern, responsive website for a cleaning service company built with Next.js 15, TypeScript, Tailwind CSS, and SQLite.

## Features

- **Front Page**: Hero section, services showcase, testimonials, and booking form
- **Customer Authentication**: Custom authentication system
- **Customer Dashboard**: Personal booking management for logged-in users
- **Admin Panel**: View and manage booking submissions with status updates
- **Multi-Language Support**: English and Turkish with easy language switching
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Data**: SQLite database integration for form submissions
- **Modern UI**: Shadcn/ui components with Lucide icons
- **Protected Routes**: Secure access to customer dashboard

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Database**: SQLite (Local file-based)
- **Authentication**: Custom (Local)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cleaning-service-website
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database

This project uses **SQLite** as the database, which provides:

- **Zero Configuration**: No setup required
- **File-based**: Single `database.sqlite` file
- **Automatic Setup**: Tables and sample data are created automatically
- **Portable**: Easy to backup and move

### Database Structure

- **`bookings`**: Customer booking information
- **`services`**: Available cleaning services
- **`testimonials`**: Customer reviews and ratings

### Sample Data

The database comes pre-loaded with:
- 4 cleaning services (Home, Office, Carpet, Window cleaning)
- 3 customer testimonials

## Pages

- **Home Page** (`/`): Main landing page with services, testimonials, and booking form
- **Customer Login** (`/login`): Customer authentication page
- **Customer Register** (`/register`): Customer registration page
- **Customer Dashboard** (`/dashboard`): Customer booking management (protected route)
- **Admin Panel** (`/admin/login`): Admin authentication page
- **Admin Dashboard** (`/admin`): Manage all booking submissions (protected route)
- **404 Page** (`/404`): Custom not found page

## API Endpoints

- **`/api/bookings`**: GET (list), POST (create)
- **`/api/bookings/[id]`**: PUT (update), DELETE (cancel)
- **`/api/services`**: GET (list services)
- **`/api/testimonials`**: GET (list testimonials)

## Development

### Database Management

For database inspection and management, you can use:
- **SQLite Browser**: [Download here](https://sqlitebrowser.org/)
- **Command Line**: `sqlite3 database.sqlite`

### Adding New Data

```sql
-- Add new service
INSERT INTO services (title, description, icon, price) 
VALUES ('Deep Cleaning', 'Comprehensive deep cleaning service', 'sparkles', '€200-300');

-- Add new testimonial
INSERT INTO testimonials (name, text, rating) 
VALUES ('John Doe', 'Excellent service!', 5);
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The SQLite database will work on any platform that supports Node.js. For production, consider:
- Regular database backups
- File permissions security
- Monitoring database file size

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
