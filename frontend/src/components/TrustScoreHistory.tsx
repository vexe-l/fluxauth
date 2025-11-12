import { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Badge, Select } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { API_CONFIG } from '../config';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TrustScoreHistoryProps {
    userId?: string;
}

interface ScoreHistoryPoint {
    timestamp: string;
    trustScore: number;
    isAnomaly: boolean;
}

export default function TrustScoreHistory({ userId }: TrustScoreHistoryProps) {
    const [history, setHistory] = useState<ScoreHistoryPoint[]>([]);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/sessions/recent?limit=100${userId ? `&userId=${userId}` : ''}`,
                    {
                        headers: {
                            'x-api-key': API_CONFIG.API_KEY
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const points: ScoreHistoryPoint[] = data.sessions
                        .map((s: any) => ({
                            timestamp: new Date(s.scored_at || s.created_at).toISOString(),
                            trustScore: s.trust_score || 0,
                            isAnomaly: s.is_anomaly === 1
                        }))
                        .sort((a: ScoreHistoryPoint, b: ScoreHistoryPoint) =>
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        );

                    // Filter by time range
                    const now = Date.now();
                    const rangeMs = {
                        '24h': 24 * 60 * 60 * 1000,
                        '7d': 7 * 24 * 60 * 60 * 1000,
                        '30d': 30 * 24 * 60 * 60 * 1000
                    }[timeRange];

                    const filtered = points.filter(
                        (p) => now - new Date(p.timestamp).getTime() <= rangeMs
                    );

                    setHistory(filtered);
                } else {
                    // Use demo data if no real data
                    const demoData: ScoreHistoryPoint[] = [];
                    const now = Date.now();
                    for (let i = 0; i < 20; i++) {
                        demoData.push({
                            timestamp: new Date(now - i * 3600000).toISOString(),
                            trustScore: 70 + Math.random() * 30,
                            isAnomaly: Math.random() > 0.8
                        });
                    }
                    setHistory(demoData.reverse());
                }
            } catch (error) {
                console.error('Failed to fetch history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [userId, timeRange]);

    const chartData = {
        labels: history.map((p) => {
            const date = new Date(p.timestamp);
            if (timeRange === '24h') {
                return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } else if (timeRange === '7d') {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        }),
        datasets: [
            {
                label: 'Trust Score',
                data: history.map((p) => p.trustScore),
                borderColor: (context: any) => {
                    const point = history[context.dataIndex];
                    return point?.isAnomaly ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)';
                },
                backgroundColor: (context: any) => {
                    const point = history[context.dataIndex];
                    return point?.isAnomaly
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(34, 197, 94, 0.1)';
                },
                fill: true,
                tension: 0.4,
                pointRadius: (context: any) => {
                    const point = history[context.dataIndex];
                    return point?.isAnomaly ? 5 : 3;
                },
                pointHoverRadius: 6
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const point = history[context.dataIndex];
                        return [
                            `Trust Score: ${point.trustScore.toFixed(1)}`,
                            point.isAnomaly ? '⚠️ Anomaly Detected' : '✓ Normal'
                        ];
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'white',
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Trust Score',
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'white'
                }
            }
        }
    };

    const avgScore =
        history.length > 0
            ? history.reduce((sum, p) => sum + p.trustScore, 0) / history.length
            : 0;
    const anomalies = history.filter((p) => p.isAnomaly).length;

    return (
        <VStack spacing={4} w="full">
            <HStack w="full" justify="space-between">
                <Text fontSize="lg" fontWeight="bold" color="white">
                    Trust Score History
                </Text>
                <Select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d')}
                    size="sm"
                    w="120px"
                    bg="white"
                >
                    <option value="24h">Last 24h</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                </Select>
            </HStack>

            {isLoading ? (
                <Box h="300px" w="full" bg="rgba(0, 0, 0, 0.2)" borderRadius="md" />
            ) : history.length === 0 ? (
                <Box h="300px" w="full" bg="rgba(0, 0, 0, 0.2)" borderRadius="md" p={4}>
                    <VStack h="full" justify="center">
                        <Text color="white" opacity={0.7}>
                            No history data available yet
                        </Text>
                    </VStack>
                </Box>
            ) : (
                <>
                    <HStack w="full" spacing={4}>
                        <Box flex={1} p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md">
                            <Text fontSize="sm" color="white" opacity={0.7}>
                                Average Score
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="white">
                                {avgScore.toFixed(1)}
                            </Text>
                        </Box>
                        <Box flex={1} p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md">
                            <Text fontSize="sm" color="white" opacity={0.7}>
                                Total Sessions
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color="white">
                                {history.length}
                            </Text>
                        </Box>
                        <Box flex={1} p={3} bg="rgba(0, 0, 0, 0.2)" borderRadius="md">
                            <Text fontSize="sm" color="white" opacity={0.7}>
                                Anomalies
                            </Text>
                            <Text fontSize="2xl" fontWeight="bold" color={anomalies > 0 ? 'red.400' : 'white'}>
                                {anomalies}
                            </Text>
                        </Box>
                    </HStack>
                    <Box h="300px" w="full" bg="rgba(0, 0, 0, 0.2)" borderRadius="md" p={4}>
                        <Line data={chartData} options={options} />
                    </Box>
                </>
            )}
        </VStack>
    );
}

