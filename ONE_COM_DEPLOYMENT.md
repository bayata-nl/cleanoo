# One.com'da Cleano.nl Deploy Etme Rehberi

## 🚀 One.com Hosting Seçenekleri

### **Seçenek 1: Node.js Hosting (Önerilen)**

One.com'da Node.js hosting varsa:

#### 1. **Dosyaları Yükleme**
```bash
# Build al
npm run build

# Yüklenecek dosyalar:
- .next/ (tüm build dosyaları)
- package.json
- next.config.js
- public/ (varsa)
- node_modules/ (veya npm install çalıştır)
```

#### 2. **One.com Panel Ayarları**
- **Node.js Version:** 18.x veya 20.x
- **Start Command:** `npm start`
- **Build Command:** `npm run build`
- **Port:** 3000 (varsayılan)

#### 3. **Environment Variables**
One.com panelinde şunları ekle:
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://cleano.nl
```

### **Seçenek 2: Shared Hosting (Alternatif)**

Eğer sadece shared hosting varsa:

#### 1. **Static Build (Sadece Frontend)**
```bash
# next.config.js'i güncelle
output: 'export',
trailingSlash: true,
images: { unoptimized: true }

# Build al
npm run build

# out/ klasöründeki dosyaları yükle
```

#### 2. **API'ları Ayrı Hosting**
- API'ları başka bir Node.js hosting'e deploy et
- Vercel, Railway, veya Heroku kullan
- Frontend'den API URL'ini güncelle

### **Seçenek 3: VPS/Cloud Hosting**

One.com'da VPS varsa:

#### 1. **Server Kurulumu**
```bash
# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kur (process manager)
sudo npm install -g pm2

# Proje dosyalarını yükle
git clone [your-repo] /var/www/cleano
cd /var/www/cleano
npm install
npm run build
```

#### 2. **PM2 ile Çalıştırma**
```bash
# PM2 ile başlat
pm2 start npm --name "cleano" -- start

# Otomatik başlatma
pm2 startup
pm2 save

# Nginx reverse proxy kur
```

## 📁 Yüklenecek Dosyalar

### **Temel Dosyalar**
```
cleano/
├── .next/                 # Build dosyaları
├── public/               # Static dosyalar
├── package.json          # Dependencies
├── next.config.js        # Next.js config
├── database.sqlite       # Database (opsiyonel)
└── node_modules/         # Dependencies (veya npm install)
```

### **Önemli Notlar**
- ✅ **Database:** SQLite otomatik oluşur
- ✅ **Port:** 3000 (varsayılan)
- ✅ **SSL:** One.com'da otomatik
- ✅ **Domain:** cleano.nl'e yönlendir

## 🔧 One.com Panel Ayarları

### **1. Domain Ayarları**
- Domain: `cleano.nl`
- Subdomain: `www.cleano.nl` (redirect)
- SSL: Aktif

### **2. Hosting Ayarları**
- **Type:** Node.js (varsa)
- **Version:** 18.x
- **Start Command:** `npm start`
- **Build Command:** `npm run build`

### **3. Environment Variables**
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://cleano.nl
PORT=3000
```

## 🚀 Deployment Adımları

### **Adım 1: Build Al**
```bash
npm run build
```

### **Adım 2: Dosyaları Sıkıştır**
```bash
# Windows
Compress-Archive -Path .next,package.json,next.config.js,public -DestinationPath cleano.zip

# Linux/Mac
zip -r cleano.zip .next package.json next.config.js public
```

### **Adım 3: One.com'a Yükle**
1. One.com File Manager'a git
2. `cleano.zip`'i yükle
3. Extract et
4. `npm install` çalıştır (eğer node_modules yoksa)

### **Adım 4: Başlat**
```bash
npm start
```

## 🔍 Test Etme

### **URL'ler**
- Ana sayfa: `https://cleano.nl`
- Admin: `https://cleano.nl/admin`
- Staff: `https://cleano.nl/staff/login`

### **Test Checklist**
- ✅ Ana sayfa yükleniyor
- ✅ Booking form çalışıyor
- ✅ Admin login çalışıyor
- ✅ Staff login çalışıyor
- ✅ Database bağlantısı var
- ✅ SSL sertifikası aktif

## 🆘 Sorun Giderme

### **Build Hatası**
```bash
# Dependencies'leri temizle
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Port Hatası**
```bash
# Port'u kontrol et
netstat -tulpn | grep :3000

# Farklı port kullan
PORT=8080 npm start
```

### **Database Hatası**
- SQLite dosyası yazma izni var mı?
- Database klasörü mevcut mu?

## 📞 One.com Destek

Eğer sorun yaşarsanız:
1. One.com support'a başvurun
2. Node.js hosting var mı sorun
3. Port ayarlarını kontrol edin
4. Log dosyalarını inceleyin

## 🎉 Başarılı Deployment!

Cleano.nl artık canlıda! 🚀
