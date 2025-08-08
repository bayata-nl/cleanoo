# Cleaning Service Website

A modern, responsive website for a cleaning service company built with Next.js 14, TypeScript, Tailwind CSS, and Firebase.

## Features

- **Front Page**: Hero section, services showcase, testimonials, and booking form
- **Admin Panel**: View and manage booking submissions with status updates
- **Multi-Language Support**: English and Dutch with easy language switching
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Data**: Firebase Firestore integration for form submissions
- **Modern UI**: Shadcn/ui components with Lucide icons

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

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

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_APP_ID=1:123456789:web:abcdef123456

# Admin Access Password (change this to your preferred password)
ADMIN_PASSWORD=yourpass
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Get your Firebase configuration from Project Settings > General > Your apps
4. Update the environment variables with your Firebase config

### Running the Application

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start
```

The application will be available at `http://localhost:3000`

## Pages

- **Home Page** (`/`): Main landing page with services, testimonials, and booking form
- **Admin Panel** (`/admin?auth=yourpass`): Manage booking submissions
- **404 Page** (`/404`): Custom not found page

## Admin Access

To access the admin panel, navigate to `/admin?auth=yourpass` (replace `yourpass` with the password you set in `ADMIN_PASSWORD`).

## Deployment

### Vercel (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/cleaning-service-website.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Add Environment Variables:**
   In Vercel dashboard, go to Project Settings > Environment Variables and add:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Deploy:**
   - Click "Deploy"
   - Your site will be live at `https://your-project.vercel.app`

### Manual Deployment

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── admin/
│   │   └── page.tsx          # Admin panel
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   └── ui/                   # Shadcn/ui components
├── hooks/
│   └── use-toast.ts          # Toast notifications
├── lib/
│   ├── firebase.ts           # Firebase configuration
│   └── utils.ts              # Utility functions
├── types/
│   └── index.ts              # TypeScript interfaces
└── public/                   # Static assets
```

## Customization

### Services
Edit the services array in `app/page.tsx` to customize your service offerings.

### Testimonials
Update the testimonials array in `app/page.tsx` with your customer reviews.

### Multi-Language Support
The website supports English and Dutch languages. To add more languages:
1. Edit `lib/translations.ts` to add new language translations
2. Update the `Language` type in the same file
3. Add the new language option to `components/LanguageSwitcher.tsx`

### Styling
Modify `tailwind.config.ts` and `app/globals.css` to customize colors and styling.

## License

MIT License - feel free to use this project for your own cleaning service business.

## Support

For issues and questions, please open an issue in the repository.
