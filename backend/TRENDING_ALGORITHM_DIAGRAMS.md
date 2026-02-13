# Diagram Algoritma Trending Articles

## 1. Flow Diagram Sistem Trending

```mermaid
graph TD
    A[Request Trending Articles] --> B[Parse Query Parameters]
    B --> C[Build Location Filters]
    C --> D[Calculate Time Periods]
    D --> E[Execute Complex SQL Query]
    E --> F[Calculate Trending Score]
    F --> G[Apply Sorting & Pagination]
    G --> H[Format Response with Timezone]
    H --> I[Return JSON Response]
    
    F --> F1[Recent 24h Activity × 3.0]
    F --> F2[Recent 3d Activity × 1.5]
    F --> F3[Velocity Factor × 2.0]
    F --> F4[Recency Boost]
    F --> F5[Pinned Boost × 2.0]
    
    F1 --> F
    F2 --> F
    F3 --> F
    F4 --> F
    F5 --> F
```

## 2. Database Schema Relationship

```mermaid
erDiagram
    ARTICLES ||--o{ ARTICLE_POINT_SCORING : "has many"
    ARTICLES ||--o{ ARTICLE_TAGS : "has many"
    ARTICLES ||--o{ ARTICLE_VERSIONS : "has many"
    ARTICLES }o--|| CATEGORY : "belongs to"
    ARTICLES }o--|| COUNTRY : "belongs to"
    ARTICLES }o--|| CITY : "belongs to"
    ARTICLES }o--|| REGION : "belongs to"
    ARTICLES }o--|| ASSET_MEDIA : "has featured image"
    
    ARTICLES {
        int id PK
        string slug_title
        string title
        text article_post
        json tags
        int featured_image FK
        json meta_data
        enum status
        string author
        int category FK
        int parent_category_id FK
        int id_country FK
        int id_city FK
        int id_region FK
        int createdBy FK
        datetime createdAt
        int updatedBy FK
        datetime updatedAt
        datetime publishedAt
        int publishedBy FK
        int current_version_id FK
        boolean pinned
    }
    
    ARTICLE_POINT_SCORING {
        int id PK
        int id_article FK
        int point
        text description
        string ip_address
        datetime createdAt
        datetime updatedAt
    }
    
    ARTICLE_TAGS {
        int id PK
        int id_article FK
        int id_tag FK
    }
    
    ARTICLE_VERSIONS {
        int id PK
        int article_id FK
        string title
        text article_post
        json tags
        int featured_image FK
        json meta_data
        enum status
        datetime publishedAt
        int publishedBy FK
        datetime createdAt
        int createdBy FK
        datetime updatedAt
        int updatedBy FK
    }
    
    CATEGORY {
        int id PK
        string title
        string slug_title
        int parent_id FK
    }
    
    COUNTRY {
        int id PK
        string name
        string slug
        string timezone
    }
    
    CITY {
        int id PK
        string name
        string slug
        int id_country FK
    }
    
    REGION {
        int id PK
        string name
        string slug
        int id_city FK
    }
    
    ASSET_MEDIA {
        int id PK
        string path
        string filename
        string mime_type
        int file_size
    }
```

## 3. Trending Score Calculation Flow

```mermaid
flowchart TD
    A[Start Trending Calculation] --> B[Get Recent 24h Points]
    B --> C[Get Recent 3d Points]
    C --> D[Get Recent 7d Points]
    D --> E[Calculate Velocity Factor]
    E --> F[Check Article Age]
    F --> G[Check Pinned Status]
    G --> H[Calculate Final Score]
    
    B --> B1[SUM points WHERE created_at >= 24h_ago]
    C --> C1[SUM points WHERE created_at >= 3d_ago]
    D --> D1[SUM points WHERE created_at >= 7d_ago]
    
    E --> E1[velocity = 3d_points / 7d_points]
    E --> E2[velocity_factor = velocity × 2.0]
    
    F --> F1{Article Age}
    F1 -->|"< 7 days"| F2[recency_boost = 1.0]
    F1 -->|"< 30 days"| F3[recency_boost = 0.5]
    F1 -->|"> 30 days"| F4[recency_boost = 0]
    
    G --> G1{pinned?}
    G1 -->|Yes| G2[pinned_boost = 2.0]
    G1 -->|No| G3[pinned_boost = 0]
    
    H --> H1[trending_score = 24h_points×3.0 + 3d_points×1.5 + velocity_factor + recency_boost + pinned_boost]
    
    B1 --> H1
    C1 --> H1
    D1 --> H1
    E2 --> H1
    F2 --> H1
    F3 --> H1
    F4 --> H1
    G2 --> H1
    G3 --> H1
    
    H1 --> I[Return Trending Score]
```

