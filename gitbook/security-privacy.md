# Security & Privacy

Security best practices and privacy considerations for FluxAuth.

## Privacy-First Design

FluxAuth is designed with privacy as a core principle:

### What We DON'T Collect

- ❌ Actual keystrokes or text content
- ❌ Passwords or credentials
- ❌ Personal identifiable information (PII)
- ❌ Screen recordings or screenshots
- ❌ Browsing history

### What We DO Collect

- ✅ Timing patterns (when keys are pressed/released)
- ✅ Key classifications (letter, number, special - not which specific key)
- ✅ Mouse movement patterns (coordinates, not content)
- ✅ Session metadata (timestamps, user IDs)

### Example Data

```json
{
  "type": "keydown",
  "timestamp": 1700000000000,
  "keyClass": "letter"  // NOT "a" or "password"
}
```

**You cannot reconstruct what the user typed from this data.**

---

## GDPR Compliance

FluxAuth is designed to be GDPR-compliant:

### Right to Access

Users can request their behavioral data:

```javascript
// API endpoint to export user data
app.get('/api/user/:userId/data', async (req, res) => {
  const userData = await db.getUserData(req.params.userId);
  res.json({
    userId: req.params.userId,
    enrollmentDate: userData.created_at,
    sessionsCount: userData.sessions_count,
    // No PII included
  });
});
```

### Right to Erasure

Users can request deletion of their data:

```javascript
// Delete user data
app.delete('/api/user/:userId', async (req, res) => {
  await db.deleteUser(req.params.userId);
  await db.deleteUserSessions(req.params.userId);
  res.json({ success: true, message: 'User data deleted' });
});
```

### Data Minimization

Only collect what's necessary:

```javascript
// Configure SDK to minimize data collection
const sdk = new BehaviorSDK({
  apiUrl: 'https://api.example.com',
  apiKey: 'your-key',
  enableMouse: false,  // Disable mouse tracking if not needed
  batchInterval: 10000  // Send less frequently
});
```

### Consent Management

Always obtain user consent:

```javascript
// Example consent flow
function ConsentBanner() {
  const [accepted, setAccepted] = useState(false);
  
  if (accepted) return null;
  
  return (
    <div className="consent-banner">
      <p>
        We use behavioral biometrics to enhance security. 
        We only collect typing patterns, not what you type.
      </p>
      <button onClick={() => {
        setAccepted(true);
        localStorage.setItem('fluxauth-consent', 'true');
        initializeFluxAuth();
      }}>
        Accept
      </button>
      <a href="/privacy-policy">Learn More</a>
    </div>
  );
}
```

---

## Security Best Practices

### 1. API Key Management

**Generate Strong Keys:**

```bash
# Generate secure API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Rotate Keys Regularly:**

```javascript
// Implement key rotation
const API_KEYS = {
  'key-v1': { active: false, expires: '2024-01-01' },
  'key-v2': { active: true, expires: '2024-06-01' }
};

function validateApiKey(key) {
  const keyInfo = API_KEYS[key];
  return keyInfo && keyInfo.active && new Date() < new Date(keyInfo.expires);
}
```

**Never Commit Keys:**

```bash
# .gitignore
.env
.env.local
.env.production
*.key
secrets/
```

### 2. HTTPS Only

Always use HTTPS in production:

```javascript
// Enforce HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

### 3. Rate Limiting

Prevent abuse with rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

### 4. Input Validation

Validate all inputs:

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/session/score',
  body('userId').isString().trim().isLength({ min: 1, max: 100 }),
  body('sessionId').isString().trim(),
  body('events').isArray({ min: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

### 5. SQL Injection Prevention

Use parameterized queries:

```javascript
// ❌ BAD - Vulnerable to SQL injection
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ GOOD - Safe parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.get(query, [userId], (err, row) => {
  // Handle result
});
```

### 6. XSS Prevention

Sanitize outputs:

```javascript
const xss = require('xss');

// Sanitize user input before storing
const sanitizedInput = xss(userInput);
```

### 7. CORS Configuration

Configure CORS properly:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key']
}));
```

### 8. Secure Headers

Add security headers:

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Data Encryption

### At Rest

Encrypt database:

```bash
# SQLite with encryption
npm install @journeyapps/sqlcipher

# Use encrypted database
const sqlite3 = require('@journeyapps/sqlcipher').verbose();
const db = new sqlite3.Database('encrypted.db');
db.run("PRAGMA key = 'your-encryption-key'");
```

### In Transit

Always use HTTPS/TLS:

```javascript
// Enforce TLS 1.2+
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  minVersion: 'TLSv1.2'
};

