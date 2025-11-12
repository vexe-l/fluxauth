import { Box, Heading, Text, VStack, HStack, Progress, Tooltip, Icon, Card, CardBody, Badge } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip as ChartTooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

interface ScoreReason {
    code: string;
    message: string;
    feature: string;
    zscore: number;
}

interface ExplainabilityPanelProps {
    reasons: ScoreReason[];
    threshold?: number;
}

const featureDescriptions: Record<string, string> = {
    meanFlight: 'Average time between releasing one key and pressing the next',
    stdFlight: 'Consistency of timing between key presses',
    meanHold: 'Average duration keys are held down',
    stdHold: 'Consistency of key hold durations',
    backspaceRate: 'Frequency of backspace usage',
    bigramMean: 'Average time between consecutive key presses',
    totalKeys: 'Total number of keystrokes',
    mouseAvgSpeed: 'Average mouse movement speed'
};

export default function ExplainabilityPanel({ reasons, threshold = 2.5 }: ExplainabilityPanelProps) {
    const getZScoreColor = (zscore: number) => {
        const abs = Math.abs(zscore);
        if (abs > threshold) return 'red.500';
        if (abs > threshold * 0.7) return 'orange.500';
        return 'green.500';
    };

    const getZScoreWidth = (zscore: number) => {
        const abs = Math.abs(zscore);
        return Math.min((abs / 5) * 100, 100);
    };

    const getNaturalLanguage = (reason: ScoreReason) => {
        const abs = Math.abs(reason.zscore);
        const direction = reason.zscore > 0 ? 'higher' : 'lower';
        const intensity = abs > 3 ? 'significantly' : abs > 2 ? 'moderately' : 'slightly';

        const featureName = reason.feature.replace(/([A-Z])/g, ' $1').toLowerCase();

        return `Your ${featureName} is ${intensity} ${direction} than your baseline (${abs.toFixed(1)}σ deviation). ${abs > threshold
                ? 'This pattern is unusual for you.'
                : 'This is within your normal range.'
            }`;
    };

    // Calculate feature importance weights (based on absolute z-scores)
    const totalAbsZScore = reasons.reduce((sum, r) => sum + Math.abs(r.zscore), 0);
    const featureWeights = reasons.map(r => ({
        feature: r.feature,
        weight: totalAbsZScore > 0 ? (Math.abs(r.zscore) / totalAbsZScore) * 100 : 0,
        zscore: r.zscore
    })).sort((a, b) => b.weight - a.weight);

    const chartData = {
        labels: featureWeights.map(f => f.feature.replace(/([A-Z])/g, ' $1').trim()),
        datasets: [
            {
                label: 'Feature Importance (%)',
                data: featureWeights.map(f => f.weight),
                backgroundColor: featureWeights.map(f => {
                    const abs = Math.abs(f.zscore);
                    if (abs > threshold) return 'rgba(239, 68, 68, 0.8)';
                    if (abs > threshold * 0.7) return 'rgba(251, 146, 60, 0.8)';
                    return 'rgba(34, 197, 94, 0.8)';
                }),
                borderColor: featureWeights.map(f => {
                    const abs = Math.abs(f.zscore);
                    if (abs > threshold) return 'rgb(239, 68, 68)';
                    if (abs > threshold * 0.7) return 'rgb(251, 146, 60)';
                    return 'rgb(34, 197, 94)';
                }),
                borderWidth: 2
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const idx = context.dataIndex;
                        const weight = featureWeights[idx];
                        return [
                            `Importance: ${weight.weight.toFixed(1)}%`,
                            `Z-Score: ${weight.zscore > 0 ? '+' : ''}${weight.zscore.toFixed(2)}σ`
                        ];
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Importance Weight (%)',
                    color: 'white'
                },
                ticks: {
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: 'white',
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Box>
                <Heading size="md" mb={2} color="white">Behavioral Analysis</Heading>
                <Text fontSize="sm" color="white" opacity={0.8}>
                    Each feature is compared to your personal baseline. Deviations are measured in standard deviations (σ).
                </Text>
            </Box>

            {/* Visual Feature Weights Chart */}
            <Card bg="rgba(0, 0, 0, 0.2)" borderTop="4px" borderColor="brand.500">
                <CardBody>
                    <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                            <Heading size="sm" color="white">Feature Importance Weights</Heading>
                            <Badge colorScheme="purple">Visual Analysis</Badge>
                        </HStack>
                        <Text fontSize="xs" color="white" opacity={0.7}>
                            Features with higher weights contribute more to the trust score calculation
                        </Text>
                        <Box h="250px">
                            <Bar data={chartData} options={chartOptions} />
                        </Box>
                        <HStack spacing={4} fontSize="xs">
                            <HStack>
                                <Box w="3" h="3" bg="red.500" borderRadius="sm" />
                                <Text color="white">Anomalous (&gt;{threshold}σ)</Text>
                            </HStack>
                            <HStack>
                                <Box w="3" h="3" bg="orange.500" borderRadius="sm" />
                                <Text color="white">Warning ({threshold * 0.7}σ-{threshold}σ)</Text>
                            </HStack>
                            <HStack>
                                <Box w="3" h="3" bg="green.500" borderRadius="sm" />
                                <Text color="white">Normal (&lt;{threshold * 0.7}σ)</Text>
                            </HStack>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>

            {reasons.map((reason, idx) => {
                const weight = featureWeights.find(f => f.feature === reason.feature)?.weight || 0;
                return (
                <Box key={idx} p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="md" borderLeft="4px solid" borderColor={getZScoreColor(reason.zscore)}>
                    <HStack justify="space-between" mb={2}>
                        <HStack>
                            <Text fontWeight="medium" fontSize="sm" color="white">
                                {reason.feature}
                            </Text>
                            <Tooltip label={featureDescriptions[reason.feature]} placement="top">
                                <Icon as={InfoIcon} boxSize={3} color="white" opacity={0.7} cursor="help" />
                            </Tooltip>
                            <Badge colorScheme="purple" fontSize="xs">
                                {weight.toFixed(1)}% weight
                            </Badge>
                        </HStack>
                        <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="bold" color={getZScoreColor(reason.zscore)}>
                                {reason.zscore > 0 ? '+' : ''}{reason.zscore.toFixed(2)}σ
                            </Text>
                        </HStack>
                    </HStack>

                    {/* Z-score bar */}
                    <Box mb={3}>
                        <HStack spacing={2} mb={1}>
                            <Box flex={1} h="8px" bg="gray.200" borderRadius="full" overflow="hidden">
                                <Box
                                    h="full"
                                    w={`${getZScoreWidth(reason.zscore)}%`}
                                    bg={getZScoreColor(reason.zscore)}
                                    transition="width 0.5s ease"
                                />
                            </Box>
                            <Text fontSize="xs" color="gray.500" minW="40px">
                                {Math.abs(reason.zscore) > threshold ? 'Anomaly' : 'Normal'}
                            </Text>
                        </HStack>
                        <Progress
                            value={getZScoreWidth(reason.zscore)}
                            colorScheme={Math.abs(reason.zscore) > threshold ? 'red' : 'green'}
                            size="xs"
                            borderRadius="full"
                        />
                    </Box>

                    {/* Natural language explanation */}
                    <Text fontSize="sm" color="white">
                        {getNaturalLanguage(reason)}
                    </Text>

                    {/* Technical message */}
                    <Text fontSize="xs" color="white" opacity={0.7} mt={2} fontStyle="italic">
                        {reason.message}
                    </Text>
                </Box>
            )})}

            {/* Threshold indicator */}
            <Box p={3} bg="rgba(59, 130, 246, 0.2)" borderRadius="md" fontSize="sm" border="1px" borderColor="blue.500">
                <HStack>
                    <Icon as={InfoIcon} color="blue.400" />
                    <Text color="white">
                        Anomaly threshold: ±{threshold}σ. Features beyond this range are flagged as unusual.
                    </Text>
                </HStack>
            </Box>
        </VStack>
    );
}
