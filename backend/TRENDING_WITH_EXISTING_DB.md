# Sistem Trending Articles - Menggunakan Database yang Ada

## Overview
Sistem trending articles ini menggunakan struktur database yang sudah ada tanpa perlu membuat tabel atau field baru. Menggunakan tabel `articles` dan `article_point_scoring` yang sudah tersedia.

## Struktur Database yang Digunakan

### 1. **Tabel `articles`** (sudah ada)
```sql
- id (PK)
- slug_title, title, sub_title, article_post
- tags (JSON), featured_image, meta_data (JSON)
- status, author, category, parent_category_id
- id_country, id_city, id_region
- createdBy, createdAt, updatedBy, updatedAt
- publishedAt, publishedBy, current_version_id
- pinned (BOOLEAN) - untuk boost trending
```

### 2. **Tabel `article_point_scoring`** (sudah ada)
```sql
- id (PK)
- id_article (FK ke articles.id)
- point (INTEGER) - nilai poin untuk scoring
- description (TEXT) - deskripsi aktivitas
- ip_address (VARCHAR) - untuk tracking unik
- createdAt, updatedAt
```

### 3. **Tabel Relasi** (sudah ada)
- `category` - untuk kategori artikel
- `country`, `city`, `region` - untuk lokasi
- `asset_media` - untuk featured image
- `article_tags` - untuk relasi artikel dengan tags

## Algoritma Trending yang Diimplementasikan

### 1. **Trending Articles** (`/articles/trending`)
**Formula:**
```
trending_score = 
  (points_24h × 3.0) +           // Aktivitas 24 jam terakhir
  (points_3d × 1.5) +           // Aktivitas 3 hari terakhir  
  (velocity_factor × 2.0) +     // Faktor pertumbuhan
  recency_boost +               // Boost artikel baru
  pinned_boost                  // Boost artikel pinned
```

**Velocity Factor:**
```
velocity_factor = points_3d / points_7d
```

**Recency Boost:**
- Artikel < 7 hari: +1.0
- Artikel < 30 hari: +0.5
- Artikel > 30 hari: +0

**Pinned Boost:** +2.0 untuk artikel yang di-pin

### 2. **Popular Articles** (`/articles/popular`)
**Formula:**
```
popularity_score = SUM(point) WHERE createdAt >= 30_days_ago
```

### 3. **Hot Articles** (`/articles/hot`)
**Formula:**
```
hot_score = SUM(point) WHERE createdAt >= 6_hours_ago
```

### 4. **Comprehensive Ranking** (`/articles/ranking`)
**Formula:**
```
ranking_score = 
  (points_24h × 0.4) +          // 40% - Aktivitas terkini
  (points_3d × 0.25) +         // 25% - Aktivitas jangka menengah
  (points_7d × 0.20) +         // 20% - Aktivitas jangka panjang
  (points_30d × 0.10) +        // 10% - Total aktivitas 30 hari
  (velocity_factor × 0.05) +   // 5% - Faktor pertumbuhan
  recency_boost +               // Boost artikel baru
  pinned_boost                  // Boost artikel pinned
```

## Query SQL yang Digunakan

### Contoh Query Trending Articles:
```sql
SELECT 
  a.id, a.title, a.slug_title as slug,
  a.pinned, a.createdAt,
  c.title as category_name,
  n.name as name_country,
  k.name as name_city,
  r.name as name_region,
  
  -- Trending Score Calculation
  (
    COALESCE(recent_24h.points, 0) * 3.0 +
    COALESCE(recent_3d.points, 0) * 1.5 +
    CASE 
      WHEN COALESCE(recent_3d.points, 0) > 0 AND COALESCE(recent_7d.points, 0) > 0
      THEN (COALESCE(recent_3d.points, 0) / COALESCE(recent_7d.points, 0)) * 2.0
      ELSE 0
    END +
    CASE 
      WHEN a.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1.0
      WHEN a.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 0.5
      ELSE 0
    END +
    CASE WHEN a.pinned = 1 THEN 2.0 ELSE 0 END
  ) AS trending_score,
  
  COALESCE(recent_24h.points, 0) as points_24h,
  COALESCE(recent_3d.points, 0) as points_3d,
  COALESCE(recent_7d.points, 0) as points_7d
  
FROM articles a 
LEFT JOIN category c ON c.id = a.category
LEFT JOIN country n ON n.id = a.id_country
LEFT JOIN city k ON k.id = a.id_city
LEFT JOIN region r ON r.id = a.id_region

-- Recent activity subqueries
LEFT JOIN (
  SELECT id_article, SUM(point) as points
  FROM article_point_scoring 
  WHERE createdAt >= '${oneDayAgo}'
  GROUP BY id_article
) recent_24h ON recent_24h.id_article = a.id

LEFT JOIN (
  SELECT id_article, SUM(point) as points
  FROM article_point_scoring 
  WHERE createdAt >= '${threeDaysAgo}'
  GROUP BY id_article
) recent_3d ON recent_3d.id_article = a.id

LEFT JOIN (
  SELECT id_article, SUM(point) as points
  FROM article_point_scoring 
  WHERE createdAt >= '${sevenDaysAgo}'
  GROUP BY id_article
) recent_7d ON recent_7d.id_article = a.id

WHERE a.status = 'published' 
AND a.title <> ''
HAVING trending_score > 0
ORDER BY trending_score DESC, a.pinned DESC, a.createdAt DESC;
```

