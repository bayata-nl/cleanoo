# 📧 SMTP Email Setup Guide

## ✅ Tamamlandı: Nodemailer Entegrasyonu

Email sistemi kendi SMTP serverınızı kullanacak şekilde yapılandırıldı!

---

## 🔧 Yapılması Gerekenler

### 1️⃣ SMTP Bilgilerini Bul

Hosting provider'ınızdan (cPanel/Plesk/DirectAdmin) aşağıdaki bilgileri alın:

```
📧 Gerekli Bilgiler:
├─ SMTP Host: mail.cleanoo.nl (veya hosting IP/hostname)
├─ SMTP Port: 587 (TLS) veya 465 (SSL) veya 25
├─ SMTP Secure: false (587 için) veya true (465 için)
├─ Username: noreply@cleanoo.nl (email adresi)
└─ Password: ********** (email şifresi)
```

---

## 📍 Hosting Panel'den Nasıl Bulursun?

### **cPanel Kullanıyorsan:**

1. cPanel'e giriş yap
2. **"Email Accounts"** tıkla
3. Email adresini bul (`noreply@cleanoo.nl` veya istediğin herhangi biri)
4. **"Configure Mail Client"** veya **"Connect Devices"** tıkla
5. **"Manual Settings"** altında SMTP bilgilerini gör:
   ```
   Outgoing Server (SMTP): mail.cleanoo.nl
   Port: 587
   Username: noreply@cleanoo.nl
   Password: (senin şifren)
   ```

### **Plesk Kullanıyorsan:**

1. Plesk'e giriş yap
2. **"Mail"** → **"Email Addresses"**
3. Email'i seç
4. **"External Email Program Settings"** tıkla
5. SMTP ayarlarını kopyala

### **DirectAdmin Kullanıyorsan:**

1. DirectAdmin'e giriş yap
2. **"E-mail Accounts"** tıkla
3. **"View/Modify"** tıkla
4. SMTP bilgilerini görüntüle

### **Bilmiyorsan:**

Hosting support'a sor:
> "Merhaba, web uygulamamdan email göndermek için SMTP ayarlarıma ihtiyacım var. `noreply@cleanoo.nl` için SMTP host, port ve authentication bilgilerini alabilir miyim?"

---

## 🔑 2. `.env.local` Dosyasını Güncelle

Proje root'unda `.env.local` dosyasını aç ve şu satırları bul:

```bash
# SMTP Email Configuration (Kendi SMTP serveriniz)
SMTP_HOST=mail.cleanoo.nl                    # ← Hosting'den aldığın host
SMTP_PORT=587                                # ← Port (587 veya 465)
SMTP_SECURE=false                            # ← false (587) veya true (465)
SMTP_USER=noreply@cleanoo.nl                # ← Email adresi
SMTP_PASS=YOUR_EMAIL_PASSWORD_HERE          # ← Email şifresi (BURAYA YAZIŞ!)
FROM_EMAIL=noreply@cleanoo.nl               # ← Gönderici email
NEXT_PUBLIC_APP_URL=http://localhost:3000   # ← Bu kalacak (dev için)
```

### **Örnek (Doldurulmuş):**

```bash
SMTP_HOST=mail.cleanoo.nl
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@cleanoo.nl
SMTP_PASS=MySecureP@ssw0rd123
FROM_EMAIL=noreply@cleanoo.nl
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 3. Dev Server'ı Restart Et

Environment variables değiştiğinde restart gerekli:

```bash
# Terminal'de Ctrl+C ile durdur
# Ardından:
npm run dev
```

Terminal'de şunu görmelisin:
```
✅ SMTP connection verified successfully
```

---

## 🧪 4. Test Et!

### **Test Adımları:**

1. Homepage'e git: `http://localhost:3000`
2. Bir service card'a tıkla
3. Formu doldur:
   - **Email:** Kendi gerçek email'ini kullan!
   - Diğer alanları doldur
4. "Complete Booking" tıkla
5. Email inbox'ını kontrol et (spam folder da!)

### **Başarılı Test:**

✅ Terminal'de göreceksin:
```
✅ Verification email sent to: your@email.com
📧 Message ID: <unique-id@cleanoo.nl>
```

✅ Email gelecek:
- Subject: "Verify your booking with Cleanoo"
- From: Cleanoo <noreply@cleanoo.nl>
- Güzel HTML formatında

---

## 🐛 Sorun Giderme

### ❌ "SMTP connection failed"

**Sebep:** SMTP bilgileri yanlış

**Çözüm:**
1. `.env.local`'i tekrar kontrol et
2. Şifrede özel karakter varsa quote içine al:
   ```bash
   SMTP_PASS="My!Pass@word#123"
   ```
3. Port'u dene (587 → 465)
4. SMTP_SECURE değiştir (false → true)

### ❌ "Authentication failed"

**Sebep:** Kullanıcı adı veya şifre hatalı

**Çözüm:**
1. Email'in şifresini hosting'den resetle
2. SMTP_USER = tam email adresi olmalı
3. Hosting'den doğru bilgileri tekrar al

### ❌ "Connection timeout"

**Sebep:** Port veya firewall sorunu

**Çözüm:**
1. Port 587 yerine 465 dene
2. SMTP_SECURE=true yap (465 için)
3. SMTP_HOST doğru mu kontrol et

### ❌ Email gelmiyor

**Sebep:** Spam folder veya email queue

**Çözüm:**
1. **Spam folder'ı kontrol et!** (en yaygın sebep)
2. 5-10 dakika bekle (bazen gecikiyor)
3. Terminal'de hata var mı bak
4. Farklı email adresi dene

---

## 📊 SMTP Port Seçimi

| Port | Tip | Secure | Kullanım |
|------|-----|--------|----------|
| **587** | TLS/STARTTLS | `false` | ✅ Önerilen (modern) |
| **465** | SSL | `true` | ✅ Eski ama çalışır |
| **25** | Plain | `false` | ❌ Çoğu ISP bloklar |

**Öneri:** Port 587 + SMTP_SECURE=false

---

## 🔐 Güvenlik

✅ **Yapılanlar:**
- Şifre `.env.local`'de (git'e commitlenmez)
- TLS/SSL desteği var
- Self-signed certificate desteği var

⚠️ **Yapman Gerekenler:**
- `.env.local` dosyasını ASLA commit etme
- Production'da güçlü şifre kullan
- Email adresini spam için izle

---

## 💰 Maliyet

**Ücretsiz!** 🎉

- Kendi email hosting'ini kullanıyorsun
- Ekstra ücret yok
- Sınırsız email (hosting limitine göre)

---

## 🎯 Sonuç

✅ Nodemailer kuruldu
✅ SMTP yapılandırması tamamlandı
✅ Email templates hazır
✅ Test için hazır

**Şimdi yapman gereken:**
1. SMTP bilgilerini al (hosting'den)
2. `.env.local` güncelle
3. `npm run dev` restart
4. Test et!

---

## 📞 Yardım

Sorun olursa:
1. Terminal loglarını kontrol et
2. `.env.local` syntax'ı doğru mu bak
3. SMTP bilgilerini hosting'den tekrar al
4. Port ve secure ayarlarını dene

**Başarılar! 🚀**

