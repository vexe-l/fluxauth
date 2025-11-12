# Integration Guide

Learn how to integrate FluxAuth into your application.

## Overview

FluxAuth can be integrated into any web application in three ways:

1. **JavaScript SDK** - Easiest, works in any frontend framework
2. **REST API** - Direct HTTP calls from any language
3. **Webhooks** - Real-time notifications to your backend

## Integration Flow

```
User Login → Enroll (first time) → Authenticate → Continuous Monitoring
```

## Option 1: JavaScript SDK

### Installation

Copy the SDK from the FluxAuth repository:

```bash
# Copy SDK to your project
cp fluxauth/frontend/src/sdk/browser.ts your-app/src/sdk/
```

### Basic Setup

```javascript
import { BehaviorSDK } from './sdk/browser';

// Initialize SDK
const fluxAuth = new BehaviorSDK({
  apiUrl: 'http://localhost:3001/api',  // Your FluxAuth API URL
  apiKey: 'your-api-key',
  batchInterval: 5000,  // Send data every 5 seconds
  enableMouse: true     // Track mouse movements
});
```

### Step 1: Enroll New Users

When a user signs up or first logs in, enroll them:

```javascript
async function enrollNewUser(userId) {
  const sessions = [];
  
  // Collect 4 typing samples
  for (let i = 0; i < 4; i++) {
    const sessionId = `enroll-${userId}-${i}`;
    
    // Start tracking
    await fluxAuth.startSession(sessionId, userId);
    
    // Show prompt to user: "Type this sentence..."
    // User types naturally in a text field
    
    // Stop tracking after they finish
    fluxAuth.endSession();
    
    // Save the events
    sessions.push({
      sessionId,
      events: fluxAuth.getEvents()
    });
    
    fluxAuth.clearEvents();
  }
  
  // Send enrollment data to FluxAuth
  try {
    await fluxAuth.enroll(userId, sessions);
    console.log('User enrolled successfully!');
  } catch (error) {
    console.error('Enrollment failed:', error);
  }
}
```

### Step 2: Authenticate Users

During login, verify the user's typing pattern:

```javascript
async function authenticateUser(userId, password) {
  // 1. Verify password (your existing logic)
  const passwordValid = await verifyPassword(userId, password);
  if (!passwordValid) return false;
  
  // 2. Verify behavioral pattern
  const sessionId = `auth-${userId}-${Date.now()}`;
  
  await fluxAuth.startSession(sessionId, userId);
  // User has already typed their password - events captured
  fluxAuth.endSession();
  
  const result = await fluxAuth.score(
    userId,
    sessionId,
    fluxAuth.getEvents()
  );
  
  console.log('Trust Score:', result.trustScore);
  console.log('Is Anomaly:', result.isAnomaly);
  console.log('AI Analysis:', result.aiAnalysis);
  
  // 3. Make decision based on trust score
  if (result.trustScore < 40) {
    // Very suspicious - block or require MFA
    return { success: false, reason: 'Behavioral verification failed' };
  } else if (result.trustScore < 70) {
    // Somewhat suspicious - require additional verification
    return { success: true, requireMFA: true };
  } else {
    // Normal behavior - allow access
    return { success: true };
  }
}
```

### Step 3: Continuous Monitoring (Optional)

Monitor user behavior throughout their session:

```javascript
// Start monitoring after successful login
let monitoringInterval;

function startContinuousMonitoring(userId, sessionId) {
  await fluxAuth.startSession(sessionId, userId);
  
  monitoringInterval = setInterval(async () => {
    const events = fluxAuth.getEvents();
    
    if (events.length > 50) {  // Only score if enough data
      const result = await fluxAuth.score(userId, sessionId, events);
      
      if (result.isAnomaly || result.trustScore < 50) {
        // Suspicious activity detected
        handleSuspiciousActivity(result);
      }
      
      fluxAuth.clearEvents();
    }
  }, 30000);  // Check every 30 seconds
}

function stopContinuousMonitoring() {
  clearInterval(monitoringInterval);
  fluxAuth.endSession();
}

function handleSuspiciousActivity(result) {
  // Log out user
  logoutUser();
  
  // Show message
  alert('Unusual activity detected. Please log in again.');
  
  // Log security event
  logSecurityEvent({
    type: 'ANOMALOUS_BEHAVIOR',
    trustScore: result.trustScore,
    reasons: result.topReasons
  });
}
```

