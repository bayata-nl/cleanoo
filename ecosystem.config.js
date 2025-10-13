module.exports = {
  apps: [{
    name: 'cleanoo',
    script: './.next/standalone/server.js',
    cwd: '/var/www/cleanoo/web',
    instances: 1,
    exec_mode: 'cluster',
    env_file: '.next/standalone/.env.production',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
