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
      JWT_SECRET: 'af86764fb075377c2663a1b2710e5a0b728b0d69da1ecbd1ca71b6bb131a0873',
      JWT_ADMIN_SECRET: '57c8053744389fc7420f570d72c5da84e86f70baef9ef14fb3a98539291938b3',
      JWT_STAFF_SECRET: '0fc243ba34a39193dfce51b08d26ae40f345d5904505abf084a8e45918d96aae',
      SMTP_HOST: 'send.one.com',
      SMTP_PORT: '465',
      SMTP_SECURE: 'true',
      SMTP_USER: 'no-reply@cleanoo.nl',
      SMTP_PASS: 'dL2X/dj4+/2tjn-',
      SMTP_FROM: 'no-reply@cleanoo.nl',
      ADMIN_EMAIL: 'admin@cleanoo.nl',
      ADMIN_PASSWORD: 'Admin@2025pWd',
      NEXT_PUBLIC_APP_NAME: 'Cleanoo',
      NEXT_PUBLIC_APP_URL: 'https://cleanoo.nl'
    }
  }]
}
