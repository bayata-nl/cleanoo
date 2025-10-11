# 🎨 Kullanılabilir Icon'lar (Service Cards)

Admin panelde service oluştururken dropdown'dan icon seçebilirsiniz.

## 📋 Toplam 25 FontAwesome Icon (React Icons)

### 🧹 Temizlik İcon'ları:
- **`Broom`** 🧹 - Süpürge (genel temizlik)
- **`SprayCan`** 🧴 - Sprey (detaylı temizlik)
- **`HandSparkles`** ✨ - El parıltısı (premium temizlik)
- **`Sparkles`** ⭐ - Parıltı (luxury hizmet)
- **`PaintRoller`** 🎨 - Boya rulosu (boya sonrası temizlik)

### 🏠 Mekan İcon'ları:
- **`Home`** 🏠 - Ev (ev temizliği)
- **`HouseUser`** 🏡 - Ev + Kullanıcı (residential)
- **`Building`** / **`Building2`** 🏢 - Bina (ofis temizliği)
- **`Warehouse`** 🏭 - Depo (endüstriyel temizlik)
- **`Store`** 🏪 - Mağaza (ticari temizlik)

### 🚿 Oda/Alan İcon'ları:
- **`Shower`** 🚿 - Duş (banyo temizliği)
- **`Bed`** 🛏️ - Yatak (yatak odası temizliği)
- **`Utensils`** 🍴 - Çatal bıçak (mutfak temizliği)
- **`Couch`** 🛋️ - Koltuk (mobilya temizliği)
- **`Door`** 🚪 - Kapı (taşınma temizliği)

### 🚗 Hizmet Tipi İcon'ları:
- **`Car`** 🚗 - Araba (araç temizliği)
- **`Tools`** 🔧 - Aletler (bakım-onarım)
- **`Key`** 🔑 - Anahtar (kiralık ev temizliği)
- **`Box`** 📦 - Kutu (organizasyon/paketleme)
- **`Wind`** 💨 - Rüzgar (hava kalitesi)
- **`Snowflake`** ❄️ - Kar tanesi (klima temizliği)

### 🌿 Özel İcon'lar:
- **`Sun`** ☀️ - Güneş (cam temizliği)
- **`Moon`** 🌙 - Ay (gece servisi)
- **`Leaf`** 🍃 - Yaprak (eco-friendly)
- **`Recycle`** ♻️ - Geri dönüşüm (yeşil temizlik)

---

## 💡 Kullanım Örneği

Admin panelde service eklerken:

```
Title: Home Deep Cleaning
Description: Comprehensive deep cleaning service for your home
Icon: Broom           ← Bu alanı kullan
Price: €99
```

---

## 🎨 Icon Görünümü

Tüm icon'lar service card'larda:
- **Renkli gradient arkaplan** (6 farklı renk döngüsü)
- **Hover effects** (scale + rotate)
- **Rounded corners** (modern görünüm)
- **Shadow effects** (derinlik)

### Gradient Renkleri (Otomatik):
1. Blue → Indigo
2. Purple → Pink
3. Green → Emerald
4. Orange → Red
5. Cyan → Blue
6. Yellow → Orange

(Her service'e sırayla atanır)

---

## 🔧 Yeni Icon Eklemek İçin

`app/page.tsx` dosyasında:

```typescript
// 1. Import ekle
import { FaYeniIcon } from 'react-icons/fa';

// 2. iconMap'e ekle
const iconMap = {
  ...
  YeniIconAdi: FaYeniIcon
};
```

---

## 📚 Daha Fazla Icon

React Icons kütüphanesi 1000+ icon içerir:

- **FontAwesome (Fa)**: `react-icons/fa`
- **Material Design (Md)**: `react-icons/md`
- **Bootstrap (Bs)**: `react-icons/bs`
- **Hero Icons (Hi)**: `react-icons/hi`

Dokümantasyon: https://react-icons.github.io/react-icons/

---

**Son güncelleme:** 11 Ekim 2025