## 4. API Endpoint Architecture

```mermaid
graph LR
    A[Client Request] --> B[Express Router]
    B --> C[Article Controller]
    C --> D[Article Service]
    D --> E[Database Query]
    E --> F[Response Processing]
    F --> G[JSON Response]
    
    B --> B1[/trending]
    B --> B2[/popular]
    B --> B3[/hot]
    B --> B4[/ranking]
    
    C --> C1[getTrendingArticles]
    C --> C2[getPopularArticles]
    C --> C3[getHotArticles]
    C --> C4[getArticleRanking]
    
    D --> D1[Complex SQL Query]
    D --> D2[Score Calculation]
    D --> D3[Timezone Processing]
    
    E --> E1[MySQL Database]
    E --> E2[Articles Table]
    E --> E3[Article Point Scoring Table]
```

## 5. Performance Optimization Strategy

```mermaid
graph TD
    A[Performance Optimization] --> B[Database Level]
    A --> C[Application Level]
    A --> D[Infrastructure Level]
    
    B --> B1[Index Optimization]
    B --> B2[Query Optimization]
    B --> B3[Connection Pooling]
    
    B1 --> B1a[Index on created_at]
    B1 --> B1b[Index on id_article]
    B1 --> B1c[Composite Indexes]
    
    B2 --> B2a[LEFT JOIN Optimization]
    B2 --> B2b[Subquery Optimization]
    B2 --> B2c[LIMIT/OFFSET Optimization]
    
    C --> C1[Caching Strategy]
    C --> C2[Response Optimization]
    C --> C3[Error Handling]
    
    C1 --> C1a[Redis Cache]
    C1 --> C1b[Memory Cache]
    C1 --> C1c[Cache Invalidation]
    
    C2 --> C2a[Pagination]
    C2 --> C2b[Field Selection]
    C2 --> C2c[Compression]
    
    D --> D1[Load Balancing]
    D --> D2[CDN Integration]
    D --> D3[Monitoring]
    
    D1 --> D1a[Multiple Instances]
    D1 --> D1b[Health Checks]
    
    D3 --> D3a[Response Time Monitoring]
    D3 --> D3b[Error Rate Tracking]
    D3 --> D3c[Database Performance]
```

## 6. Data Flow untuk Scoring System

```mermaid
sequenceDiagram
    participant U as User
    participant A as Article API
    participant S as Article Service
    participant D as Database
    participant P as Point Scoring
    
    U->>A: GET /articles/trending
    A->>S: getTrendingArticles(req)
    S->>D: Query recent 24h points
    D-->>S: Return 24h data
    S->>D: Query recent 3d points
    D-->>S: Return 3d data
    S->>D: Query recent 7d points
    D-->>S: Return 7d data
    S->>S: Calculate velocity factor
    S->>S: Calculate trending score
    S->>D: Query articles with filters
    D-->>S: Return articles data
    S->>S: Apply timezone formatting
    S-->>A: Return processed data
    A-->>U: Return JSON response
    
    Note over U,P: Point scoring happens when user views article
    U->>A: GET /articles?slug=article-slug
    A->>S: getArticlesNew(req)
    S->>P: scoringArticles(slug, ip)
    P->>D: Check existing points (30min window)
    P->>D: Insert new point if valid
    D-->>P: Confirm insertion
    P-->>S: Scoring complete
    S-->>A: Return article data
    A-->>U: Return article with scoring
```

## 7. Error Handling Flow

```mermaid
graph TD
    A[API Request] --> B{Valid Request?}
    B -->|No| C[Return 400 Bad Request]
    B -->|Yes| D[Execute Query]
    
    D --> E{Query Success?}
    E -->|No| F[Database Error]
    E -->|Yes| G[Process Results]
    
    F --> F1[Log Error]
    F1 --> F2[Return 500 Server Error]
    
    G --> H{Has Results?}
    H -->|No| I[Return 404 Not Found]
    H -->|Yes| J[Format Response]
    
    J --> K[Return 200 Success]
    
    C --> L[Client Error Response]
    F2 --> L
    I --> L
    K --> L
```

## 8. Caching Strategy

```mermaid
graph LR
    A[Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached Data]
    B -->|No| D[Query Database]
    D --> E[Process Data]
    E --> F[Store in Cache]
    F --> G[Return Data]
    
    H[Cache Invalidation] --> I[Article Updated]
    I --> J[Clear Related Cache]
    J --> K[Update Cache Keys]
    
    L[Cache TTL] --> M[5 minutes for trending]
    L --> N[10 minutes for popular]
    L --> O[2 minutes for hot]
    L --> P[15 minutes for ranking]
```
