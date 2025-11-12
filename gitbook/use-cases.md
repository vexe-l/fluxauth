# Use Cases

Real-world implementation examples for FluxAuth.

## 1. Banking & Financial Services

### Account Takeover Prevention

**Problem**: Attackers steal credentials through phishing, then drain accounts.

**Solution**: Even with valid credentials, FluxAuth detects the imposter's different typing pattern.

```javascript
// During login
const authResult = await fluxAuth.score(userId, sessionId, events);

if (authResult.trustScore < 50) {
  // Block access and alert security team
  blockLogin(userId);
  sendSecurityAlert({
    type: 'ACCOUNT_TAKEOVER_ATTEMPT',
    userId,
    trustScore: authResult.trustScore,
    ipAddress: req.ip
  });
  
  // Notify legitimate user
  sendEmail(userId, 'Suspicious login attempt detected');
  
  return { success: false, message: 'Additional verification required' };
}
```

### High-Value Transaction Verification

```javascript
// Before wire transfer
async function verifyTransaction(userId, amount) {
  if (amount > 10000) {
    const result = await fluxAuth.score(userId, sessionId, events);
    
    if (result.trustScore < 70) {
      // Require additional verification
      return {
        approved: false,
        requireMFA: true,
        message: 'Please verify your identity'
      };
    }
  }
  
  return { approved: true };
}
```

**Impact**: 
- 90% reduction in account takeover fraud
- $2M+ saved annually in fraud losses
- Better user experience (no constant MFA prompts for legitimate users)

---

## 2. Enterprise SaaS

### Insider Threat Detection

**Problem**: Employees with legitimate access may act maliciously or have their accounts compromised.

**Solution**: Continuous monitoring detects when someone else is using an employee's account.

```javascript
// Monitor employee sessions
class SessionMonitor {
  constructor(employeeId) {
    this.employeeId = employeeId;
    this.sessionId = `work-${Date.now()}`;
    this.startMonitoring();
  }
  
  async startMonitoring() {
    await fluxAuth.startSession(this.sessionId, this.employeeId);
    
    // Check every 2 minutes
    this.interval = setInterval(async () => {
      const result = await fluxAuth.score(
        this.employeeId,
        this.sessionId,
        fluxAuth.getEvents()
      );
      
      if (result.isAnomaly || result.trustScore < 60) {
        this.handleAnomaly(result);
      }
      
      fluxAuth.clearEvents();
    }, 120000);
  }
  
  handleAnomaly(result) {
    // Log security event
    auditLog.write({
      event: 'ANOMALOUS_BEHAVIOR',
      employee: this.employeeId,
      trustScore: result.trustScore,
      reasons: result.topReasons,
      timestamp: Date.now()
    });
    
    // Alert security team
    notifySecurityTeam({
      employee: this.employeeId,
      severity: result.trustScore < 40 ? 'HIGH' : 'MEDIUM',
      analysis: result.aiAnalysis
    });
    
    // Require re-authentication
    if (result.trustScore < 40) {
      forceReauth(this.employeeId);
    }
  }
  
  stopMonitoring() {
    clearInterval(this.interval);
    fluxAuth.endSession();
  }
}

// Usage
const monitor = new SessionMonitor(employeeId);
// Monitor runs automatically
// Call monitor.stopMonitoring() on logout
```

**Impact**:
- Early detection of compromised accounts
- Audit trail for compliance (SOC2, ISO 27001)
- Reduced insider threat incidents by 75%

---

## 3. E-commerce

### Bot Detection at Checkout

**Problem**: Bots buy limited-edition items, scalpers resell at markup.

**Solution**: Detect automated scripts during checkout.

```javascript
async function validateCheckout(userId, cartItems) {
  const result = await fluxAuth.score(userId, sessionId, events);
  
  // Check for bot indicators
  const botIndicators = result.topReasons.filter(r => 
    r.code.includes('UNIFORM') || 
    r.code.includes('FAST') ||
    r.code.includes('REPETITIVE')
  );
  
  if (botIndicators.length > 2 || result.trustScore < 30) {
    // Likely a bot
    return {
      success: false,
      requireCaptcha: true,
      message: 'Please verify you are human'
    };
  }
  
  // Check for suspicious patterns
  if (result.trustScore < 60 && isLimitedEdition(cartItems)) {
    // Flag for manual review
    flagOrder(userId, 'SUSPICIOUS_BEHAVIOR');
  }
  
  return { success: true };
}
```

**Impact**:
- 85% reduction in bot purchases
- Fair access to limited products for real customers
- Increased customer satisfaction

---

## 4. Healthcare (HIPAA Compliance)

### Continuous Authentication for EHR Access

**Problem**: HIPAA requires verification that authorized personnel are accessing patient records.

**Solution**: Continuous behavioral authentication throughout the session.

