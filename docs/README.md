# API Documentation

Complete API reference for the AI-Powered Content Moderation system.

## 📚 Documentation Index

### Implementation Guides

- **[Authentication](./authentication.md)** - JWT implementation and security guide
- **[Performance Optimization](./performance-optimization.md)** - Caching, rate limiting, and cost optimization
- **[TypeScript Strict Mode](./typescript-strict-mode.md)** - Type safety implementation

## 🔐 Authentication

All content endpoints require JWT authentication via Supabase Auth.

### Headers

```
Authorization: Bearer <jwt-token>
```

### Obtaining a Token

**Frontend (Supabase Auth):**

```typescript
const { data } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});

const token = data.session?.access_token;
```

## 📡 API Endpoints

### Content Submission

#### POST /content/submit

Submit content for AI-powered moderation.

**Rate Limit:** 5 requests per minute per IP

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "contentType": "text",
  "contentText": "Content to moderate"
}
```

Or for images:

```json
{
  "contentType": "image",
  "contentUrl": "https://example.com/image.jpg"
}
```

**Response (200 OK):**

```json
{
  "submissionId": "uuid",
  "status": "pending",
  "userId": "user-uuid",
  "createdAt": "2025-10-20T12:00:00.000Z",
  "result": {
    "decision": "safe",
    "reason": "Content appears appropriate",
    "categories": ["general"],
    "confidence": 0.95,
    "visualizationUrl": null
  }
}
```

**Status Values:**

- `pending` - Awaiting moderation
- `approved` - Content is safe
- `flagged` - Content needs review
- `rejected` - Content violates policies

**Decision Values:**

- `safe` - No issues detected
- `flagged` - Requires human review
- `harmful` - Should be rejected

**Response (429 Too Many Requests):**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**Response (401 Unauthorized):**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

#### GET /content/status/:id

Get moderation status for a submission.

**Rate Limit:** 30 requests per minute per IP

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**

```json
{
  "id": "uuid",
  "status": "approved",
  "result": {
    "decision": "safe",
    "reason": "Content is appropriate",
    "categories": ["general"],
    "confidence": 0.95,
    "visualizationUrl": null
  },
  "createdAt": "2025-10-20T12:00:00.000Z",
  "completedAt": "2025-10-20T12:00:03.000Z"
}
```

**Response (404 Not Found):**

```json
{
  "statusCode": 404,
  "message": "Submission not found"
}
```

---

### Monitoring

#### GET /monitoring/health

Health check endpoint for orchestration platforms.

**No authentication required**

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "uptime": 3600.5
}
```

---

#### GET /monitoring/metrics

Performance metrics and cost tracking.

**No authentication required**

**Response (200 OK):**

```json
{
  "cache": {
    "hits": 450,
    "misses": 550,
    "hitRate": 0.45,
    "totalRequests": 1000
  },
  "costs": {
    "totalRequests": 1000,
    "aiRequests": 550,
    "cachedRequests": 450,
    "estimatedCost": 82.5,
    "estimatedSavings": 67.5,
    "savingsPercentage": 0.45
  },
  "performance": {
    "averageResponseTime": 840,
    "cacheHitResponseTime": 45,
    "cacheMissResponseTime": 2100
  }
}
```

**Cost Calculation:**

- AI request cost: $0.15 per request
- Cache hit cost: ~$0.001 (negligible)
- Savings = (cachedRequests × $0.15)

---

## 🔢 Rate Limits

| Endpoint                | Limit       | Window   |
| ----------------------- | ----------- | -------- |
| POST /content/submit    | 5 requests  | 1 minute |
| GET /content/status/:id | 30 requests | 1 minute |
| GET /monitoring/\*      | 10 requests | 1 minute |

**Rate limit headers in response:**

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1634731200
```

---

## ⚡ Performance

### Caching

- **SHA-256 hash-based** content deduplication
- **1 hour TTL** for moderation results
- **40-45% hit rate** reduces costs and latency
- **Sub-50ms response** for cached content

### Response Times

- **Cache hit:** <50ms
- **Cache miss:** 2-5 seconds (AI processing)
- **Average (with 40% hit rate):** ~840ms

---

## 🛠️ Error Handling

### Standard Error Format

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Status Codes

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 🧪 Testing Examples

### Submit Text Content

```bash
curl -X POST http://localhost:3001/content/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "text",
    "contentText": "This is a test message"
  }'
```

### Submit Image Content

```bash
curl -X POST http://localhost:3001/content/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "image",
    "contentUrl": "https://example.com/image.jpg"
  }'
```

### Check Status

```bash
curl -X GET http://localhost:3001/content/status/abc-123-def \
  -H "Authorization: Bearer $TOKEN"
```

### Health Check

```bash
curl http://localhost:3001/monitoring/health
```

### View Metrics

```bash
curl http://localhost:3001/monitoring/metrics
```

---

## 🔗 Related Documentation

- **Main README:** [../README.md](../README.md)
- **Authentication Guide:** [authentication.md](./authentication.md)
- **Performance Guide:** [performance-optimization.md](./performance-optimization.md)
- **TypeScript Guide:** [typescript-strict-mode.md](./typescript-strict-mode.md)
