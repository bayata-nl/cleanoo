module.exports = {
  apps: [{
    name: 'cleanoo',
    script: './.next/standalone/server.js',
    cwd: '/var/www/cleanoo/web',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'https://cleanoo.nl',
      DATABASE_PATH: './database.sqlite',
      JWT_SECRET: 'cleanoo-jwt-secret-2025-production-change-this',
      JWT_ADMIN_SECRET: 'cleanoo-admin-jwt-secret-2025-production-change-this',
      JWT_STAFF_SECRET: 'cleanoo-staff-jwt-secret-2025-production-change-this',
      SMTP_HOST: 'smtp.your-provider.com',
      SMTP_PORT: '587',
      SMTP_USER: 'your-email@cleanoo.nl',
      SMTP_PASS: 'your-email-password',
      SMTP_FROM: 'noreply@cleanoo.nl',
      ADMIN_EMAIL: 'admin@cleanoo.nl',
      ADMIN_PASSWORD: 'Admin@2025Change',
      NEXT_PUBLIC_APP_NAME: 'Cleanoo',
      NEXT_PUBLIC_APP_URL: 'https://cleanoo.nl'
    }
  }]
}
