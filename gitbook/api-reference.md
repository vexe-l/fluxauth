# API Reference

Complete REST API documentation for FluxAuth.

## Base URL

```
http://localhost:3001/api  # Development
https://your-domain.com/api  # Production
```

## Authentication

All API requests require an API key in the header:

```
x-api-key: your-api-key-here
```

## Endpoints

### POST /api/enroll

Enroll a new user with their behavioral baseline.

**Request Body:**

```json
{
  "userId": "string",
  "sessions": [
    {
      "sessionId": "string",
      "events": [
        {
          "type": "keydown" | "keyup" | "mousemove",
          "timestamp": "number",
          "keyClass": "letter" | "number" | "special" | "space" | "backspace"
        }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "userId": "user123",
  "message": "User enrolled successfully",
  "profileCreated": true
}
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/enroll \
  -H "x-api-key: dev_key_12345" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "sessions": [
      {
        "sessionId": "enroll-1",
        "events": [
          {"type": "keydown", "timestamp": 1700000000000, "keyClass": "letter"},
          {"type": "keyup", "timestamp": 1700000000100, "keyClass": "letter"}
        ]
      }
    ]
  }'
```

---

### POST /api/session/score

Score a behavioral session against the user's baseline.

**Request Body:**

```json
{
  "userId": "string",
  "sessionId": "string",
  "events": [
    {
      "type": "keydown" | "keyup" | "mousemove",
      "timestamp": "number",
      "keyClass": "string"
    }
  ]
}
```

**Response:**

```json
{
  "trustScore": 88,
  "isAnomaly": false,
  "topReasons": [
    {
      "code": "MEAN_FLIGHT_HIGH",
      "message": "Flight time is 1.2σ above normal",
      "feature": "meanFlight",
      "zscore": 1.2
    }
  ],
  "aiAnalysis": "User typing patterns match baseline with 88% confidence. No suspicious indicators detected.",
  "aiExplanation": "Your typing speed is slightly faster than usual, but within normal variation."
}
```

**Trust Score Interpretation:**

- **90-100**: Excellent match, very confident
- **70-89**: Good match, normal behavior
- **50-69**: Moderate match, slightly suspicious
- **30-49**: Poor match, suspicious behavior
- **0-29**: Very poor match, likely imposter

**Example:**

```bash
curl -X POST http://localhost:3001/api/session/score \
  -H "x-api-key: dev_key_12345" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "sessionId": "auth-123",
    "events": [
      {"type": "keydown", "timestamp": 1700000000000, "keyClass": "letter"},
      {"type": "keyup", "timestamp": 1700000000100, "keyClass": "letter"}
    ]
  }'
```

---

### POST /api/session/start

Start a new behavioral tracking session.

**Request Body:**

```json
{
  "sessionId": "string",
  "userId": "string"
}
```

**Response:**

```json
{
  "success": true,
  "sessionId": "session-123",
  "message": "Session started"
}
```

**Example:**

```bash
curl -X POST http://localhost:3001/api/session/start \
  -H "x-api-key: dev_key_12345" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-123",
    "userId": "alice"
  }'
```

---

### GET /api/sessions/recent

Get recent session history.

**Query Parameters:**

- `limit` (optional): Number of sessions to return (default: 20)
- `userId` (optional): Filter by user ID

**Response:**

```json
{
  "sessions": [
    {
      "session_id": "session-123",
      "user_id": "alice",
      "trust_score": 88,
      "is_anomaly": 0,
      "created_at": "2024-01-15T10:30:00Z",
      "scored_at": "2024-01-15T10:30:05Z"
    }
  ]
}
```

**Example:**

```bash
curl -X GET "http://localhost:3001/api/sessions/recent?limit=10" \
  -H "x-api-key: dev_key_12345"
```

---

### GET /api/ai/threat-report

Generate an AI-powered security analysis of recent authentication patterns.

**Response:**

```json
{
  "report": "Security Analysis:\n\n1. Recent Activity: 15 authentication attempts in the last hour\n2. Anomalies Detected: 2 suspicious sessions flagged\n3. Recommendations: Enable MFA for users with trust scores below 60",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Example:**

```bash
curl -X GET http://localhost:3001/api/ai/threat-report \
  -H "x-api-key: dev_key_12345"
```

---

### GET /api/health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Example:**

```bash
curl http://localhost:3001/api/health
```

---

## Event Types

### Keyboard Events

```typescript
{
  type: 'keydown' | 'keyup',
  timestamp: number,  // Unix timestamp in milliseconds
  keyClass: 'letter' | 'number' | 'special' | 'space' | 'backspace'
}
```

### Mouse Events

```typescript
{
  type: 'mousemove',
  timestamp: number,
  x: number,  // X coordinate
  y: number   // Y coordinate
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing API key |
| `USER_NOT_FOUND` | 404 | User not enrolled |
| `INVALID_REQUEST` | 400 | Malformed request body |
| `INSUFFICIENT_DATA` | 400 | Not enough events to score |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

**Example Error:**

```json
{
  "error": "User not enrolled. Please enroll the user first.",
  "code": "USER_NOT_FOUND",
  "details": {
    "userId": "alice"
  }
}
```

## Rate Limiting

- **Default**: 100 requests per 15 minutes per API key
- **Headers**: Rate limit info included in response headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

## Webhooks

Configure webhooks to receive real-time notifications.

### Webhook Events

- `enrollment_complete` - User successfully enrolled
- `anomaly_detected` - Suspicious behavior detected
- `trust_score_low` - Trust score below threshold
- `session_started` - New session started
- `session_scored` - Session scored

### Webhook Payload

```json
{
  "event": "anomaly_detected",
  "userId": "alice",
  "sessionId": "session-123",
  "trustScore": 35,
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "reasons": [...]
  }
}
```

## SDK vs API

| Feature | JavaScript SDK | REST API |
|---------|---------------|----------|
| Ease of use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Auto event capture | ✅ | ❌ |
| Batch sending | ✅ | ❌ |
| Language support | JavaScript only | Any language |
| Offline scoring | ✅ (optional) | ❌ |

**Recommendation**: Use the SDK for web apps, use the API for mobile/backend integrations.

## Next Steps

- [SDK Reference](sdk-reference.md) - JavaScript SDK documentation
- [Integration Guide](integration-guide.md) - Step-by-step integration
- [Use Cases](use-cases.md) - Real-world examples
