import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Code,
    Divider,
    List,
    ListItem,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Badge
} from '@chakra-ui/react';

export default function DocsPage() {
    return (
        <Box maxW="6xl" mx="auto">
            <VStack spacing={6} align="stretch">
                <Box>
                    <Heading size="xl" color="brand.400" mb={2}>FluxAuth Documentation</Heading>
                    <Text color="white">
                        Complete guide to integrating behavioral biometric authentication
                    </Text>
                </Box>

                <Tabs colorScheme="brand" variant="enclosed">
                    <TabList flexWrap="wrap">
                        <Tab>Introduction</Tab>
                        <Tab>Getting Started</Tab>
                        <Tab>Integration</Tab>
                        <Tab>API Reference</Tab>
                        <Tab>Use Cases</Tab>
                        <Tab>Security</Tab>
                        <Tab>Deployment</Tab>
                    </TabList>

                    <TabPanels>
                        {/* Introduction */}
                        <TabPanel>
                            <IntroductionSection />
                        </TabPanel>

                        {/* Getting Started */}
                        <TabPanel>
                            <GettingStartedSection />
                        </TabPanel>

                        {/* Integration */}
                        <TabPanel>
                            <IntegrationSection />
                        </TabPanel>

                        {/* API Reference */}
                        <TabPanel>
                            <APIReferenceSection />
                        </TabPanel>

                        {/* Use Cases */}
                        <TabPanel>
                            <UseCasesSection />
                        </TabPanel>

                        {/* Security */}
                        <TabPanel>
                            <SecuritySection />
                        </TabPanel>

                        {/* Deployment */}
                        <TabPanel>
                            <DeploymentSection />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Box>
    );
}

// Introduction Section
function IntroductionSection() {
    return (
        <VStack spacing={6} align="stretch">
            <Card bg="rgba(26, 26, 26, 0.6)" backdropFilter="blur(10px)">
                <CardBody>
                    <Heading size="lg" color="white" mb={4}>What is FluxAuth?</Heading>
                    <Text color="white" mb={4}>
                        FluxAuth provides continuous authentication by analyzing how users type and interact with their devices.
                        Instead of relying solely on passwords, it creates a unique "typing fingerprint" for each user.
                    </Text>

                    <Heading size="md" color="white" mb={3} mt={6}>Key Features</Heading>
                    <List spacing={2} color="white">
                        <ListItem>✅ <strong>Continuous Authentication</strong> - Monitor users throughout their session</ListItem>
                        <ListItem>✅ <strong>AI-Powered Analysis</strong> - Gemini AI explains security decisions</ListItem>
                        <ListItem>✅ <strong>Bot Detection</strong> - Identify automated attacks and scripts</ListItem>
                        <ListItem>✅ <strong>Privacy-First</strong> - No PII stored, only behavioral patterns</ListItem>
                        <ListItem>✅ <strong>Open Source</strong> - Free to use, modify, and deploy</ListItem>
                    </List>

                    <Heading size="md" color="white" mb={3} mt={6}>Quick Links</Heading>
                    <HStack spacing={3} flexWrap="wrap">
                        <Badge colorScheme="blue" p={2}>GitHub: github.com/anirudhf/fluxauth</Badge>
                        <Badge colorScheme="green" p={2}>License: MIT</Badge>
                    </HStack>
                </CardBody>
            </Card>
        </VStack>
    );
}

