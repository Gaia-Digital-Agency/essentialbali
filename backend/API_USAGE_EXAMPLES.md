# Contoh Penggunaan API Trending Articles

## Base URL
```
http://localhost:3000/api/articles
```

## 1. Trending Articles

### Request
```bash
curl -X GET "http://localhost:3000/api/articles/trending?page=1&limit=10&id_country=1&category=1" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalData": 25,
      "totalPages": 3
    },
    "articles": [
      {
        "id": 15,
        "title": "Teknologi AI Terbaru 2025",
        "sub_title": "Revolusi Artificial Intelligence",
        "slug": "teknologi-ai-terbaru-2025",
        "trending_score": 18.5,
        "points_24h": 8,
        "points_3d": 15,
        "points_7d": 25,
        "total_points": 150,
        "pinned": true,
        "category_name": "Teknologi",
        "name_country": "Bali",
        "name_city": "Canggu",
        "publishedAt": "10-01-2025 14:30:00 +07:00"
      }
    ]
  }
}
```

## 2. Popular Articles

### Request
```bash
curl -X GET "http://localhost:3000/api/articles/popular?page=1&limit=5&id_city=1" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "pagination": {
      "page": 1,
      "limit": 5,
      "totalData": 12,
      "totalPages": 3
    },
    "articles": [
      {
        "id": 8,
        "title": "Panduan Lengkap Investasi 2025",
        "slug": "panduan-lengkap-investasi-2025",
        "popularity_score": 89,
        "view_count": 89,
        "category_name": "Keuangan",
        "name_city": "Canggu",
        "publishedAt": "08-01-2025 09:15:00 +07:00"
      }
    ]
  }
}
```

## 3. Hot Articles

### Request
```bash
curl -X GET "http://localhost:3000/api/articles/hot?page=1&limit=10&id_region=1" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalData": 7,
      "totalPages": 1
    },
    "articles": [
      {
        "id": 22,
        "title": "Breaking News: Update Terkini",
        "slug": "breaking-news-update-terkini",
        "hot_score": 12,
        "recent_views": 12,
        "category_name": "Berita",
        "name_region": "Canggu Core",
        "publishedAt": "10-01-2025 16:45:00 +07:00"
      }
    ]
  }
}
```

## 4. Comprehensive Ranking

### Request
```bash
curl -X GET "http://localhost:3000/api/articles/ranking?page=1&limit=20&id_country=1&id_city=1" \
  -H "Content-Type: application/json"
```

### Response
```json
{
  "status": 200,
  "message": "Success",
  "data": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalData": 45,
      "totalPages": 3
    },
    "articles": [
      {
        "id": 15,
        "title": "Teknologi AI Terbaru 2025",
        "slug": "teknologi-ai-terbaru-2025",
        "ranking_score": 15.8,
        "points_24h": 8,
        "points_3d": 15,
        "points_7d": 25,
        "points_30d": 45,
        "total_points": 150,
        "pinned": true,
        "category_name": "Teknologi",
        "publishedAt": "10-01-2025 14:30:00 +07:00"
      }
    ]
  }
}
```

## 5. Testing dengan JavaScript/Fetch

```javascript
// Trending Articles
async function getTrendingArticles() {
  try {
    const response = await fetch('/api/articles/trending?page=1&limit=10&id_country=1');
    const data = await response.json();
    console.log('Trending Articles:', data);
    return data;
  } catch (error) {
    console.error('Error fetching trending articles:', error);
  }
}

// Popular Articles
async function getPopularArticles() {
  try {
    const response = await fetch('/api/articles/popular?page=1&limit=5&id_city=1');
    const data = await response.json();
    console.log('Popular Articles:', data);
    return data;
  } catch (error) {
    console.error('Error fetching popular articles:', error);
  }
}

// Hot Articles
async function getHotArticles() {
  try {
    const response = await fetch('/api/articles/hot?page=1&limit=10');
    const data = await response.json();
    console.log('Hot Articles:', data);
    return data;
  } catch (error) {
    console.error('Error fetching hot articles:', error);
  }
}

// Comprehensive Ranking
async function getArticleRanking() {
  try {
    const response = await fetch('/api/articles/ranking?page=1&limit=20&category=1');
    const data = await response.json();
    console.log('Article Ranking:', data);
    return data;
  } catch (error) {
    console.error('Error fetching article ranking:', error);
  }
}

// Usage
getTrendingArticles();
getPopularArticles();
getHotArticles();
getArticleRanking();
```

## 6. Testing dengan Postman

### Collection Setup
1. Create new collection: "Trending Articles API"
2. Set base URL: `{{baseUrl}}/api/articles`

### Environment Variables
```json
{
  "baseUrl": "http://localhost:3000",
  "page": "1",
  "limit": "10",
  "id_country": "1",
  "id_city": "1",
  "id_region": "1",
  "category": "1"
}
```

### Requests
1. **GET Trending Articles**
   - URL: `{{baseUrl}}/trending?page={{page}}&limit={{limit}}&id_country={{id_country}}`

2. **GET Popular Articles**
   - URL: `{{baseUrl}}/popular?page={{page}}&limit={{limit}}&id_city={{id_city}}`

3. **GET Hot Articles**
   - URL: `{{baseUrl}}/hot?page={{page}}&limit={{limit}}&id_region={{id_region}}`

4. **GET Article Ranking**
   - URL: `{{baseUrl}}/ranking?page={{page}}&limit={{limit}}&category={{category}}`

## 7. Error Handling Examples

### No Data Found
```json
{
  "status": 404,
  "message": "No Trending Articles Found",
  "data": null
}
```

### Invalid Parameters
```json
{
  "status": 400,
  "message": "Page must be greater than 0",
  "data": null
}
```

### Server Error
```json
{
  "status": 500,
  "message": "Internal Server Error",
  "data": null
}
```

## 8. Performance Testing

### Load Testing dengan Artillery
```yaml
# artillery-trending-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Trending Articles Load Test"
    requests:
      - get:
          url: "/api/articles/trending?page=1&limit=10"
```

### Run Load Test
```bash
artillery run artillery-trending-test.yml
```

## 9. Monitoring dan Analytics

### Metrics yang Bisa Dimonitor
- Response time untuk setiap endpoint
- Number of requests per endpoint
- Error rates
- Database query performance
- Cache hit rates (jika menggunakan caching)

### Logging
```javascript
// Contoh logging untuk monitoring
console.log(`Trending articles request - Page: ${page}, Limit: ${limit}, Country: ${id_country}`);
console.log(`Query execution time: ${executionTime}ms`);
console.log(`Results count: ${results.length}`);
```
