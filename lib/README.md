# Utility Libraries Documentation

Bu dizin, projede kullanılan yardımcı fonksiyonları ve helper'ları içerir.

## 📁 Dosyalar

### `api-helpers.ts`
API route'ları için merkezi error handling ve response yönetimi.

#### Kullanım Örnekleri:

```typescript
import { 
  handleApiError, 
  successResponse, 
  validationError,
  validateRequired,
  isValidEmail 
} from '@/lib/api-helpers';

// Başarılı response
export async function GET() {
  const data = await fetchData();
  return successResponse(data, 'Data fetched successfully');
}

// Validation
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const validation = validateRequired(body, ['name', 'email', 'phone']);
  if (!validation.isValid) {
    return validationError(`Missing fields: ${validation.missing.join(', ')}`);
  }
  
  if (!isValidEmail(body.email)) {
    return validationError('Invalid email format');
  }
  
  // ... işlemler
}

// Error handling wrapper
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Hata olursa otomatik yakalanır
  const data = await riskyOperation();
  return successResponse(data);
});
```

#### Fonksiyonlar:

- `handleApiError(error)` - Tüm hataları yakalar ve uygun response döner
- `successResponse(data, message, status)` - Başarılı response helper
- `validationError(message, fields)` - Validation hatası response
- `notFoundError(resource)` - 404 response helper
- `unauthorizedError(message)` - 401 response helper
- `validateRequired(body, fields)` - Gerekli alanları kontrol eder
- `isValidEmail(email)` - Email format validation
- `isValidPhone(phone)` - Telefon format validation
- `withErrorHandling(handler)` - Async handler'ı error handling ile wrap eder

---

### `db-helpers.ts`
Database işlemleri için güvenli ve tutarlı query helper'ları.

#### Kullanım Örnekleri:

```typescript
import { queries, selectOne, insert } from '@/lib/db-helpers';

// Hazır query kullanımı
export async function GET() {
  const bookings = queries.bookings.getAll();
  return successResponse(bookings);
}

// Özel query
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Insert işlemi - lastInsertRowid döner
  const id = queries.staff.create({
    name: body.name,
    email: body.email,
    phone: body.phone,
    password: hashedPassword,
    role: 'cleaner',
    status: 'active'
  });
  
  // Eklenen kaydı getir
  const newStaff = queries.staff.getById(id);
  return successResponse(newStaff, 'Staff created', 201);
}

// Custom query için
const customData = selectOne('SELECT * FROM table WHERE field = ?', [value]);
```

#### Temel Fonksiyonlar:

- `selectAll<T>(query, params)` - Tüm sonuçları döner
- `selectOne<T>(query, params)` - Tek sonuç döner
- `insert(query, params)` - Insert işlemi, ID döner
- `update(query, params)` - Update işlemi, etkilenen satır sayısı döner
- `deleteRecord(query, params)` - Delete işlemi

#### Hazır Queries:

**Bookings:**
- `queries.bookings.getAll()`
- `queries.bookings.getByEmail(email)`
- `queries.bookings.getById(id)`
- `queries.bookings.create(data)`
- `queries.bookings.updateStatus(id, status)`
- `queries.bookings.delete(id)`

**Services:**
- `queries.services.getAll()`
- `queries.services.getById(id)`
- `queries.services.create(data)`
- `queries.services.update(id, data)`
- `queries.services.delete(id)`

**Staff:**
- `queries.staff.getAll()`
- `queries.staff.getById(id)`
- `queries.staff.getByEmail(email)`
- `queries.staff.create(data)`
- `queries.staff.delete(id)`

**Teams:**
- `queries.teams.getAll()`
- `queries.teams.getById(id)`
- `queries.teams.create(data)`
- `queries.teams.delete(id)`

**Assignments:**
- `queries.assignments.getAll()`
- `queries.assignments.getByBooking(bookingId)`
- `queries.assignments.getByStaff(staffId)`
- `queries.assignments.getById(id)`
- `queries.assignments.updateStatus(id, status, dateField?)`

---

### `auth.ts`
JWT token ve authentication yönetimi.

#### Kullanım:
```typescript
import { requireAdmin, createAdminToken, setAdminCookie } from '@/lib/auth';

// Admin kontrolü
export async function DELETE(request: NextRequest) {
  const result = requireAdmin(request);
  if ('user' in result) {
    // Admin authenticated
    const admin = result.user;
  } else {
    // Not authenticated - response döner
    return result;
  }
}
```

---

### `sqlite.ts`
SQLite database initialization ve connection yönetimi.

#### Kullanım:
```typescript
import db from '@/lib/sqlite';

// Direct usage (artık db-helpers kullanılması öneriliyor)
const stmt = db.prepare('SELECT * FROM table');
const results = stmt.all();
```

---

### `translations.ts`
Çok dilli destek için translation helper'ları.

---

### `utils.ts`
Genel utility fonksiyonları (Tailwind CSS class merge için).

```typescript
import { cn } from '@/lib/utils';

// Tailwind class'larını birleştir
<div className={cn('base-class', condition && 'conditional-class', props.className)} />
```

---

## 🎯 Best Practices

1. **API Routes:** Her zaman `withErrorHandling` wrapper kullanın veya try-catch ile `handleApiError` çağırın
2. **Database:** Direct `db.prepare()` yerine `db-helpers` fonksiyonlarını kullanın
3. **Validation:** Request body'leri için `validateRequired`, `isValidEmail`, `isValidPhone` kullanın
4. **Responses:** Tutarlı response'lar için helper fonksiyonları kullanın (`successResponse`, `validationError`, vb.)
5. **Type Safety:** Database query'lerinde generic type'lar kullanın: `selectOne<Staff>(...)`

## ⚠️ Deprecation Uyarıları

- **Direct `db.prepare()` kullanımı** artık önerilmiyor → `db-helpers` kullanın
- **Manuel error handling** yerine → `withErrorHandling` wrapper kullanın
- **Custom response formatları** yerine → `api-helpers` response fonksiyonlarını kullanın

## 🔄 Migration Guide

Eski API route'ları yeni utility'lere geçirmek için:

**Önce:**
```typescript
export async function GET() {
  try {
    const data = db.prepare('SELECT * FROM bookings').all();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

**Sonra:**
```typescript
import { withErrorHandling, successResponse } from '@/lib/api-helpers';
import { queries } from '@/lib/db-helpers';

export const GET = withErrorHandling(async () => {
  const data = queries.bookings.getAll();
  return successResponse(data);
});
```

---

## 📝 Notlar

- Tüm helper'lar TypeScript ile yazılmıştır ve full type safety sağlar
- Error handling otomatik olarak console'a log yapar
- Database unique constraint violation'lar otomatik olarak 400 error olarak dönülür
- Tüm timestamp'ler SQLite tarafından otomatik oluşturulur (CURRENT_TIMESTAMP)