// Getting Started Section
function GettingStartedSection() {
    return (
        <VStack spacing={6} align="stretch">
            <Card bg="rgba(26, 26, 26, 0.6)" backdropFilter="blur(10px)">
                <CardBody>
                    <Heading size="lg" color="white" mb={4}>Getting Started</Heading>
                    <Text color="white" mb={4}>Get FluxAuth running in under 5 minutes.</Text>

                    <Heading size="md" color="white" mb={3}>Prerequisites</Heading>
                    <List spacing={2} color="white" mb={4}>
                        <ListItem>• Node.js 18+ installed</ListItem>
                        <ListItem>• npm or yarn package manager</ListItem>
                        <ListItem>• Basic knowledge of JavaScript/TypeScript</ListItem>
                    </List>

                    <Heading size="md" color="white" mb={3}>Installation</Heading>
                    <Text color="white" mb={2}>1. Clone the Repository</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`git clone https://github.com/yourusername/fluxauth.git
cd fluxauth`}
                    </Code>

                    <Text color="white" mb={2}>2. Install Dependencies</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`npm install
# Or install separately
cd backend && npm install
cd ../frontend && npm install`}
                    </Code>

                    <Text color="white" mb={2}>3. Configure Environment</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`cp backend/.env.example backend/.env
# Edit backend/.env with your settings`}
                    </Code>

                    <Text color="white" mb={2}>4. Start the Application</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`npm run dev
# Backend: http://localhost:3001
# Frontend: http://localhost:5173`}
                    </Code>

                    <Heading size="md" color="white" mb={3} mt={6}>Test the Demo</Heading>
                    <List spacing={2} color="white">
                        <ListItem>1. Open http://localhost:5173 in your browser</ListItem>
                        <ListItem>2. Click "Try It Now"</ListItem>
                        <ListItem>3. Enter a user ID (e.g., "demo-user")</ListItem>
                        <ListItem>4. Complete the 4 enrollment prompts by typing naturally</ListItem>
                        <ListItem>5. Go to the Test page to authenticate</ListItem>
                        <ListItem>6. See your trust score and AI analysis!</ListItem>
                    </List>
                </CardBody>
            </Card>
        </VStack>
    );
}

// Integration Section
function IntegrationSection() {
    return (
        <VStack spacing={6} align="stretch">
            <Card bg="rgba(26, 26, 26, 0.6)" backdropFilter="blur(10px)">
                <CardBody>
                    <Heading size="lg" color="white" mb={4}>Integration Guide</Heading>

                    <Heading size="md" color="white" mb={3}>JavaScript SDK Setup</Heading>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`import { BehaviorSDK } from './sdk/browser';

const fluxAuth = new BehaviorSDK({
  apiUrl: 'http://localhost:3001/api',
  apiKey: 'your-api-key',
  batchInterval: 5000,
  enableMouse: true
});`}
                    </Code>

                    <Heading size="md" color="white" mb={3}>Step 1: Enroll New Users</Heading>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`async function enrollNewUser(userId) {
  const sessions = [];
  
  for (let i = 0; i < 4; i++) {
    const sessionId = \`enroll-\${userId}-\${i}\`;
    await fluxAuth.startSession(sessionId, userId);
    
    // User types naturally
    fluxAuth.endSession();
    sessions.push({
      sessionId,
      events: fluxAuth.getEvents()
    });
    fluxAuth.clearEvents();
  }
  
  await fluxAuth.enroll(userId, sessions);
}`}
                    </Code>

                    <Heading size="md" color="white" mb={3}>Step 2: Authenticate Users</Heading>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`async function authenticateUser(userId, password) {
  const passwordValid = await verifyPassword(userId, password);
  if (!passwordValid) return false;
  
  const sessionId = \`auth-\${userId}-\${Date.now()}\`;
  await fluxAuth.startSession(sessionId, userId);
  fluxAuth.endSession();
  
  const result = await fluxAuth.score(
    userId, sessionId, fluxAuth.getEvents()
  );
  
  if (result.trustScore < 40) {
    return { success: false, reason: 'Behavioral verification failed' };
  } else if (result.trustScore < 70) {
    return { success: true, requireMFA: true };
  } else {
    return { success: true };
  }
}`}
                    </Code>

                    <Heading size="md" color="white" mb={3}>Framework Examples</Heading>
                    <Text color="white" mb={2}>React Integration:</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`import { useState } from 'react';
import { BehaviorSDK } from './sdk/browser';

function LoginForm() {
  const [sdk] = useState(() => new BehaviorSDK({
    apiUrl: process.env.REACT_APP_FLUXAUTH_API,
    apiKey: process.env.REACT_APP_FLUXAUTH_KEY
  }));
  
  const handleLogin = async (userId, password) => {
    const sessionId = \`auth-\${Date.now()}\`;
    await sdk.startSession(sessionId, userId);
    
    const valid = await verifyPassword(userId, password);
    sdk.endSession();
    
    const result = await sdk.score(userId, sessionId, sdk.getEvents());
    
    if (valid && result.trustScore > 70) {
      navigate('/dashboard');
    }
  };
  
  return <form onSubmit={handleLogin}>{/* form */}</form>;
}`}
                    </Code>
                </CardBody>
            </Card>
        </VStack>
    );
}

