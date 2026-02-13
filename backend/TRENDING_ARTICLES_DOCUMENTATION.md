# Sistem Perhitungan Peringkat dan Trending Articles

## Overview
Sistem ini mengimplementasikan algoritma sophisticated untuk menghitung peringkat dan trending articles berdasarkan berbagai faktor seperti aktivitas terkini, velocity, dan volume interaksi.

## Fitur Utama

### 1. Trending Articles (`/articles/trending`)
**Algoritma:** Menggabungkan recency, velocity, dan volume factors

**Formula Trending Score:**
```
trending_score = 
  (recent_24h_points * 3.0) +                    // Aktivitas 24 jam terakhir - bobot tertinggi
  (recent_3d_points * 1.5) +                   // Aktivitas 3 hari terakhir - bobot sedang
  (velocity_factor * 2.0) +                    // Faktor pertumbuhan
  recency_boost +                               // Boost untuk artikel baru
  pinned_boost                                  // Boost untuk artikel yang di-pin
```

**Velocity Factor:**
```
velocity_factor = recent_3d_points / recent_7d_points
```

**Recency Boost:**
- Artikel < 7 hari: +1.0
- Artikel < 30 hari: +0.5
- Artikel > 30 hari: +0

**Pinned Boost:** +2.0 untuk artikel yang di-pin

### 2. Popular Articles (`/articles/popular`)
**Algoritma:** Berdasarkan total interaksi dalam 30 hari terakhir

**Formula:**
```
popularity_score = SUM(points) WHERE created_at >= 30_days_ago
```

**Sorting:** Pinned articles → Popularity score → Creation date

### 3. Hot Articles (`/articles/hot`)
**Algoritma:** Berdasarkan aktivitas dalam 6 jam terakhir

**Formula:**
```
hot_score = SUM(points) WHERE created_at >= 6_hours_ago
```

**Filter:** Hanya menampilkan artikel dengan aktivitas > 0

### 4. Comprehensive Ranking (`/articles/ranking`)
**Algoritma:** Sistem peringkat komprehensif dengan multiple factors

**Formula Ranking Score:**
```
ranking_score = 
  (recent_24h_points * 0.4) +                   // 40% - Aktivitas terkini
  (recent_3d_points * 0.25) +                  // 25% - Aktivitas jangka menengah
  (recent_7d_points * 0.20) +                  // 20% - Aktivitas jangka panjang
  (total_30d_points * 0.10) +                  // 10% - Total aktivitas 30 hari
  (velocity_factor * 0.05) +                   // 5% - Faktor pertumbuhan
  recency_boost +                               // Boost untuk artikel baru
  pinned_boost                                  // Boost untuk artikel yang di-pin
```

**Recency Boost:**
- Artikel < 3 hari: +3.0
- Artikel < 7 hari: +2.0
- Artikel < 30 hari: +1.0
- Artikel > 30 hari: +0

**Pinned Boost:** +5.0 untuk artikel yang di-pin

## Query Parameters

Semua endpoint mendukung parameter berikut:

### Pagination
- `page` (integer): Halaman yang diminta (default: 1)
- `limit` (integer): Jumlah artikel per halaman (default: 10)

### Location Filtering
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
    "totalData": 150,
    "totalPages": 15
  },
  "articles": [
    {
      "id": 1,
      "title": "Judul Artikel",
      "sub_title": "Sub Judul",
      "slug": "judul-artikel",
      "article_post": "Konten artikel...",
      "tags": [1, 2, 3],
      "featured_image_id": 1,
      "featured_image_url": "/path/to/image.jpg",
      "meta_data": {},
      "status": "published",
      "publishedAt": "10-01-2025 10:30:00 +07:00",
      "createdAt": "10-01-2025 10:30:00 +07:00",
      "updatedAt": "10-01-2025 10:30:00 +07:00",
      "author_name": "Nama Penulis",
      "category_id": 1,
      "category_name": "Teknologi",
      "slug_category": "teknologi",
      "parent_category_id": 1,
      "parent_category_name": "Berita",
      "id_country": 1,
      "name_country": "Bali",
      "slug_country": "indonesia",
      "id_city": 1,
      "name_city": "Canggu",
      "slug_city": "jakarta",
      "id_region": 1,
      "name_region": "Canggu Core",
      "slug_region": "jakarta-pusat",
      "pinned": false,
      
      // Score metrics (berbeda untuk setiap endpoint)
      "trending_score": 15.5,        // Hanya di /trending
      "points_24h": 5,               // Hanya di /trending
      "points_3d": 12,               // Hanya di /trending
      "points_7d": 25,               // Hanya di /trending
      "total_points": 150,            // Hanya di /trending
      
      "popularity_score": 45,         // Hanya di /popular
      "view_count": 45,              // Hanya di /popular
      
      "hot_score": 8,                 // Hanya di /hot
      "recent_views": 8,             // Hanya di /hot
      
      "ranking_score": 12.3,          // Hanya di /ranking
      "points_24h": 5,               // Hanya di /ranking
      "points_3d": 12,               // Hanya di /ranking
      "points_7d": 25,               // Hanya di /ranking
      "points_30d": 45,              // Hanya di /ranking
      "total_points": 150             // Hanya di /ranking
    }
  ]
}
```

## Database Schema

### Table: `article_point_scoring`
```sql
CREATE TABLE article_point_scoring (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_article INT NOT NULL,
  point INT NOT NULL,
  description TEXT,
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_article) REFERENCES articles(id)
);
```

## Contoh Penggunaan

### 1. Mendapatkan Trending Articles
```bash
GET /articles/trending?page=1&limit=10&id_country=1&category=1
```

### 2. Mendapatkan Popular Articles
```bash
GET /articles/popular?page=1&limit=5&id_city=1
```

### 3. Mendapatkan Hot Articles
```bash
GET /articles/hot?page=1&limit=10&id_region=1
```

### 4. Mendapatkan Comprehensive Ranking
```bash
GET /articles/ranking?page=1&limit=20&id_country=1&id_city=1
```

## Performance Considerations

1. **Database Indexing:** Pastikan ada index pada:
   - `article_point_scoring.created_at`
   - `article_point_scoring.id_article`
   - `articles.status`
   - `articles.id_country`, `articles.id_city`, `articles.id_region`
   - `articles.category`

2. **Caching:** Pertimbangkan untuk meng-cache hasil trending articles karena perhitungan yang kompleks

3. **Query Optimization:** Query menggunakan LEFT JOIN untuk menghindari artikel tanpa aktivitas

## Monitoring dan Analytics

Sistem ini menyediakan metrics yang dapat digunakan untuk:
- Tracking performa artikel
- Analisis engagement patterns
- Optimasi konten berdasarkan trending topics
- Monitoring velocity pertumbuhan artikel

## Future Enhancements

1. **Machine Learning Integration:** Implementasi ML untuk prediksi trending topics
2. **Real-time Updates:** WebSocket untuk update real-time trending scores
3. **Advanced Filtering:** Filter berdasarkan tags, author, atau custom criteria
4. **Historical Analysis:** Tracking perubahan ranking over time
5. **A/B Testing:** Testing algoritma ranking yang berbeda
