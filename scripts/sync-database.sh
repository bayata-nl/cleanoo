#!/bin/bash

echo "🔄 Database Senkronizasyonu"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Root database'i standalone'a kopyala
if [ -f "database.sqlite" ]; then
  echo "📋 Root database'i standalone'a kopyalıyorum..."
  cp database.sqlite .next/standalone/database.sqlite
  cp database.sqlite-shm .next/standalone/database.sqlite-shm 2>/dev/null || true
  cp database.sqlite-wal .next/standalone/database.sqlite-wal 2>/dev/null || true
  echo "✅ Database kopyalandı"
else
  echo "⚠️  Root database bulunamadı"
fi

echo ""
echo "✅ Tamamlandı!"