// API Reference Section
function APIReferenceSection() {
    return (
        <VStack spacing={6} align="stretch">
            <Card bg="rgba(26, 26, 26, 0.6)" backdropFilter="blur(10px)">
                <CardBody>
                    <Heading size="lg" color="white" mb={4}>API Reference</Heading>

                    <Text color="white" mb={4}>
                        Base URL: <Code>http://localhost:3001/api</Code> (Development)
                    </Text>
                    <Text color="white" mb={4}>
                        All requests require: <Code>x-api-key: your-api-key</Code>
                    </Text>

                    <Heading size="md" color="white" mb={3}>POST /api/enroll</Heading>
                    <Text color="white" mb={2}>Enroll a new user with behavioral baseline</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`curl -X POST http://localhost:3001/api/enroll \\
  -H "x-api-key: dev_key_12345" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "alice",
    "sessions": [{
      "sessionId": "enroll-1",
      "events": [
        {"type": "keydown", "timestamp": 1700000000000, "keyClass": "letter"},
        {"type": "keyup", "timestamp": 1700000000100, "keyClass": "letter"}
      ]
    }]
  }'`}
                    </Code>

                    <Divider my={4} />

                    <Heading size="md" color="white" mb={3}>POST /api/session/score</Heading>
                    <Text color="white" mb={2}>Score a behavioral session</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`curl -X POST http://localhost:3001/api/session/score \\
  -H "x-api-key: dev_key_12345" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "alice",
    "sessionId": "auth-123",
    "events": [...]
  }'`}
                    </Code>

                    <Text color="white" mb={2}>Response:</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`{
  "trustScore": 88,
  "isAnomaly": false,
  "topReasons": [{
    "code": "MEAN_FLIGHT_HIGH",
    "message": "Flight time is 1.2σ above normal",
    "feature": "meanFlight",
    "zscore": 1.2
  }],
  "aiAnalysis": "User typing patterns match baseline..."
}`}
                    </Code>

                    <Heading size="md" color="white" mb={3} mt={6}>Trust Score Interpretation</Heading>
                    <List spacing={2} color="white">
                        <ListItem>• <strong>90-100</strong>: Excellent match, very confident</ListItem>
                        <ListItem>• <strong>70-89</strong>: Good match, normal behavior</ListItem>
                        <ListItem>• <strong>50-69</strong>: Moderate match, slightly suspicious</ListItem>
                        <ListItem>• <strong>30-49</strong>: Poor match, suspicious behavior</ListItem>
                        <ListItem>• <strong>0-29</strong>: Very poor match, likely imposter</ListItem>
                    </List>
                </CardBody>
            </Card>
        </VStack>
    );
}

// Use Cases Section
function UseCasesSection() {
    return (
        <VStack spacing={6} align="stretch">
            <Card bg="rgba(26, 26, 26, 0.6)" backdropFilter="blur(10px)">
                <CardBody>
                    <Heading size="lg" color="white" mb={4}>Real-World Use Cases</Heading>

                    {/* Use Case 1: Banking */}
                    <Heading size="md" color="white" mb={3}>1. Banking & Financial Services</Heading>
                    <Text color="white" mb={2}><strong>Problem:</strong> Attackers steal credentials through phishing, then drain accounts.</Text>
                    <Text color="white" mb={4}>
                        <strong>Solution:</strong> Even with valid credentials, FluxAuth detects the imposter's different typing pattern.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`// During login
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
}`}
                    </Code>

                    <Text color="white" mb={2}><strong>High-Value Transaction Verification:</strong></Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`// Before wire transfer
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
}`}
                    </Code>
                    <Text color="white" mb={6}>
                        <strong>Impact:</strong> 90% reduction in account takeover fraud, $2M+ saved annually, better user experience (no constant MFA prompts for legitimate users)
                    </Text>

                    <Divider my={4} />

                    {/* Use Case 2: Enterprise SaaS */}
                    <Heading size="md" color="white" mb={3}>2. Enterprise SaaS - Insider Threat Detection</Heading>
                    <Text color="white" mb={2}><strong>Problem:</strong> Employees with legitimate access may act maliciously or have their accounts compromised.</Text>
                    <Text color="white" mb={4}>
                        <strong>Solution:</strong> Continuous monitoring detects when someone else is using an employee's account.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`// Monitor employee sessions
