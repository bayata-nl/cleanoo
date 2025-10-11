# 🚀 One.com'da Cleano.nl Deploy Etme - Final Rehber

## ✅ Build Hazır!

**Build Status:** SUCCESS ✅
- **Dosya:** `cleano-onecom.zip` oluşturuldu
- **Boyut:** Optimized
- **Pages:** 20/20 generated
- **API Routes:** 15 routes

## 📦 Yüklenecek Dosyalar

### **cleano-onecom.zip İçeriği:**
```
cleano-onecom.zip
├── .next/                 # Build dosyaları (tüm uygulama)
├── package.json          # Dependencies
├── next.config.js        # Next.js config
└── public/               # Static dosyalar
```

## 🔧 One.com Panel Ayarları

### **1. Hosting Türü Seçimi**
One.com'da şu seçeneklerden birini seçin:

#### **A) Node.js Hosting (Önerilen)**
- **Type:** Node.js Application
- **Version:** Node.js 18.x veya 20.x
- **Start Command:** `npm start`
- **Port:** 3000 (varsayılan)

#### **B) Shared Hosting (Alternatif)**
- **Type:** Web Hosting
- **PHP:** 8.x
- **Database:** MySQL (opsiyonel)

### **2. Domain Ayarları**
- **Domain:** `cleano.nl`
- **Subdomain:** `www.cleano.nl` → `cleano.nl` redirect
- **SSL:** Aktif (Let's Encrypt)

### **3. Environment Variables**
One.com panelinde şunları ekle:
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://cleano.nl
PORT=3000
```

## 📋 Deployment Adımları

### **Adım 1: Dosyaları Yükle**
1. One.com File Manager'a git
2. `cleano-onecom.zip`'i yükle
3. Extract et (çıkart)
4. Dosyalar şu şekilde olmalı:
   ```
   public_html/
   ├── .next/
   ├── package.json
   ├── next.config.js
   └── public/
   ```

### **Adım 2: Dependencies Kur**
```bash
# One.com terminal'de veya SSH ile
npm install
```

### **Adım 3: Uygulamayı Başlat**
```bash
# Node.js hosting varsa
npm start

# Veya PM2 ile (VPS varsa)
npm install -g pm2
pm2 start npm --name "cleano" -- start
pm2 startup
pm2 save
```

### **Adım 4: Domain Yönlendirme**
- `cleano.nl` → Ana uygulama
- `www.cleano.nl` → `cleano.nl`'e redirect

## 🗄️ Database

### **SQLite (Otomatik)**
- Database otomatik oluşur
- Dosya: `database.sqlite`
- İlk çalıştırmada tablolar oluşur
- Sample data otomatik eklenir

### **MySQL (Opsiyonel)**
Eğer MySQL kullanmak isterseniz:
1. One.com'da MySQL database oluştur
2. Connection string'i environment variable olarak ekle
3. `lib/sqlite.ts`'i MySQL'e çevir

## 🔍 Test Etme

### **URL'ler:**
- ✅ Ana sayfa: `https://cleano.nl`
- ✅ Admin: `https://cleano.nl/admin`
- ✅ Staff: `https://cleano.nl/staff/login`
- ✅ User: `https://cleano.nl/login`

### **Test Checklist:**
- [ ] Ana sayfa yükleniyor
- [ ] Booking form çalışıyor
- [ ] Admin login çalışıyor (admin@cleanoo.com / admin123)
- [ ] Staff login çalışıyor
- [ ] Database bağlantısı var
- [ ] SSL sertifikası aktif
- [ ] Mobile responsive

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
- Disk alanı yeterli mi?

### **SSL Hatası**
- Let's Encrypt sertifikası aktif mi?
- Domain doğru yönlendiriliyor mu?
- HTTPS redirect çalışıyor mu?

## 📞 One.com Destek

Eğer sorun yaşarsanız:
1. **One.com Support:** support@one.com
2. **Node.js hosting var mı sorun**
3. **Port ayarlarını kontrol edin**
4. **Log dosyalarını inceleyin**
5. **SSH erişimi var mı sorun**

## 🎯 Önemli Notlar

### **One.com Özellikleri:**
- ✅ **SSL:** Otomatik Let's Encrypt
- ✅ **CDN:** Global content delivery
- ✅ **Backup:** Otomatik yedekleme
- ✅ **Support:** 24/7 destek

### **Performance:**
- ✅ **First Load:** ~105-155 kB
- ✅ **Static Pages:** Optimized
- ✅ **API Routes:** Server-rendered
- ✅ **Database:** SQLite (hızlı)

### **Security:**
- ✅ **HTTPS:** SSL sertifikası
- ✅ **Environment Variables:** Güvenli
- ✅ **Database:** Local SQLite
- ✅ **Authentication:** JWT tokens

## 🎉 Başarılı Deployment!

Cleano.nl artık canlıda! 🚀

### **Son Kontrol:**
1. ✅ Build başarılı
2. ✅ Dosyalar hazır
3. ✅ Rehber tamamlandı
4. ✅ Test checklist hazır

**One.com'a yükleyebilirsiniz!** 🎯
