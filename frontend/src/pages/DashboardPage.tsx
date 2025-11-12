import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Alert,
    AlertIcon,
    Button
} from '@chakra-ui/react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { API_CONFIG } from '../config';
import TrustScoreHistory from '../components/TrustScoreHistory';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Session {
    sessionId: string;
    userId: string;
    trustScore: number;
    isAnomaly: boolean;
    timestamp: string;
}

export default function DashboardPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await fetch('/api/sessions/recent?limit=20', {
                    headers: {
                        'x-api-key': API_CONFIG.API_KEY
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const formattedSessions = data.sessions.map((s: any) => ({
                        sessionId: s.session_id,
                        userId: s.user_id || 'anonymous',
                        trustScore: s.trust_score || 0,
                        isAnomaly: s.is_anomaly === 1,
                        timestamp: new Date(s.scored_at || s.created_at).toISOString()
                    }));

                    if (formattedSessions.length > 0) {
                        setSessions(formattedSessions);
                    } else {
                        // Load demo data if no real sessions
                        setSessions([
                            {
                                sessionId: 'demo-1',
                                userId: 'demo-user',
                                trustScore: 88,
                                isAnomaly: false,
                                timestamp: new Date().toISOString()
                            },
                            {
                                sessionId: 'demo-2',
                                userId: 'demo-user',
                                trustScore: 35,
                                isAnomaly: true,
                                timestamp: new Date(Date.now() - 300000).toISOString()
                            }
                        ]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
                // Load demo data on error
                setSessions([
                    {
                        sessionId: 'demo-1',
                        userId: 'demo-user',
                        trustScore: 88,
                        isAnomaly: false,
                        timestamp: new Date().toISOString()
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    useEffect(() => {
        if (sessions.length > 0) {
            setSelectedSession(sessions[0]);
        }
    }, [sessions]);

    // Sample z-score data for visualization
    const chartData = {
        labels: ['Flight Time', 'Hold Time', 'Backspace Rate', 'Bigram', 'Total Keys', 'Mouse Speed'],
        datasets: [
            {
                label: 'Z-Score',
                data: selectedSession?.isAnomaly
                    ? [2.8, 1.5, 3.2, 2.1, 1.8, 2.5]
                    : [0.3, -0.1, 0.5, 0.2, -0.3, 0.4],
                backgroundColor: (context: any) => {
                    const value = context.parsed.y;
                    return Math.abs(value) > 2.5 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)';
                },
                borderColor: (context: any) => {
                    const value = context.parsed.y;
                    return Math.abs(value) > 2.5 ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)';
                },
                borderWidth: 2
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Feature Z-Scores (Standard Deviations from Baseline)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Z-Score (σ)'
                },
                grid: {
                    color: (context: any) => {
                        if (context.tick.value === 2.5 || context.tick.value === -2.5) {
                            return 'rgba(239, 68, 68, 0.3)';
                        }
                        return 'rgba(0, 0, 0, 0.1)';
                    }
                }
            }
        }
    };

    return (
        <VStack spacing={6} maxW="6xl" mx="auto">
            <Heading size="lg" color="white">Bot/Fraud Detection Dashboard</Heading>
            <Text color="white" textAlign="center">
                Detects non-human or repetitive behavior using pattern heuristics and anomaly thresholds
            </Text>
            <Badge colorScheme="green" fontSize="sm">✅ Real Bot Detection Active</Badge>

            <Alert status="info" borderRadius="md" color="blue.900">
                <AlertIcon />
                This is a demo dashboard with sample data. In production, this would show real session history.
            </Alert>

            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4} color="white">
                        Recent Sessions
                    </Heading>
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Session ID</Th>
                                <Th>User ID</Th>
                                <Th>Trust Score</Th>
                                <Th>Status</Th>
                                <Th>Timestamp</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {sessions.map((session) => (
                                <Tr
                                    key={session.sessionId}
                                    onClick={() => setSelectedSession(session)}
                                    cursor="pointer"
                                    _hover={{ bg: 'gray.50' }}
                                    bg={selectedSession?.sessionId === session.sessionId ? 'blue.50' : undefined}
                                >
                                    <Td fontFamily="mono" fontSize="sm">
                                        {session.sessionId}
                                    </Td>
                                    <Td>{session.userId}</Td>
                                    <Td>
                                        <Badge colorScheme={session.trustScore > 70 ? 'green' : 'red'}>
                                            {session.trustScore}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <HStack>
                                            <Badge colorScheme={session.isAnomaly ? 'red' : 'green'}>
                                                {session.isAnomaly ? 'Anomaly' : 'Verified'}
                                            </Badge>
                                            {(session as any).isBot && (
                                                <Badge colorScheme="orange">Bot</Badge>
                                            )}
                                        </HStack>
                                    </Td>
                                    <Td fontSize="sm" color="white">
                                        {new Date(session.timestamp).toLocaleString()}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </CardBody>
            </Card>

            {selectedSession && (
                <Card w="full">
                    <CardBody>
                        <Heading size="md" mb={4}>
                            Session Analysis: {selectedSession.sessionId}
                        </Heading>
                        <Box h="400px">
                            <Bar data={chartData} options={chartOptions} />
                        </Box>
                        <Text fontSize="sm" color="white" mt={4}>
                            Features beyond ±2.5σ (red line) are flagged as anomalous. This session shows{' '}
                            {selectedSession.isAnomaly ? 'multiple anomalous features' : 'normal behavioral patterns'}.
                        </Text>
                    </CardBody>
                </Card>
            )}

            {/* Trust Score History */}
            <Card w="full">
                <CardBody>
                    <TrustScoreHistory />
                </CardBody>
            </Card>

            {/* AI Threat Report */}
            <Card w="full" bg="brand.800" borderTop="4px" borderColor="purple.500">
                <CardBody>
                    <HStack justify="space-between" mb={4}>
                        <VStack align="start">
                            <Heading size="md" color="white">🤖 AI Threat Analysis</Heading>
                            <Badge colorScheme="purple">Powered by Gemini</Badge>
                        </VStack>
                        <Button
                            size="sm"
                            colorScheme="purple"
                            onClick={async () => {
                                try {
                                    const response = await fetch('/api/ai/threat-report', {
                                        headers: { 'x-api-key': API_CONFIG.API_KEY }
                                    });
                                    const data = await response.json();
                                    alert(data.report || 'No data available yet');
                                } catch (error) {
                                    alert('AI analysis unavailable');
                                }
                            }}
                        >
                            Generate Report
                        </Button>
                    </HStack>
                    <Text fontSize="sm" color="white">
                        Click "Generate Report" to get an AI-powered security analysis of recent authentication patterns.
                        The AI will identify threats, unusual patterns, and provide actionable recommendations.
                    </Text>
                </CardBody>
            </Card>
        </VStack>
    );
}