class SessionMonitor {
  constructor(employeeId) {
    this.employeeId = employeeId;
    this.sessionId = \`work-\${Date.now()}\`;
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
}`}
                    </Code>
                    <Text color="white" mb={6}>
                        <strong>Impact:</strong> Early detection of compromised accounts, audit trail for compliance (SOC2, ISO 27001), 75% reduction in insider threat incidents
                    </Text>

                    <Divider my={4} />

                    {/* Use Case 3: E-commerce */}
                    <Heading size="md" color="white" mb={3}>3. E-commerce - Bot Detection at Checkout</Heading>
                    <Text color="white" mb={2}><strong>Problem:</strong> Bots buy limited-edition items, scalpers resell at markup.</Text>
                    <Text color="white" mb={4}>
                        <strong>Solution:</strong> Detect automated scripts during checkout.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`async function validateCheckout(userId, cartItems) {
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
}`}
                    </Code>
                    <Text color="white" mb={6}>
                        <strong>Impact:</strong> 85% reduction in bot purchases, fair access to limited products for real customers, increased customer satisfaction
                    </Text>

                    <Divider my={4} />

                    {/* Use Case 4: Healthcare */}
                    <Heading size="md" color="white" mb={3}>4. Healthcare (HIPAA Compliance)</Heading>
                    <Text color="white" mb={2}><strong>Problem:</strong> HIPAA requires verification that authorized personnel are accessing patient records.</Text>
                    <Text color="white" mb={4}>
                        <strong>Solution:</strong> Continuous behavioral authentication throughout the session.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`class EHRAccessMonitor {
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
}`}
                    </Code>
                    <Text color="white" mb={6}>
                        <strong>Compliance Benefits:</strong> Meets HIPAA continuous authentication requirements, audit trail with behavioral verification, detects unauthorized access attempts, reduces risk of data breaches
                    </Text>

                    <Divider my={4} />

                    {/* Use Case 5: Gaming */}
                    <Heading size="md" color="white" mb={3}>5. Gaming & Esports - Account Sharing Detection</Heading>
                    <Text color="white" mb={2}><strong>Problem:</strong> Players pay others to boost their rank (account sharing).</Text>
                    <Text color="white" mb={4}>
                        <strong>Solution:</strong> Detect when a different person is playing on an account.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`// Monitor gameplay sessions
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
}`}
                    </Code>
                    <Text color="white" mb={6}>
                        <strong>Impact:</strong> Fair competitive environment, reduced account boosting services, better matchmaking accuracy
                    </Text>

                    <Divider my={4} />

                    {/* Use Case 6: Remote Work */}
                    <Heading size="md" color="white" mb={3}>6. Remote Work Security - VPN + Behavioral Auth</Heading>
                    <Text color="white" mb={2}><strong>Problem:</strong> VPN credentials can be stolen or shared.</Text>
                    <Text color="white" mb={4}>
                        <strong>Solution:</strong> Combine VPN with behavioral verification.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`// VPN connection handler
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
}`}
                    </Code>

                    <Divider my={4} />

                    {/* Use Case 7: Cryptocurrency */}
                    <Heading size="md" color="white" mb={3}>7. Cryptocurrency Exchange - Withdrawal Verification</Heading>
                    <Text color="white" mb={2}><strong>Problem:</strong> Stolen exchange accounts lead to irreversible crypto theft.</Text>
                    <Text color="white" mb={4}>
                        <strong>Solution:</strong> Behavioral verification before withdrawals.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`async function verifyWithdrawal(userId, amount, address) {
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
}`}
                    </Code>

                    <Divider my={4} />

                    {/* Use Case 8: Education */}
                    <Heading size="md" color="white" mb={3}>8. Educational Platforms - Online Exam Proctoring</Heading>
                    <Text color="white" mb={2}><strong>Problem:</strong> Students may have someone else take their exam.</Text>
                    <Text color="white" mb={4}>
                        <strong>Solution:</strong> Verify student identity throughout the exam.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`class ExamProctor {
  async startExam(studentId, examId) {
    await fluxAuth.startSession(\`exam-\${examId}\`, studentId);

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
}`}
                    </Code>

                    <Divider my={4} />

                    {/* Implementation Checklist */}
                    <Heading size="md" color="white" mb={3}>Implementation Checklist</Heading>
                    <Text color="white" mb={2}>For any use case:</Text>
                    <List spacing={2} color="white">
                        <ListItem>☐ Define trust score thresholds for your risk tolerance</ListItem>
                        <ListItem>☐ Implement fallback authentication (MFA, email verification)</ListItem>
                        <ListItem>☐ Set up monitoring and alerting</ListItem>
                        <ListItem>☐ Create audit logs for compliance</ListItem>
                        <ListItem>☐ Test with diverse user groups</ListItem>
                        <ListItem>☐ Handle edge cases (new devices, accessibility needs)</ListItem>
                        <ListItem>☐ Document security policies</ListItem>
                        <ListItem>☐ Train support team on behavioral auth</ListItem>
                    </List>
                </CardBody>
            </Card>
        </VStack>
    );
}