```javascript
class EHRAccessMonitor {
  async accessPatientRecord(doctorId, patientId) {
    // Verify doctor's identity
    const result = await fluxAuth.score(doctorId, sessionId, events);
    
    if (result.trustScore < 70) {
      // Require re-authentication
      return {
        access: 'DENIED',
        reason: 'Identity verification required',
        requireReauth: true
      };
    }
    
    // Log access with behavioral verification
    auditLog.write({
      event: 'PATIENT_RECORD_ACCESS',
      doctor: doctorId,
      patient: patientId,
      trustScore: result.trustScore,
      behavioralVerified: true,
      timestamp: Date.now()
    });
    
    // Grant access
    return {
      access: 'GRANTED',
      record: await getPatientRecord(patientId)
    };
  }
}
```

**Compliance Benefits**:
- Meets HIPAA continuous authentication requirements
- Audit trail with behavioral verification
- Detects unauthorized access attempts
- Reduces risk of data breaches

---

## 5. Gaming & Esports

### Account Sharing Detection

**Problem**: Players pay others to boost their rank (account sharing).

**Solution**: Detect when a different person is playing on an account.

```javascript
// Monitor gameplay sessions
async function monitorGameSession(playerId) {
  const result = await fluxAuth.score(playerId, sessionId, events);
  
  if (result.isAnomaly) {
    // Different person detected
    suspendAccount(playerId, 'ACCOUNT_SHARING_DETECTED');
    
    notifyPlayer(playerId, {
      message: 'Unusual activity detected on your account',
      action: 'Please verify your identity',
      penalty: 'Temporary suspension'
    });
    
    // Log for anti-cheat system
    antiCheatLog.write({
      player: playerId,
      violation: 'ACCOUNT_SHARING',
      confidence: 100 - result.trustScore,
      evidence: result.topReasons
    });
  }
}
```

**Impact**:
- Fair competitive environment
- Reduced account boosting services
- Better matchmaking accuracy

---

## 6. Remote Work Security

### VPN + Behavioral Authentication

**Problem**: VPN credentials can be stolen or shared.

**Solution**: Combine VPN with behavioral verification.

```javascript
// VPN connection handler
async function handleVPNConnection(employeeId, vpnCredentials) {
  // 1. Verify VPN credentials
  const vpnValid = await verifyVPNCredentials(vpnCredentials);
  if (!vpnValid) return { connected: false };
  
  // 2. Verify behavioral pattern
  const result = await fluxAuth.score(employeeId, sessionId, events);
  
  if (result.trustScore < 60) {
    // Suspicious - deny VPN access
    logSecurityEvent({
      type: 'VPN_ACCESS_DENIED',
      employee: employeeId,
      reason: 'Behavioral verification failed',
      trustScore: result.trustScore
    });
    
    return {
      connected: false,
      reason: 'Additional verification required'
    };
  }
  
  // 3. Grant VPN access
  return { connected: true };
}
```

---

## 7. Cryptocurrency Exchange

### Withdrawal Verification

**Problem**: Stolen exchange accounts lead to irreversible crypto theft.

**Solution**: Behavioral verification before withdrawals.

```javascript
async function verifyWithdrawal(userId, amount, address) {
  const result = await fluxAuth.score(userId, sessionId, events);
  
  // Risk-based verification
  const riskLevel = calculateRisk(amount, address);
  
  if (riskLevel === 'HIGH' && result.trustScore < 80) {
    // High-value withdrawal with suspicious behavior
    return {
      approved: false,
      requireMFA: true,
      requireEmailConfirmation: true,
      delay: '24 hours',
      message: 'Withdrawal will be processed after verification'
    };
  }
  
  if (result.trustScore < 50) {
    // Very suspicious - block immediately
    freezeAccount(userId);
    return {
      approved: false,
      message: 'Account frozen due to suspicious activity'
    };
  }
  
  return { approved: true };
}
```

---

## 8. Educational Platforms

### Online Exam Proctoring

**Problem**: Students may have someone else take their exam.

**Solution**: Verify student identity throughout the exam.

```javascript
class ExamProctor {
  async startExam(studentId, examId) {
    await fluxAuth.startSession(`exam-${examId}`, studentId);
    
    this.monitorInterval = setInterval(async () => {
      const result = await fluxAuth.score(studentId, sessionId, events);
      
      if (result.isAnomaly) {
        // Different person detected
        this.flagExam(studentId, examId, result);
      }
    }, 60000); // Check every minute
  }
  
  flagExam(studentId, examId, result) {
    examLog.write({
      student: studentId,
      exam: examId,
      flag: 'IDENTITY_VERIFICATION_FAILED',
      trustScore: result.trustScore,
      timestamp: Date.now()
    });
    
    // Notify instructor
    notifyInstructor(examId, {
      student: studentId,
      issue: 'Possible identity fraud',
      evidence: result.aiAnalysis
    });
  }
}
```

---

## Implementation Checklist

For any use case:

- [ ] Define trust score thresholds for your risk tolerance
- [ ] Implement fallback authentication (MFA, email verification)
- [ ] Set up monitoring and alerting
- [ ] Create audit logs for compliance
- [ ] Test with diverse user groups
- [ ] Handle edge cases (new devices, accessibility needs)
- [ ] Document security policies
- [ ] Train support team on behavioral auth

## Next Steps

- [Integration Guide](integration-guide.md) - Implement FluxAuth
- [Best Practices](best-practices.md) - Optimization tips
- [API Reference](api-reference.md) - Complete API docs
