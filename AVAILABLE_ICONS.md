# 🎨 Kullanılabilir Icon'lar (Service Cards)

Admin panelde service oluştururken `icon` alanına bu değerlerden birini yazabilirsiniz.

## 📋 FontAwesome Style Icons (React Icons)

### Temizlik İcon'ları:
- **`Broom`** - Süpürge (genel temizlik)
- **`SprayCan`** - Sprey (detaylı temizlik)
- **`Shower`** - Duş (banyo temizliği)
- **`Tools`** - Aletler (bakım-onarım)

### Mekan İcon'ları:
- **`Home`** - Ev (ev temizliği)
- **`Building2`** - Bina (ofis temizliği)
- **`Warehouse`** - Depo (endüstriyel temizlik)
- **`Door`** - Kapı (taşınma temizliği)
- **`Key`** - Anahtar (kiralık ev temizliği)

### Mobilya/Eşya İcon'ları:
- **`Couch`** - Koltuk (koltuk temizliği)
- **`Car`** - Araba (araç temizliği)
- **`Box`** - Kutu (paketleme/organizasyon)

### Genel İcon'lar:
- **`Sparkles`** - Parıltı (premium hizmet)
- **`Clock`** - Saat (hızlı servis)

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