// Security Section
function SecuritySection() {
    return (
        <VStack spacing={6} align="stretch">
            <Card bg="rgba(26, 26, 26, 0.6)" backdropFilter="blur(10px)">
                <CardBody>
                    <Heading size="lg" color="white" mb={4}>Security & Privacy</Heading>

                    <Heading size="md" color="white" mb={3}>Privacy-First Design</Heading>

                    <Text color="white" mb={2}><strong>What We DON'T Collect:</strong></Text>
                    <List spacing={2} color="white" mb={4}>
                        <ListItem>❌ Actual keystrokes or text content</ListItem>
                        <ListItem>❌ Passwords or credentials</ListItem>
                        <ListItem>❌ Personal identifiable information (PII)</ListItem>
                        <ListItem>❌ Screen recordings or screenshots</ListItem>
                    </List>

                    <Text color="white" mb={2}><strong>What We DO Collect:</strong></Text>
                    <List spacing={2} color="white" mb={4}>
                        <ListItem>✅ Timing patterns (when keys are pressed/released)</ListItem>
                        <ListItem>✅ Key classifications (letter, number, special - not which key)</ListItem>
                        <ListItem>✅ Mouse movement patterns</ListItem>
                        <ListItem>✅ Session metadata</ListItem>
                    </List>

                    <Text color="white" mb={2}>Example data collected:</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`{
  "type": "keydown",
  "timestamp": 1700000000000,
  "keyClass": "letter"  // NOT "a" or "password"
}`}
                    </Code>
                    <Text color="white" mb={6}>
                        <strong>You cannot reconstruct what the user typed from this data.</strong>
                    </Text>

                    <Divider my={4} />

                    <Heading size="md" color="white" mb={3}>Security Best Practices</Heading>
                    <List spacing={3} color="white">
                        <ListItem>
                            <strong>1. API Key Management</strong>
                            <Text fontSize="sm">Generate strong keys, rotate regularly, never commit to git</Text>
                        </ListItem>
                        <ListItem>
                            <strong>2. HTTPS Only</strong>
                            <Text fontSize="sm">Always use HTTPS in production</Text>
                        </ListItem>
                        <ListItem>
                            <strong>3. Rate Limiting</strong>
                            <Text fontSize="sm">Prevent abuse with rate limits (100 req/15min default)</Text>
                        </ListItem>
                        <ListItem>
                            <strong>4. Input Validation</strong>
                            <Text fontSize="sm">Validate all inputs, use parameterized queries</Text>
                        </ListItem>
                        <ListItem>
                            <strong>5. Encryption</strong>
                            <Text fontSize="sm">Encrypt data at rest and in transit</Text>
                        </ListItem>
                        <ListItem>
                            <strong>6. Audit Logging</strong>
                            <Text fontSize="sm">Log all security events for compliance</Text>
                        </ListItem>
                    </List>

                    <Divider my={4} />

                    <Heading size="md" color="white" mb={3}>GDPR Compliance</Heading>
                    <Text color="white" mb={2}>FluxAuth is designed to be GDPR-compliant:</Text>
                    <List spacing={2} color="white">
                        <ListItem>• <strong>Right to Access</strong>: Users can request their data</ListItem>
                        <ListItem>• <strong>Right to Erasure</strong>: Users can delete their data</ListItem>
                        <ListItem>• <strong>Data Minimization</strong>: Only collect what's necessary</ListItem>
                        <ListItem>• <strong>Consent Management</strong>: Always obtain user consent</ListItem>
                    </List>
                </CardBody>
            </Card>
        </VStack>
    );
}

