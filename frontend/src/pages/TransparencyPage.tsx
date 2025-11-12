import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    Card,
    CardBody,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    HStack,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Grid,
    GridItem,
    Icon,
    Tooltip,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

interface APICall {
    timestamp: number;
    endpoint: string;
    method: string;
    statusCode: number;
    duration: number;
    userId?: string;
}

interface ModelMetrics {
    totalSessions: number;
    totalAnomalies: number;
    avgLatency: number;
    uptime: number;
    tpr: number;
    fpr: number;
    accuracy: number;
    precision: number;
    recall: number;
}

export default function TransparencyPage() {
    const [apiCalls, setApiCalls] = useState<APICall[]>([]);
    const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
    const [uptimeFormatted, setUptimeFormatted] = useState('');

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            const [callsRes, metricsRes, uptimeRes] = await Promise.all([
                fetch('/api/metrics/calls'),
                fetch('/api/metrics/model'),
                fetch('/api/metrics/uptime')
            ]);

            const callsData = await callsRes.json();
            const metricsData = await metricsRes.json();
            const uptimeData = await uptimeRes.json();

            setApiCalls(callsData.calls || []);
            setModelMetrics(metricsData);
            setUptimeFormatted(uptimeData.uptimeFormatted);
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        }
    };

    return (
        <VStack spacing={6} maxW="6xl" mx="auto">
            <Box textAlign="center">
                <HStack justify="center" mb={2}>
                    <Heading size="lg" color="white">Transparency Dashboard</Heading>
                    <Badge colorScheme="green" fontSize="sm">Real Metrics</Badge>
                </HStack>
                <Text color="white">
                    Real-time system metrics and performance data (SDG 16: Accountability)
                </Text>
                <Text fontSize="sm" color="green.600" mt={1}>
                    ✅ Connected to real backend metrics service
                </Text>
            </Box>

            {/* Uptime & Performance Stats */}
            <Grid templateColumns="repeat(4, 1fr)" gap={4} w="full">
                <GridItem>
                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>System Uptime</StatLabel>
                                <StatNumber fontSize="lg">{uptimeFormatted}</StatNumber>
                                <StatHelpText>Since last restart</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Total Sessions</StatLabel>
                                <StatNumber>{modelMetrics?.totalSessions || 0}</StatNumber>
                                <StatHelpText>
                                    {modelMetrics?.totalAnomalies || 0} anomalies detected
                                </StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>Avg Latency</StatLabel>
                                <StatNumber>{modelMetrics?.avgLatency.toFixed(1) || 0}ms</StatNumber>
                                <StatHelpText>API response time</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>

                <GridItem>
                    <Card>
                        <CardBody>
                            <Stat>
                                <StatLabel>
                                    Accuracy{' '}
                                    <Tooltip label="Percentage of correct predictions">
                                        <Icon as={InfoIcon} boxSize={3} />
                                    </Tooltip>
                                </StatLabel>
                                <StatNumber>
                                    {modelMetrics ? (modelMetrics.accuracy * 100).toFixed(1) : 0}%
                                </StatNumber>
                                <StatHelpText>Model performance</StatHelpText>
                            </Stat>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>

            {/* Model Performance Metrics */}
            {modelMetrics && (
                <Card w="full">
                    <CardBody>
                        <Heading size="md" mb={4} color="white">Model Performance Metrics</Heading>
                        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                            <Box>
                                <Text fontSize="sm" color="white">True Positive Rate (TPR)</Text>
                                <Text fontSize="2xl" fontWeight="bold">
                                    {(modelMetrics.tpr * 100).toFixed(1)}%
                                </Text>
                                <Text fontSize="xs" color="white">Sensitivity / Recall</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" color="white">False Positive Rate (FPR)</Text>
                                <Text fontSize="2xl" fontWeight="bold">
                                    {(modelMetrics.fpr * 100).toFixed(1)}%
                                </Text>
                                <Text fontSize="xs" color="white">Type I Error</Text>
                            </Box>
                            <Box>
                                <Text fontSize="sm" color="white">Precision</Text>
                                <Text fontSize="2xl" fontWeight="bold">
                                    {(modelMetrics.precision * 100).toFixed(1)}%
                                </Text>
                                <Text fontSize="xs" color="white">Positive Predictive Value</Text>
                            </Box>
                        </Grid>
                    </CardBody>
                </Card>
            )}

            {/* Recent API Calls */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Recent API Activity</Heading>
                    <Text fontSize="sm" color="white" mb={4}>
                        Last 10 API calls (user IDs anonymized for privacy)
                    </Text>
                    <Table variant="simple" size="sm">
                        <Thead>
                            <Tr>
                                <Th>Timestamp</Th>
                                <Th>Endpoint</Th>
                                <Th>Method</Th>
                                <Th>Status</Th>
                                <Th>Duration</Th>
                                <Th>User</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {apiCalls.map((call, idx) => (
                                <Tr key={idx}>
                                    <Td fontSize="xs">
                                        {new Date(call.timestamp).toLocaleTimeString()}
                                    </Td>
                                    <Td fontFamily="mono" fontSize="xs">{call.endpoint}</Td>
                                    <Td>
                                        <Badge colorScheme={call.method === 'GET' ? 'blue' : 'green'}>
                                            {call.method}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={call.statusCode < 400 ? 'green' : 'red'}>
                                            {call.statusCode}
                                        </Badge>
                                    </Td>
                                    <Td>{call.duration}ms</Td>
                                    <Td fontSize="xs" color="white">{call.userId || '-'}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </CardBody>
            </Card>

            {/* Fairness Metrics by Cohort */}
            <Card w="full" bg="brand.800" borderTop="4px" borderColor="purple.500">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Fairness Metrics by Device Type</Heading>
                    <Text fontSize="sm" color="white" mb={4}>
                        Detection performance across different user cohorts to ensure equitable treatment
                    </Text>
                    <Alert status="warning" borderRadius="md" mb={4}>
                        <AlertIcon />
                        <Box>
                            <Text fontWeight="bold">Note: Fairness Analysis Not Yet Implemented</Text>
                            <Text fontSize="sm">
                                Device type detection and demographic parity analysis require additional data collection.
                                This feature would track sessions by device type and calculate fairness metrics.
                            </Text>
                        </Box>
                    </Alert>
                    <Text fontSize="xs" color="white" mt={4}>
                        <strong>Future Enhancement:</strong> Fairness metrics would require tracking device/user metadata
                        and calculating false positive rates per cohort to ensure equitable treatment.
                    </Text>
                </CardBody>
            </Card>

            {/* Bias Report */}
            <Card w="full" bg="brand.800" borderTop="4px" borderColor="blue.500">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Bias Audit Report</Heading>
                    <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                            <Text fontWeight="bold">Bias Auditing Not Yet Implemented</Text>
                            <Text fontSize="sm">
                                Bias auditing requires demographic data collection and statistical analysis across protected attributes.
                                This is a planned feature for production deployment.
                            </Text>
                        </Box>
                    </Alert>
                </CardBody>
            </Card>

            {/* SDG Footer */}
            <HStack spacing={4} pt={4} fontSize="sm" color="white">
                <Tooltip label="SDG 9: Industry, Innovation and Infrastructure - Open, resilient systems">
                    <HStack cursor="pointer">
                        <Text>🏗️ SDG 9</Text>
                    </HStack>
                </Tooltip>
                <Tooltip label="SDG 16: Peace, Justice and Strong Institutions - Transparent, accountable governance">
                    <HStack cursor="pointer">
                        <Text>⚖️ SDG 16</Text>
                    </HStack>
                </Tooltip>
            </HStack>
        </VStack>
    );
}
