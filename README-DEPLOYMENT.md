# 🚀 Cleanoo.nl Production Deployment Guide

## 📋 **VPS Deployment Adımları**

### 1. **VPS'e Bağlanma**
```bash
ssh root@your-vps-ip
# veya
ssh your-username@your-vps-ip
```

### 2. **Projeyi VPS'e Yükleme**

#### Seçenek A: Git ile (Önerilen)
```bash
# VPS'de
cd /var/www
git clone https://github.com/your-username/cleanoo.git
cd cleanoo
```

#### Seçenek B: SCP ile
```bash
# Local makineden
scp -r /Users/taysim/websites/bayata/web/* root@your-vps-ip:/var/www/cleanoo/
```

#### Seçenek C: ZIP ile
```bash
# Local makineden
tar -czf cleanoo.tar.gz /Users/taysim/websites/bayata/web/
scp cleanoo.tar.gz root@your-vps-ip:/var/www/
# VPS'de
cd /var/www
tar -xzf cleanoo.tar.gz
```

### 3. **Otomatik Deployment**
```bash
cd /var/www/cleanoo
chmod +x deploy.sh
./deploy.sh
```

### 4. **Manuel Deployment (Adım Adım)**

#### Sistem Güncelleme
```bash
sudo apt update && sudo apt upgrade -y
```

#### Gerekli Paketleri Yükleme
```bash
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban
```

#### Node.js 18 Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### PM2 Kurulumu
```bash
sudo npm install -g pm2
```

#### Proje Kurulumu
```bash
cd /var/www/cleanoo
npm install --production
npm run build
```

#### Environment Variables
```bash
cat > .env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://cleanoo.nl
NEXT_PUBLIC_API_URL=https://cleanoo.nl/api
ADMIN_EMAIL=admin@cleanoo.nl
ADMIN_PASSWORD=YourSecurePassword123!
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_URL=./database.sqlite
EOF
```

#### Nginx Konfigürasyonu
```bash
sudo cp nginx.conf /etc/nginx/sites-available/cleanoo.nl
sudo ln -sf /etc/nginx/sites-available/cleanoo.nl /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
```

#### SSL Sertifikası
```bash
sudo certbot --nginx -d cleanoo.nl -d www.cleanoo.nl --non-interactive --agree-tos --email admin@cleanoo.nl
```

#### Firewall Ayarları
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

#### Uygulamayı Başlatma
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
sudo systemctl restart nginx
```

## 🔧 **Post-Deployment Ayarları**

### 1. **Admin Şifresini Değiştirme**
```bash
# .env.local dosyasını düzenle
nano .env.local
# ADMIN_PASSWORD=YeniGüvenliŞifre123!
```

### 2. **JWT Secret Güncelleme**
```bash
# Güvenli bir secret oluştur
openssl rand -base64 32
# .env.local'da JWT_SECRET'ı güncelle
```

### 3. **Database Backup**
```bash
# Backup script oluştur
cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
cp /var/www/cleanoo/database.sqlite /var/www/cleanoo/backups/database_\$DATE.sqlite
find /var/www/cleanoo/backups/ -name "database_*.sqlite" -mtime +7 -delete
EOF

chmod +x backup.sh
# Crontab'a ekle (günlük backup)
echo "0 2 * * * /var/www/cleanoo/backup.sh" | crontab -
```

## 📊 **Monitoring ve Maintenance**

### PM2 Komutları
```bash
pm2 status              # Uygulama durumu
pm2 logs cleanoo-app    # Logları görüntüle
pm2 restart cleanoo-app # Uygulamayı yeniden başlat
pm2 stop cleanoo-app    # Uygulamayı durdur
pm2 delete cleanoo-app   # Uygulamayı sil
```

### Nginx Komutları
```bash
sudo nginx -t           # Konfigürasyonu test et
sudo systemctl status nginx    # Nginx durumu
sudo systemctl restart nginx    # Nginx'i yeniden başlat
sudo systemctl reload nginx     # Nginx'i yeniden yükle
```

### Log İnceleme
```bash
# Uygulama logları
tail -f /var/www/cleanoo/logs/combined.log

# Nginx logları
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Sistem logları
sudo journalctl -u nginx -f
```

## 🔒 **Güvenlik Kontrolleri**

### 1. **Firewall Durumu**
```bash
sudo ufw status
```

### 2. **SSL Sertifika Durumu**
```bash
sudo certbot certificates
```

### 3. **Fail2ban Durumu**
```bash
sudo fail2ban-client status
```

## 🚨 **Troubleshooting**

### Uygulama Çalışmıyor
```bash
pm2 logs cleanoo-app
pm2 restart cleanoo-app
```

### Nginx 502 Hatası
```bash
# Port 3000'in açık olduğunu kontrol et
netstat -tlnp | grep :3000
# Uygulamayı yeniden başlat
pm2 restart cleanoo-app
```

### SSL Sertifika Sorunu
```bash
sudo certbot renew --dry-run
sudo certbot renew
```

## 📈 **Performance Optimization**

### 1. **Nginx Caching**
```bash
# Nginx konfigürasyonunda caching ayarları mevcut
```

### 2. **PM2 Cluster Mode**
```bash
# ecosystem.config.js'de cluster mode aktif
```

### 3. **Database Optimization**
```bash
# SQLite için VACUUM
sqlite3 database.sqlite "VACUUM;"
```

## 🎯 **Test Checklist**

- [ ] Ana sayfa yükleniyor: https://cleanoo.nl
- [ ] Admin panel çalışıyor: https://cleanoo.nl/admin
- [ ] Staff login çalışıyor: https://cleanoo.nl/staff/login
- [ ] Customer dashboard çalışıyor: https://cleanoo.nl/dashboard
- [ ] SSL sertifikası geçerli
- [ ] Tüm API endpoint'ler çalışıyor
- [ ] Database bağlantısı çalışıyor
- [ ] Email gönderimi çalışıyor (eğer varsa)

## 📞 **Destek**

Herhangi bir sorun yaşarsanız:
1. Logları kontrol edin
2. PM2 durumunu kontrol edin
3. Nginx konfigürasyonunu test edin
4. SSL sertifikasını kontrol edin

**Başarılı deployment! 🎉**