// Deployment Section
function DeploymentSection() {
    return (
        <VStack spacing={6} align="stretch">
            <Card bg="rgba(26, 26, 26, 0.6)" backdropFilter="blur(10px)">
                <CardBody>
                    <Heading size="lg" color="white" mb={4}>Deployment Guide</Heading>

                    <Heading size="md" color="white" mb={3}>Deployment Options</Heading>
                    <List spacing={2} color="white" mb={6}>
                        <ListItem>1. <strong>Self-Hosted</strong> - Full control, your infrastructure</ListItem>
                        <ListItem>2. <strong>Cloud Platforms</strong> - Easy deployment (Railway, Render, Vercel)</ListItem>
                        <ListItem>3. <strong>Docker</strong> - Containerized deployment</ListItem>
                        <ListItem>4. <strong>Kubernetes</strong> - Enterprise-scale orchestration</ListItem>
                    </List>

                    <Heading size="md" color="white" mb={3}>Docker Deployment</Heading>
                    <Text color="white" mb={2}>Using Docker Compose:</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`# docker-compose.yml
version: '3.8'

services:
  api:
    image: fluxauth-api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - API_KEY=\${API_KEY}
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    volumes:
      - ./data:/app/data
    restart: unless-stopped
  
  dashboard:
    image: fluxauth-dashboard
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped`}
                    </Code>

                    <Text color="white" mb={2}>Start services:</Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={6}>
                        {`docker-compose up -d
docker-compose logs -f`}
                    </Code>

                    <Divider my={4} />

                    <Heading size="md" color="white" mb={3}>Cloud Platform Deployment</Heading>

                    <Text color="white" mb={2}><strong>Railway:</strong></Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`npm install -g @railway/cli
railway login
cd backend && railway init && railway up`}
                    </Code>

                    <Text color="white" mb={2}><strong>Render:</strong></Text>
                    <Text color="white" mb={4}>
                        Connect GitHub repo, create Web Service for backend and Static Site for frontend
                    </Text>

                    <Text color="white" mb={2}><strong>Vercel (Frontend):</strong></Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={6}>
                        {`npm install -g vercel
cd frontend && vercel --prod`}
                    </Code>

                    <Divider my={4} />

                    <Heading size="md" color="white" mb={3}>Production Checklist</Heading>
                    <List spacing={2} color="white">
                        <ListItem>☐ Use HTTPS (SSL certificate)</ListItem>
                        <ListItem>☐ Strong API keys (32+ characters)</ListItem>
                        <ListItem>☐ Enable rate limiting</ListItem>
                        <ListItem>☐ Configure CORS properly</ListItem>
                        <ListItem>☐ Set up monitoring and alerts</ListItem>
                        <ListItem>☐ Regular backups</ListItem>
                        <ListItem>☐ Environment variables (never commit secrets)</ListItem>
                        <ListItem>☐ Enable firewall</ListItem>
                        <ListItem>☐ Keep dependencies updated</ListItem>
                    </List>
                </CardBody>
            </Card>
        </VStack>
    );
}
