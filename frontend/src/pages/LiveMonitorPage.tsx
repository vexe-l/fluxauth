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
    const [sessions, setSessions] = useState<LiveSession[]>([
        {
            sessionId: 'sess-001',
            userId: 'user-alice',
            trustScore: 92,
            status: 'verified',
            startTime: new Date(Date.now() - 120000),
            keystrokes: 234,
            mouseEvents: 89
        },
        {
            sessionId: 'sess-002',
            userId: 'user-bob',
            trustScore: 45,
            status: 'suspicious',
            startTime: new Date(Date.now() - 45000),
            keystrokes: 89,
            mouseEvents: 12
        },
        {
            sessionId: 'sess-003',
            userId: 'user-charlie',
            trustScore: 88,
            status: 'active',
            startTime: new Date(Date.now() - 30000),
            keystrokes: 156,
            mouseEvents: 67
        }
    ]);

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
                <Heading size="lg" color="navy.500">Real-Time Behavioral Monitor</Heading>
                <Text color="gray.600" mt={2}>
                    Live tracking of typing/mouse rhythm with trust meter updates
                </Text>
            </Box>

            {/* Stats Grid */}
            <Grid templateColumns="repeat(4, 1fr)" gap={6} w="full">
                <GridItem>
                    <Card bg="brand.50" borderLeft="4px" borderColor="brand.400">
                        <CardBody>
                            <Stat>
                                <StatLabel color="navy.500">Active Sessions</StatLabel>
                                <StatNumber color="brand.500">{stats.activeSessions}</StatNumber>
                                <StatHelpText>
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
                                <StatLabel color="navy.500">Avg Trust Score</StatLabel>
                                <StatNumber color="accent.500">{stats.avgTrustScore}</StatNumber>
                                <StatHelpText>
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
                                <StatLabel color="navy.500">Anomalies</StatLabel>
                                <StatNumber color="red.500">{stats.anomaliesDetected}</StatNumber>
                                <StatHelpText>Last 5 minutes</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card bg="purple.50" borderLeft="4px" borderColor="purple.500">
                        <CardBody>
                            <Stat>
                                <StatLabel color="navy.500">Total Events</StatLabel>
                                <StatNumber color="purple.500">{stats.totalEvents}</StatNumber>
                                <StatHelpText>Captured today</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            {/* Live Sessions Table */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4} color="navy.500">Live Sessions</Heading>
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
                    <Text fontSize="sm" color="navy.500">
                        <strong>Demo Mode:</strong> This dashboard shows simulated real-time data.
                        In production, it would connect via WebSocket to display actual user sessions.
                    </Text>
                </CardBody>
            </Card>
        </VStack>
    );
}