https.createServer(options, app).listen(443);
```

---

## Audit Logging

Log security events:

```javascript
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log security events
function logSecurityEvent(event) {
  securityLogger.info({
    timestamp: new Date().toISOString(),
    event: event.type,
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    details: event.details
  });
}

// Usage
logSecurityEvent({
  type: 'ANOMALY_DETECTED',
  userId: 'user123',
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  details: { trustScore: 35 }
});
```

---

## Compliance Certifications

### SOC 2 Preparation

Key controls to implement:

1. **Access Control**
   - Multi-factor authentication for admin access
   - Role-based access control (RBAC)
   - Regular access reviews

2. **Change Management**
   - Version control (Git)
   - Code review process
   - Deployment procedures

3. **Monitoring**
   - Security event logging
   - Anomaly detection
   - Incident response plan

4. **Data Protection**
   - Encryption at rest and in transit
   - Regular backups
   - Data retention policies

### HIPAA Compliance

For healthcare applications:

1. **Access Controls**
   ```javascript
   // Implement audit trail
   function accessPatientRecord(doctorId, patientId) {
     auditLog.write({
       event: 'PATIENT_RECORD_ACCESS',
       doctor: doctorId,
       patient: patientId,
       timestamp: Date.now(),
       behavioralVerified: true
     });
   }
   ```

2. **Encryption**
   - All data encrypted at rest
   - TLS 1.2+ for data in transit
   - Encrypted backups

3. **Audit Trails**
   - Log all access to PHI
   - Retain logs for 6 years
   - Regular audit reviews

---

## Incident Response

### Detection

Monitor for security incidents:

```javascript
// Detect suspicious patterns
function detectSuspiciousActivity(userId, events) {
  const recentFailures = getRecentFailures(userId);
  
  if (recentFailures.length > 5) {
    // Multiple failed attempts
    alertSecurityTeam({
      type: 'BRUTE_FORCE_ATTEMPT',
      userId,
      attempts: recentFailures.length
    });
    
    // Temporarily lock account
    lockAccount(userId, '15 minutes');
  }
}
```

### Response Plan

1. **Identify**: Detect and confirm incident
2. **Contain**: Limit damage and prevent spread
3. **Eradicate**: Remove threat
4. **Recover**: Restore normal operations
5. **Learn**: Post-incident review

### Example Response

```javascript
async function handleSecurityIncident(incident) {
  // 1. Log incident
  securityLogger.error({
    type: 'SECURITY_INCIDENT',
    severity: incident.severity,
    details: incident
  });
  
  // 2. Alert team
  await notifySecurityTeam(incident);
  
  // 3. Take action
  if (incident.severity === 'HIGH') {
    await lockAccount(incident.userId);
    await invalidateAllSessions(incident.userId);
  }
  
  // 4. Document
  await createIncidentReport(incident);
}
```

---

## Privacy Policy Template

Include in your privacy policy:

```markdown
## Behavioral Biometric Data

We use FluxAuth to enhance account security through behavioral biometrics.

**What we collect:**
- Typing rhythm patterns (timing between keystrokes)
- Mouse movement patterns
- Session metadata

**What we DON'T collect:**
- Actual keystrokes or text content
- Passwords or credentials
- Personal information from your typing

**How we use it:**
- Verify your identity during login
- Detect unauthorized access to your account
- Prevent fraud and account takeover

**Your rights:**
- Access your behavioral data
- Request deletion of your data
- Opt-out of behavioral authentication

**Data retention:**
- Behavioral patterns: 90 days
- Session logs: 30 days
- Audit logs: 1 year

For questions: privacy@yourcompany.com
```

---

## Security Checklist

Before going to production:

- [ ] Use HTTPS everywhere
- [ ] Generate strong, random API keys
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Add security headers (Helmet.js)
- [ ] Validate all inputs
- [ ] Use parameterized SQL queries
- [ ] Encrypt sensitive data
- [ ] Implement audit logging
- [ ] Set up monitoring and alerts
- [ ] Create incident response plan
- [ ] Obtain user consent
- [ ] Write privacy policy
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Backup data regularly

---

## Vulnerability Reporting

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email: security@yourcompany.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours.

---

## Next Steps

- [Deployment Guide](deployment.md) - Deploy securely
- [Best Practices](best-practices.md) - Optimization tips
- [Configuration](configuration.md) - Security settings
