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
import { API_CONFIG } from '../config';

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

    // Load demo data immediately, then try to fetch real data
    useEffect(() => {
        const loadDemoData = () => {
            const demoSessions = [
                {
                    sessionId: 'demo-001',
                    userId: 'demo-alice',
                    trustScore: 92,
                    status: 'verified' as const,
                    startTime: new Date(Date.now() - 120000),
                    keystrokes: 234,
                    mouseEvents: 89
                },
                {
                    sessionId: 'demo-002',
                    userId: 'demo-bob',
                    trustScore: 45,
                    status: 'suspicious' as const,
                    startTime: new Date(Date.now() - 45000),
                    keystrokes: 89,
                    mouseEvents: 12
                },
                {
                    sessionId: 'demo-003',
                    userId: 'demo-charlie',
                    trustScore: 88,
                    status: 'verified' as const,
                    startTime: new Date(Date.now() - 30000),
                    keystrokes: 156,
                    mouseEvents: 67
                }
            ];
            setSessions(demoSessions);
            setStats({
                activeSessions: demoSessions.length,
                avgTrustScore: Math.round(demoSessions.reduce((sum, s) => sum + s.trustScore, 0) / demoSessions.length),
                anomaliesDetected: demoSessions.filter(s => s.status === 'suspicious').length,
                totalEvents: demoSessions.reduce((sum, s) => sum + s.keystrokes + s.mouseEvents, 0)
            });
            setIsLoading(false);
        };

        // Load demo data immediately
        loadDemoData();
        setUseDemoData(true);

        // Try to fetch real data (but don't block on it)
        const fetchSessions = async () => {
            try {
                // First try backend
                const response = await fetch(`${API_CONFIG.API_URL}/sessions/recent`, {
                    headers: {
                        'x-api-key': API_CONFIG.API_KEY
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.sessions && data.sessions.length > 0) {
                        const mappedSessions = data.sessions.map((s: any) => ({
                            sessionId: s.session_id,
                            userId: s.user_id || 'anonymous',
                            trustScore: s.trust_score || 0,
                            status: s.is_anomaly ? 'suspicious' as const : 'verified' as const,
                            startTime: new Date(s.created_at),
                            keystrokes: s.events ? JSON.parse(s.events).filter((e: any) => e.type.includes('key')).length : 0,
                            mouseEvents: s.events ? JSON.parse(s.events).filter((e: any) => e.type === 'mousemove').length : 0
                        }));
                        setSessions(mappedSessions);
                        setUseDemoData(false);
                        
                        // Calculate real stats from sessions
                        const totalEvents = mappedSessions.reduce((sum: number, s: any) => sum + s.keystrokes + s.mouseEvents, 0);
                        const avgTrustScore = mappedSessions.length > 0 
                            ? mappedSessions.reduce((sum: number, s: any) => sum + s.trustScore, 0) / mappedSessions.length 
                            : 0;
                        const anomaliesDetected = mappedSessions.filter((s: any) => s.status === 'suspicious').length;
                        
                        setStats({
                            activeSessions: mappedSessions.length,
                            avgTrustScore: Math.round(avgTrustScore),
                            anomaliesDetected,
                            totalEvents
                        });
                        return;
                    }
                }
                
                // Fallback: Check localStorage for local sessions
                const localSessions: LiveSession[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('fluxauth_session_')) {
                        try {
                            const sessionData = JSON.parse(localStorage.getItem(key) || '{}');
                            if (sessionData.sessionId && sessionData.trustScore !== undefined) {
                                localSessions.push({
                                    sessionId: sessionData.sessionId,
                                    userId: sessionData.userId || 'local-user',
                                    trustScore: sessionData.trustScore,
                                    status: sessionData.isAnomaly ? 'suspicious' as const : 'verified' as const,
                                    startTime: new Date(sessionData.timestamp || Date.now()),
                                    keystrokes: sessionData.keystrokes || 0,
                                    mouseEvents: sessionData.mouseEvents || 0
                                });
                            }
                        } catch (e) {
                            // Skip invalid entries
                        }
                    }
                }
                
                if (localSessions.length > 0) {
                    setSessions(localSessions);
                    setUseDemoData(false);
                    const totalEvents = localSessions.reduce((sum, s) => sum + s.keystrokes + s.mouseEvents, 0);
                    const avgTrustScore = localSessions.reduce((sum, s) => sum + s.trustScore, 0) / localSessions.length;
                    const anomaliesDetected = localSessions.filter(s => s.status === 'suspicious').length;
                    setStats({
                        activeSessions: localSessions.length,
                        avgTrustScore: Math.round(avgTrustScore),
                        anomaliesDetected,
                        totalEvents
                    });
                }
            } catch (error) {
                // Silently fail - demo data is already loaded
                console.log('Using demo data (backend unavailable)');
            }
        };

        // Try to fetch real data in background (non-blocking)
        fetchSessions();
        const interval = setInterval(fetchSessions, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    const [stats, setStats] = useState({
        activeSessions: 0,
        avgTrustScore: 0,
        anomaliesDetected: 0,
        totalEvents: 0
    });

    // Only simulate live updates in demo mode
    useEffect(() => {
        if (!useDemoData) return; // Don't simulate if using real data
        
        const interval = setInterval(() => {
            setSessions(prev => prev.map(s => ({
                ...s,
                keystrokes: s.keystrokes + Math.floor(Math.random() * 5),
                mouseEvents: s.mouseEvents + Math.floor(Math.random() * 3),
                trustScore: Math.max(0, Math.min(100, s.trustScore + (Math.random() - 0.5) * 2))
            })));
        }, 2000);

        return () => clearInterval(interval);
    }, [useDemoData]);

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
                    <Text fontSize="sm" color="brand.400" mt={1}>
                        ⚠️ No real sessions yet - showing demo data. Complete enrollment to see real data!
                    </Text>
                )}
            </Box>

            {/* Stats Grid */}
            <Grid templateColumns="repeat(4, 1fr)" gap={6} w="full">
                <GridItem>
                    <Card bg="rgba(0, 0, 0, 0.3)" borderLeft="4px" borderColor="brand.400">
                        <CardBody>
                            <Stat>
                                <StatLabel color="white">Active Sessions</StatLabel>
                                <StatNumber color="white">{stats.activeSessions}</StatNumber>
                                <StatHelpText color="white">
                                    <StatArrow type="increase" />
                                    12% from last hour
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card bg="rgba(0, 0, 0, 0.3)" borderLeft="4px" borderColor="blue.400">
                        <CardBody>
                            <Stat>
                                <StatLabel color="white">Avg Trust Score</StatLabel>
                                <StatNumber color="white">{stats.avgTrustScore}</StatNumber>
                                <StatHelpText color="white">
                                    <StatArrow type="increase" />
                                    5% improvement
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card bg="rgba(220, 38, 38, 0.2)" borderLeft="4px" borderColor="red.500">
                        <CardBody>
                            <Stat>
                                <StatLabel color="white">Anomalies</StatLabel>
                                <StatNumber color="white">{stats.anomaliesDetected}</StatNumber>
                                <StatHelpText color="white">Last 5 minutes</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card bg="rgba(0, 0, 0, 0.3)" borderLeft="4px" borderColor="purple.500">
                        <CardBody>
                            <Stat>
                                <StatLabel color="white">Total Events</StatLabel>
                                <StatNumber color="white">{stats.totalEvents}</StatNumber>
                                <StatHelpText color="white">Captured today</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            {/* Live Sessions Table */}
            <Card w="full" bg="rgba(0, 0, 0, 0.3)" borderColor="rgba(255, 255, 255, 0.1)">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Live Sessions</Heading>
                    <Table variant="simple" size="sm" colorScheme="whiteAlpha">
                        <Thead>
                            <Tr>
                                <Th color="white">Session ID</Th>
                                <Th color="white">User</Th>
                                <Th color="white">Trust Score</Th>
                                <Th color="white">Status</Th>
                                <Th color="white">Duration</Th>
                                <Th color="white">Events</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sessions.map((session) => (
                                <Tr key={session.sessionId}>
                                    <Td fontFamily="mono" fontSize="xs" color="white">{session.sessionId}</Td>
                                    <Td color="white">{session.userId}</Td>
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
                                    <Td fontSize="sm" color="white">
                                        {Math.floor((Date.now() - session.startTime.getTime()) / 1000)}s
                                    </Td>
                                    <Td fontSize="sm" color="white">
                                        {session.keystrokes}k / {session.mouseEvents}m
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </CardBody>
            </Card>

            {useDemoData && (
                <Card w="full" bg="rgba(0, 0, 0, 0.3)" borderColor="rgba(255, 255, 255, 0.1)">
                    <CardBody>
                        <Text fontSize="sm" color="white">
                            <strong>Demo Mode:</strong> No real sessions found. Complete enrollment and authentication to see live data.
                        </Text>
                    </CardBody>
                </Card>
            )}
        </VStack>
    );
}
