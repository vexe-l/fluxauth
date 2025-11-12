import {
    Box,
    Heading,
    Text,
    VStack,
    Card,
    CardBody,
    Code,
    Divider,
    List,
    ListItem,
    ListIcon
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

export default function DocsPage() {
    return (
        <VStack spacing={6} maxW="4xl" mx="auto" align="stretch">
            <Heading size="lg">Developer Documentation</Heading>
            <Text color="white">
                Quick start guide for integrating BIaaS into your application.
            </Text>

            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>
                        SDK Installation
                    </Heading>
                    <Text mb={3}>
                        Copy the SDK module into your project:
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm">
                        {`import { BehaviorSDK } from './sdk/browser';

const sdk = new BehaviorSDK({
  apiUrl: 'https://your-api.com/api',
  apiKey: 'your-api-key',
  batchInterval: 5000,
  enableMouse: true
});`}
                    </Code>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>
                        Basic Usage
                    </Heading>

                    <Heading size="sm" mb={2}>
                        1. Start a Session
                    </Heading>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`// Start capturing behavioral data
await sdk.startSession('session-123', 'user-456');

// User types naturally...

// Stop capturing
sdk.endSession();`}
                    </Code>

                    <Heading size="sm" mb={2}>
                        2. Enroll a User
                    </Heading>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`// Collect 4+ typing samples
const sessions = [
  { sessionId: 'enroll-1', events: sdk.getEvents() },
  { sessionId: 'enroll-2', events: sdk.getEvents() },
  { sessionId: 'enroll-3', events: sdk.getEvents() },
  { sessionId: 'enroll-4', events: sdk.getEvents() }
];

await sdk.enroll('user-456', sessions);`}
                    </Code>

                    <Heading size="sm" mb={2}>
                        3. Score an Authentication Attempt
                    </Heading>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm">
                        {`const result = await sdk.score(
  'user-456',
  'auth-session-789',
  events
);

console.log(result.trustScore);  // 0-100
console.log(result.isAnomaly);   // boolean
console.log(result.topReasons);  // Explanation`}
                    </Code>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>
                        API Reference
                    </Heading>

                    <Heading size="sm" mb={2}>
                        POST /api/session/start
                    </Heading>
                    <Text fontSize="sm" color="white" mb={2}>
                        Register a new behavioral session.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`curl -X POST https://api.example.com/api/session/start \\
  -H "x-api-key: your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "sessionId": "session-123",
    "userId": "user-456"
  }'`}
                    </Code>

                    <Divider my={4} />

                    <Heading size="sm" mb={2}>
                        POST /api/session/score
                    </Heading>
                    <Text fontSize="sm" color="white" mb={2}>
                        Score a behavioral session against user profile.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm" mb={4}>
                        {`curl -X POST https://api.example.com/api/session/score \\
  -H "x-api-key: your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "user-456",
    "sessionId": "session-123",
    "events": [
      {
        "type": "keydown",
        "timestamp": 1234567890,
        "keyClass": "letter"
      }
    ]
  }'`}
                    </Code>

                    <Divider my={4} />

                    <Heading size="sm" mb={2}>
                        POST /api/enroll
                    </Heading>
                    <Text fontSize="sm" color="white" mb={2}>
                        Enroll a user with behavioral samples.
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm">
                        {`curl -X POST https://api.example.com/api/enroll \\
  -H "x-api-key: your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "user-456",
    "sessions": [
      {
        "sessionId": "enroll-1",
        "events": [...]
      }
    ]
  }'`}
                    </Code>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>
                        Response Format
                    </Heading>
                    <Text fontSize="sm" color="white" mb={3}>
                        Score endpoint returns:
                    </Text>
                    <Code display="block" p={4} borderRadius="md" whiteSpace="pre" fontSize="sm">
                        {`{
  "trustScore": 88,
  "isAnomaly": false,
  "topReasons": [
    {
      "code": "MEAN_FLIGHT_HIGH",
      "message": "Flight time is 1.2σ above normal",
      "feature": "meanFlight",
      "zscore": 1.2
    }
  ]
}`}
                    </Code>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>
                        Best Practices
                    </Heading>
                    <List spacing={3}>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Obtain consent</strong> before capturing behavioral data
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Use HTTPS</strong> for all API communication
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Rotate API keys</strong> regularly
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Handle errors gracefully</strong> and provide fallback authentication
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Monitor trust scores</strong> and adjust thresholds based on your use case
                        </ListItem>
                        <ListItem>
                            <ListIcon as={CheckCircleIcon} color="green.500" />
                            <strong>Test thoroughly</strong> with diverse user populations
                        </ListItem>
                    </List>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <Heading size="md" mb={4}>
                        Security Notes
                    </Heading>
                    <Text fontSize="sm" color="white" mb={3}>
                        This is a Phase-1 prototype. Before production deployment:
                    </Text>
                    <List spacing={2} fontSize="sm">
                        <ListItem>• Rotate all API keys and use secure key management</ListItem>
                        <ListItem>• Enable HTTPS/TLS for all endpoints</ListItem>
                        <ListItem>• Configure proper CORS policies</ListItem>
                        <ListItem>• Set up monitoring and alerting</ListItem>
                        <ListItem>• Review and harden rate limits</ListItem>
                        <ListItem>• Conduct security audit</ListItem>
                    </List>
                    <Text fontSize="sm" color="white" mt={3}>
                        See <Code>SECURITY.md</Code> for detailed security practices.
                    </Text>
                </CardBody>
            </Card>
        </VStack>
    );
}