## API Endpoints

### 1. Trending Articles
```bash
GET /api/articles/trending?page=1&limit=10&id_country=1&category=1
```

### 2. Popular Articles
```bash
GET /api/articles/popular?page=1&limit=5&id_city=1
```

### 3. Hot Articles
```bash
GET /api/articles/hot?page=1&limit=10&id_region=1
```

### 4. Comprehensive Ranking
```bash
GET /api/articles/ranking?page=1&limit=20&id_country=1&id_city=1
```

## Query Parameters

- `page` (integer): Halaman yang diminta (default: 1)
- `limit` (integer): Jumlah artikel per halaman (default: 10)
- `id_country` (integer): Filter berdasarkan negara
- `id_city` (integer): Filter berdasarkan kota
- `id_region` (integer): Filter berdasarkan region
- `category` (integer): Filter berdasarkan kategori

## Response Format

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalData": 25,
    "totalPages": 3
  },
  "articles": [
    {
      "id": 15,
      "title": "Judul Artikel",
      "slug": "judul-artikel",
      "trending_score": 18.5,
      "points_24h": 8,
      "points_3d": 15,
      "points_7d": 25,
      "total_points": 150,
      "pinned": true,
      "category_name": "Teknologi",
      "name_country": "Bali",
      "name_city": "Canggu",
      "name_region": "Canggu Core",
      "createdAt": "10-01-2025 14:30:00 +07:00",
      "publishedAt": "10-01-2025 14:30:00 +07:00"
    }
  ]
}
```

## Cara Kerja Scoring System

### 1. **Point Collection**
- Setiap kali user mengakses artikel, sistem mencatat di `article_point_scoring`
- Menggunakan IP address untuk mencegah spam (30 menit window)
- Point default = 1 untuk setiap view

### 2. **Scoring Calculation**
- Menggunakan `SUM(point)` dari tabel `article_point_scoring`
- Filter berdasarkan `createdAt` untuk periode waktu tertentu
- Menggunakan `GROUP BY id_article` untuk aggregasi per artikel

### 3. **Trending Factors**
- **Recency:** Artikel baru mendapat boost
- **Velocity:** Pertumbuhan aktivitas dalam periode tertentu
- **Volume:** Total aktivitas dalam periode waktu
- **Pinned:** Artikel yang di-pin mendapat boost

## Performance Optimization

### 1. **Database Indexing** (Recommended)
```sql
-- Index untuk article_point_scoring
CREATE INDEX idx_article_point_scoring_created_at ON article_point_scoring(createdAt);
CREATE INDEX idx_article_point_scoring_article_id ON article_point_scoring(id_article);
CREATE INDEX idx_article_point_scoring_composite ON article_point_scoring(id_article, createdAt);

-- Index untuk articles
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_country ON articles(id_country);
CREATE INDEX idx_articles_city ON articles(id_city);
CREATE INDEX idx_articles_region ON articles(id_region);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_pinned ON articles(pinned);
```

### 2. **Query Optimization**
- Menggunakan LEFT JOIN untuk menghindari artikel tanpa aktivitas
- Subquery untuk aggregasi point per periode
- HAVING clause untuk filter hasil akhir
- LIMIT dan OFFSET untuk pagination

### 3. **Caching Strategy** (Optional)
- Cache hasil trending untuk 5-10 menit
- Cache popular articles untuk 15-30 menit
- Cache hot articles untuk 2-5 menit
- Cache ranking untuk 10-20 menit

## Monitoring dan Analytics

### Metrics yang Tersedia:
- `trending_score` - Skor trending komprehensif
- `points_24h` - Aktivitas 24 jam terakhir
- `points_3d` - Aktivitas 3 hari terakhir
- `points_7d` - Aktivitas 7 hari terakhir
- `points_30d` - Aktivitas 30 hari terakhir
- `total_points` - Total aktivitas sepanjang waktu
- `popularity_score` - Skor popularitas
- `hot_score` - Skor aktivitas terkini
- `ranking_score` - Skor peringkat komprehensif

### Logging untuk Monitoring:
```javascript
console.log(`Trending articles request - Page: ${page}, Limit: ${limit}`);
console.log(`Query execution time: ${executionTime}ms`);
console.log(`Results count: ${results.length}`);
console.log(`Average trending score: ${averageScore}`);
```

## Keunggulan Implementasi Ini

1. **Menggunakan Database Existing:** Tidak perlu membuat tabel atau field baru
2. **Backward Compatible:** Tidak mengubah struktur database yang ada
3. **Performance Optimized:** Menggunakan query yang efisien dengan LEFT JOIN
4. **Flexible Filtering:** Support multiple location dan category filters
5. **Comprehensive Scoring:** Multiple algorithms untuk berbagai kebutuhan
6. **Real-time Data:** Menggunakan data real-time dari `article_point_scoring`
7. **Scalable Design:** Dapat di-scale untuk volume besar dengan proper indexing

## Future Enhancements

1. **Machine Learning Integration:** Prediksi trending topics
2. **Real-time Updates:** WebSocket untuk update real-time
3. **Advanced Analytics:** Dashboard untuk monitoring trending patterns
4. **A/B Testing:** Testing algoritma ranking yang berbeda
5. **Historical Analysis:** Tracking perubahan ranking over time