## Option 2: REST API

### Enroll User

```bash
curl -X POST http://localhost:3001/api/enroll \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessions": [
      {
        "sessionId": "enroll-1",
        "events": [
          {
            "type": "keydown",
            "timestamp": 1234567890,
            "keyClass": "letter"
          },
          {
            "type": "keyup",
            "timestamp": 1234567950,
            "keyClass": "letter"
          }
        ]
      }
    ]
  }'
```

### Score Authentication

```bash
curl -X POST http://localhost:3001/api/session/score \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "sessionId": "auth-456",
    "events": [
      {
        "type": "keydown",
        "timestamp": 1234567890,
        "keyClass": "letter"
      }
    ]
  }'
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
  "aiAnalysis": "User typing patterns match baseline with 88% confidence..."
}
```

## Option 3: Webhooks

Configure webhooks to receive real-time notifications:

### Setup Webhook Endpoint

```javascript
// In your backend
app.post('/webhooks/fluxauth', (req, res) => {
  const { event, userId, trustScore, sessionId, timestamp } = req.body;
  
  switch (event) {
    case 'anomaly_detected':
      // Force logout
      forceLogout(userId);
      sendSecurityAlert(userId, 'Suspicious activity detected');
      break;
      
    case 'trust_score_low':
      // Require re-authentication
      requireReauth(userId);
      break;
      
    case 'enrollment_complete':
      // User successfully enrolled
      notifyUser(userId, 'Behavioral authentication enabled');
      break;
  }
  
  res.sendStatus(200);
});
```

## Framework-Specific Examples

### React

```jsx
import { useState, useEffect } from 'react';
import { BehaviorSDK } from './sdk/browser';

function LoginForm() {
  const [sdk] = useState(() => new BehaviorSDK({
    apiUrl: process.env.REACT_APP_FLUXAUTH_API,
    apiKey: process.env.REACT_APP_FLUXAUTH_KEY
  }));
  
  const handleLogin = async (userId, password) => {
    const sessionId = `auth-${Date.now()}`;
    await sdk.startSession(sessionId, userId);
    
    // Verify password
    const valid = await verifyPassword(userId, password);
    
    sdk.endSession();
    const result = await sdk.score(userId, sessionId, sdk.getEvents());
    
    if (valid && result.trustScore > 70) {
      // Success
      navigate('/dashboard');
    } else {
      // Failed
      setError('Authentication failed');
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      {/* Your login form */}
    </form>
  );
}
```

### Vue.js

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { BehaviorSDK } from './sdk/browser';

const sdk = new BehaviorSDK({
  apiUrl: import.meta.env.VITE_FLUXAUTH_API,
  apiKey: import.meta.env.VITE_FLUXAUTH_KEY
});

const login = async (userId, password) => {
  const sessionId = `auth-${Date.now()}`;
  await sdk.startSession(sessionId, userId);
  
  // Your login logic
  
  sdk.endSession();
  const result = await sdk.score(userId, sessionId, sdk.getEvents());
  
  if (result.trustScore > 70) {
    router.push('/dashboard');
  }
};
</script>
```

### Next.js

```typescript
// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId, events } = await request.json();
  
  // Call FluxAuth API
  const response = await fetch('http://localhost:3001/api/session/score', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.FLUXAUTH_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId,
      sessionId: `auth-${Date.now()}`,
      events
    })
  });
  
  const result = await response.json();
  
  return NextResponse.json(result);
}
```

## Best Practices

1. **Enroll with variety**: Have users type different prompts for better accuracy
2. **Handle errors gracefully**: Don't block users if FluxAuth is down
3. **Set appropriate thresholds**: Adjust trust score thresholds for your use case
4. **Monitor continuously**: Check behavior throughout the session, not just at login
5. **Combine with existing auth**: Use FluxAuth as an additional layer, not replacement
6. **Test thoroughly**: Try with different devices, browsers, and user types

## Next Steps

- [API Reference](api-reference.md) - Complete API documentation
- [SDK Reference](sdk-reference.md) - Detailed SDK methods
- [Use Cases](use-cases.md) - Real-world implementation examples
- [Security & Privacy](security-privacy.md) - Security best practices
