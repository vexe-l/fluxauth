import { useState } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Button,
    Select,
    Input,
    FormControl,
    FormLabel,
    Switch,
    Badge,
    Alert,
    AlertIcon,
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Grid,
    GridItem
} from '@chakra-ui/react';
import { API_CONFIG } from '../config';

export default function ContextualRiskPage() {
    const [baseTrustScore, setBaseTrustScore] = useState(75);
    const [action, setAction] = useState('login');
    const [location, setLocation] = useState('New York, US');
    const [isNewDevice, setIsNewDevice] = useState(false);
    const [amountInvolved, setAmountInvolved] = useState('');
    const [userId, setUserId] = useState('demo-user');

    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/contextual-risk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_CONFIG.API_KEY
                },
                body: JSON.stringify({
                    baseTrustScore,
                    action,
                    location: location || undefined,
                    isNewDevice,
                    amountInvolved: amountInvolved ? parseFloat(amountInvolved) : undefined,
                    userId: userId || undefined
                })
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Failed to analyze risk:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'LOW': return 'green';
            case 'MEDIUM': return 'yellow';
            case 'HIGH': return 'orange';
            case 'CRITICAL': return 'red';
            default: return 'gray';
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'ALLOW': return 'green';
            case 'REQUIRE_MFA': return 'yellow';
            case 'BLOCK': return 'red';
            default: return 'gray';
        }
    };

    return (
        <VStack spacing={6} maxW="6xl" mx="auto">
            <Box textAlign="center">
                <HStack justify="center" mb={2}>
                    <Heading size="lg" color="white">AI Contextual Risk Scoring</Heading>
                    <Badge colorScheme="purple" fontSize="sm">Powered by Gemini</Badge>
                </HStack>
                <Text color="white" mt={2}>
                    AI analyzes context to adjust risk scores based on action type, location, time, and user behavior
                </Text>
            </Box>

            <Grid templateColumns="repeat(2, 1fr)" gap={6} w="full">
                {/* Input Panel */}
                <GridItem>
                    <Card bg="rgba(0, 0, 0, 0.2)">
                        <CardBody>
                            <Heading size="md" mb={4} color="white">Configure Context</Heading>

                            <VStack spacing={4} align="stretch">
                                <FormControl>
                                    <FormLabel color="white">Base Trust Score: {baseTrustScore}</FormLabel>
                                    <Slider
                                        value={baseTrustScore}
                                        onChange={setBaseTrustScore}
                                        min={0}
                                        max={100}
                                        colorScheme="brand"
                                    >
                                        <SliderTrack>
                                            <SliderFilledTrack />
                                        </SliderTrack>
                                        <SliderThumb />
                                    </Slider>
                                    <Text fontSize="xs" color="white" mt={1}>
                                        From behavioral biometric analysis
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="white">Action Type</FormLabel>
                                    <Select
                                        value={action}
                                        onChange={(e) => setAction(e.target.value)}
                                        bg="white"
                                        color="gray.800"
                                    >
                                        <option value="login">Login</option>
                                        <option value="view_profile">View Profile</option>
                                        <option value="update_settings">Update Settings</option>
                                        <option value="transfer_money">Transfer Money</option>
                                        <option value="delete_account">Delete Account</option>
                                        <option value="admin_access">Admin Access</option>
                                    </Select>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="white">User ID (optional)</FormLabel>
                                    <Input
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="e.g., demo-user"
                                        bg="white"
                                        color="gray.800"
                                    />
                                    <Text fontSize="xs" color="white" mt={1}>
                                        Used to fetch user's historical behavior
                                    </Text>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="white">Location (optional)</FormLabel>
                                    <Input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g., London, UK"
                                        bg="white"
                                        color="gray.800"
                                    />
                                </FormControl>

                                <FormControl>
                                    <HStack justify="space-between">
                                        <FormLabel color="white" mb={0}>New Device</FormLabel>
                                        <Switch
                                            isChecked={isNewDevice}
                                            onChange={(e) => setIsNewDevice(e.target.checked)}
                                            colorScheme="brand"
                                        />
                                    </HStack>
                                    <Text fontSize="xs" color="white" mt={1}>
                                        First time using this device
                                    </Text>
                                </FormControl>

                                {(action === 'transfer_money' || action === 'delete_account') && (
                                    <FormControl>
                                        <FormLabel color="white">Amount (optional)</FormLabel>
                                        <Input
                                            type="number"
                                            value={amountInvolved}
                                            onChange={(e) => setAmountInvolved(e.target.value)}
                                            placeholder="e.g., 5000"
                                            bg="white"
                                            color="gray.800"
                                        />
                                        <Text fontSize="xs" color="white" mt={1}>
                                            Transaction amount in USD
                                        </Text>
                                    </FormControl>
                                )}

                                <Button
                                    colorScheme="brand"
                                    onClick={handleAnalyze}
                                    isLoading={isLoading}
                                    w="full"
                                    size="lg"
                                >
                                    Analyze Risk with AI
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                </GridItem>

                {/* Results Panel */}
                <GridItem>
                    {result ? (
                        <VStack spacing={4} align="stretch">
                            {/* Risk Score Card */}
                            <Card borderWidth={2} borderColor={`${getRiskColor(result.riskLevel)}.400`} bg="rgba(0, 0, 0, 0.2)">
                                <CardBody>
                                    <VStack spacing={4}>
                                        <HStack justify="space-between" w="full">
                                            <Stat>
                                                <StatLabel color="white">Base Trust Score</StatLabel>
                                                <StatNumber color="white">{result.baseTrustScore}</StatNumber>
                                                <StatHelpText color="white">From biometrics</StatHelpText>
                                            </Stat>
                                            <Box fontSize="3xl" color="white">→</Box>
                                            <Stat>
                                                <StatLabel color="white">Adjusted Risk</StatLabel>
                                                <StatNumber color={`${getRiskColor(result.riskLevel)}.400`}>
                                                    {result.adjustedRiskScore}
                                                </StatNumber>
                                                <StatHelpText color="white">
                                                    <Badge colorScheme={getRiskColor(result.riskLevel)} fontSize="sm">
                                                        {result.riskLevel}
                                                    </Badge>
                                                </StatHelpText>
                                            </Stat>
                                        </HStack>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Recommended Action */}
                            <Card bg={`${getActionColor(result.recommendedAction)}.900`} borderWidth="1px" borderColor={`${getActionColor(result.recommendedAction)}.400`}>
                                <CardBody>
                                    <VStack align="stretch" spacing={2}>
                                        <HStack justify="space-between">
                                            <Text fontWeight="bold" color="white">Recommended Action</Text>
                                            <Badge colorScheme={getActionColor(result.recommendedAction)} fontSize="md" px={3} py={1}>
                                                {result.recommendedAction}
                                            </Badge>
                                        </HStack>
                                        <Text fontSize="sm" color="white">
                                            {result.reasoning}
                                        </Text>
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Risk Factors */}
                            <Card bg="rgba(0, 0, 0, 0.2)">
                                <CardBody>
                                    <Heading size="sm" mb={3} color="white">Risk Factors</Heading>
                                    <VStack align="stretch" spacing={2}>
                                        {result.riskFactors.map((factor: string, idx: number) => (
                                            <HStack key={idx}>
                                                <Box w="6px" h="6px" bg="red.400" borderRadius="full" />
                                                <Text fontSize="sm" color="white">{factor}</Text>
                                            </HStack>
                                        ))}
                                    </VStack>
                                </CardBody>
                            </Card>

                            {/* Context Details */}
                            <Card bg="rgba(0, 0, 0, 0.2)">
                                <CardBody>
                                    <Heading size="sm" mb={3} color="white">Context Analyzed</Heading>
                                    <VStack align="stretch" spacing={2} fontSize="sm">
                                        <HStack justify="space-between">
                                            <Text color="white">Action:</Text>
                                            <Badge>{result.context.action}</Badge>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text color="white">Time:</Text>
                                            <Text color="white">{result.context.timeOfDay}:00</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text color="white">New Device:</Text>
                                            <Badge colorScheme={result.context.isNewDevice ? 'red' : 'green'}>
                                                {result.context.isNewDevice ? 'Yes' : 'No'}
                                            </Badge>
                                        </HStack>
                                        {result.context.location && (
                                            <HStack justify="space-between">
                                                <Text color="white">Location:</Text>
                                                <Text color="white">{result.context.location}</Text>
                                            </HStack>
                                        )}
                                        {result.context.amountInvolved && (
                                            <HStack justify="space-between">
                                                <Text color="white">Amount:</Text>
                                                <Text color="white" fontWeight="bold">${result.context.amountInvolved}</Text>
                                            </HStack>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        </VStack>
                    ) : (
                        <Card h="full" bg="rgba(0, 0, 0, 0.2)">
                            <CardBody>
                                <VStack justify="center" h="full" spacing={4}>
                                    <Text fontSize="4xl">🤖</Text>
                                    <Text color="white" textAlign="center">
                                        Configure the context and click "Analyze Risk with AI" to see how AI adjusts the risk score
                                    </Text>
                                </VStack>
                            </CardBody>
                        </Card>
                    )}
                </GridItem>
            </Grid>

            {/* Info Alert */}
            <Alert status="info" borderRadius="md" bg="blue.900" color="white">
                <AlertIcon />
                <Box>
                    <Text fontWeight="bold" color="white">How It Works</Text>
                    <Text fontSize="sm" color="white">
                        AI analyzes the base trust score along with contextual factors (action sensitivity, time, location, device)
                        to calculate an adjusted risk score and recommend the appropriate security action.
                    </Text>
                </Box>
            </Alert>
        </VStack>
    );
}
