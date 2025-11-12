import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Badge,
    Grid,
    GridItem,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Progress,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td
} from '@chakra-ui/react';

interface LiveSession {
    sessionId: string;
    userId: string;
    trustScore: number;
    status: 'active' | 'suspicious' | 'verified';
    startTime: Date;
    keystrokes: number;
    mouseEvents: number;
}

export default function LiveMonitorPage() {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [useDemoData, setUseDemoData] = useState(false);

    // Fetch real sessions from backend
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch('/api/sessions/recent', {
                    headers: {
                        'x-api-key': 'dev_key_12345'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.sessions && data.sessions.length > 0) {
                        setSessions(data.sessions.map((s: any) => ({
                            sessionId: s.session_id,
                            userId: s.user_id || 'anonymous',
                            trustScore: s.trust_score || 0,
                            status: s.is_anomaly ? 'suspicious' : 'verified',
                            startTime: new Date(s.created_at),
                            keystrokes: s.events ? JSON.parse(s.events).filter((e: any) => e.type.includes('key')).length : 0,
                            mouseEvents: s.events ? JSON.parse(s.events).filter((e: any) => e.type === 'mousemove').length : 0
                        })));
                        setUseDemoData(false);
                    } else {
                        // No real data, use demo
                        setUseDemoData(true);
                        loadDemoData();
                    }
                } else {
                    // Backend error, use demo
                    setUseDemoData(true);
                    loadDemoData();
                }
            } catch (error) {
                // Network error, use demo
                setUseDemoData(true);
                loadDemoData();
            } finally {
                setIsLoading(false);
            }
        };

        const loadDemoData = () => {
            setSessions([
                {
                    sessionId: 'demo-001',
                    userId: 'demo-alice',
                    trustScore: 92,
                    status: 'verified',
                    startTime: new Date(Date.now() - 120000),
                    keystrokes: 234,
                    mouseEvents: 89
                },
                {
                    sessionId: 'demo-002',
                    userId: 'demo-bob',
                    trustScore: 45,
                    status: 'suspicious',
                    startTime: new Date(Date.now() - 45000),
                    keystrokes: 89,
                    mouseEvents: 12
                }
            ]);
        };

        fetchSessions();
        const interval = setInterval(fetchSessions, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const [stats, setStats] = useState({
        activeSessions: 3,
        avgTrustScore: 75,
        anomaliesDetected: 1,
        totalEvents: 647
    });

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSessions(prev => prev.map(s => ({
                ...s,
                keystrokes: s.keystrokes + Math.floor(Math.random() * 5),
                mouseEvents: s.mouseEvents + Math.floor(Math.random() * 3),
                trustScore: Math.max(0, Math.min(100, s.trustScore + (Math.random() - 0.5) * 2))
            })));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <VStack spacing={6} maxW="7xl" mx="auto">
            <Box textAlign="center">
                <HStack justify="center" mb={2}>
                    <Heading size="lg" color="white">Real-Time Behavioral Monitor</Heading>
                    {useDemoData ? (
                        <Badge colorScheme="yellow" fontSize="sm">Demo Mode</Badge>
                    ) : (
                        <Badge colorScheme="green" fontSize="sm">Live Data</Badge>
                    )}
                </HStack>
                <Text color="white" mt={2}>
                    Live tracking of typing/mouse rhythm with trust meter updates
                </Text>
                {useDemoData && (
                    <Text fontSize="sm" color="orange.600" mt={1}>
                        ⚠️ No real sessions yet - showing demo data. Complete enrollment to see real data!
                    </Text>
                )}
            </Box>

            {/* Stats Grid */}
            <Grid templateColumns="repeat(4, 1fr)" gap={6} w="full">
                <GridItem>
                    <Card bg="brand.50" borderLeft="4px" borderColor="brand.400">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.800">Active Sessions</StatLabel>
                                <StatNumber color="gray.900">{stats.activeSessions}</StatNumber>
                                <StatHelpText color="gray.700">
                                    <StatArrow type="increase" />
                                    12% from last hour
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card bg="accent.50" borderLeft="4px" borderColor="accent.500">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.800">Avg Trust Score</StatLabel>
                                <StatNumber color="gray.900">{stats.avgTrustScore}</StatNumber>
                                <StatHelpText color="gray.700">
                                    <StatArrow type="increase" />
                                    5% improvement
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card bg="red.50" borderLeft="4px" borderColor="red.500">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.800">Anomalies</StatLabel>
                                <StatNumber color="gray.900">{stats.anomaliesDetected}</StatNumber>
                                <StatHelpText color="gray.700">Last 5 minutes</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card bg="purple.50" borderLeft="4px" borderColor="purple.500">
                        <CardBody>
                            <Stat>
                                <StatLabel color="gray.800">Total Events</StatLabel>
                                <StatNumber color="gray.900">{stats.totalEvents}</StatNumber>
                                <StatHelpText color="gray.700">Captured today</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            {/* Live Sessions Table */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Live Sessions</Heading>
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Session ID</Th>
                                <Th>User</Th>
                                <Th>Trust Score</Th>
                                <Th>Status</Th>
                                <Th>Duration</Th>
                                <Th>Events</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sessions.map((session) => (
                                <Tr key={session.sessionId}>
                                    <Td fontFamily="mono" fontSize="xs">{session.sessionId}</Td>
                                    <Td>{session.userId}</Td>
                                    <Td>
                                        <VStack align="start" spacing={1}>
                                            <HStack>
                                                <Text fontWeight="bold" color={
                                                    session.trustScore > 70 ? 'green.500' :
                                                        session.trustScore > 50 ? 'orange.500' : 'red.500'
                                                }>
                                                    {Math.round(session.trustScore)}
                                                </Text>
                                            </HStack>
                                            <Progress
                                                value={session.trustScore}
                                                size="xs"
                                                w="100px"
                                                colorScheme={
                                                    session.trustScore > 70 ? 'green' :
                                                        session.trustScore > 50 ? 'orange' : 'red'
                                                }
                                            />
                                        </VStack>
                                    </Td>
                                    <Td>
                                        <Badge
                                            colorScheme={
                                                session.status === 'verified' ? 'green' :
                                                    session.status === 'suspicious' ? 'red' : 'blue'
                                            }
                                        >
                                            {session.status}
                                        </Badge>
                                    </Td>
                                    <Td fontSize="sm">
                                        {Math.floor((Date.now() - session.startTime.getTime()) / 1000)}s
                                    </Td>
                                    <Td fontSize="sm">
                                        {session.keystrokes}k / {session.mouseEvents}m
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </CardBody>
            </Card>

            <Card w="full" bg="blue.50">
                <CardBody>
                    <Text fontSize="sm" color="gray.700">
                        <strong>Demo Mode:</strong> This dashboard shows simulated real-time data.
                        In production, it would connect via WebSocket to display actual user sessions.
                    </Text>
                </CardBody>
            </Card>
        </VStack>
    );
}
