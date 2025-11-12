import { Box, Heading, Text, VStack, HStack, Progress, Tooltip, Icon } from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

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

    return (
        <VStack spacing={6} align="stretch">
            <Box>
                <Heading size="md" mb={2}>Behavioral Analysis</Heading>
                <Text fontSize="sm" color="gray.600">
                    Each feature is compared to your personal baseline. Deviations are measured in standard deviations (σ).
                </Text>
            </Box>

            {reasons.map((reason, idx) => (
                <Box key={idx} p={4} bg="gray.50" borderRadius="md" borderLeft="4px solid" borderColor={getZScoreColor(reason.zscore)}>
                    <HStack justify="space-between" mb={2}>
                        <HStack>
                            <Text fontWeight="medium" fontSize="sm">
                                {reason.feature}
                            </Text>
                            <Tooltip label={featureDescriptions[reason.feature]} placement="top">
                                <Icon as={InfoIcon} boxSize={3} color="gray.400" cursor="help" />
                            </Tooltip>
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
                    <Text fontSize="sm" color="gray.700">
                        {getNaturalLanguage(reason)}
                    </Text>

                    {/* Technical message */}
                    <Text fontSize="xs" color="gray.500" mt={2} fontStyle="italic">
                        {reason.message}
                    </Text>
                </Box>
            ))}

            {/* Threshold indicator */}
            <Box p={3} bg="blue.50" borderRadius="md" fontSize="sm">
                <HStack>
                    <Icon as={InfoIcon} color="blue.500" />
                    <Text color="blue.700">
                        Anomaly threshold: ±{threshold}σ. Features beyond this range are flagged as unusual.
                    </Text>
                </HStack>
            </Box>
        </VStack>
    );
}
