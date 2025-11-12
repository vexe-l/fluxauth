import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    Button,
    Textarea,
    Card,
    CardBody,
    Alert,
    AlertIcon,
    Input,
    FormControl,
    FormLabel,
    HStack,
    Badge,
    Divider
} from '@chakra-ui/react';
import { BehaviorSDK, ScoreResult } from '../sdk/browser';
import ConsentBanner from '../components/ConsentBanner';
import SessionLockModal from '../components/SessionLockModal';
import { API_CONFIG } from '../config';

const TEST_PROMPT = 'The quick brown fox jumps over the lazy dog.';

export default function TestPage() {
    const [hasConsent, setHasConsent] = useState(false);
    const [userId, setUserId] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);
    const [offlineMode, setOfflineMode] = useState(true); // Default to offline mode
    const [sdk, setSdk] = useState(() => new BehaviorSDK({
        apiUrl: API_CONFIG.API_URL,
        apiKey: API_CONFIG.API_KEY,
        offlineMode: true // Default to offline mode
    }));
    
    // Update SDK when offline mode changes
    useEffect(() => {
        setSdk(new BehaviorSDK({
            apiUrl: API_CONFIG.API_URL,
            apiKey: API_CONFIG.API_KEY,
            offlineMode: offlineMode
        }));
    }, [offlineMode]);
    const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
    const [isScoring, setIsScoring] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [continuousAuth, setContinuousAuth] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [scoreHistory, setScoreHistory] = useState<Array<{ timestamp: number; score: number }>>([]);
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockPolicyAction, setLockPolicyAction] = useState<{
        type: string;
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    } | null>(null);

    useEffect(() => {
        return () => {
            if (isCapturing) {
                sdk.endSession();
            }
        };
    }, [sdk, isCapturing]);
    
    // Continuous authentication - score updates every 30s
    useEffect(() => {
        if (!continuousAuth || !isCapturing || !userId || !currentSessionId) {
            return;
        }
        
        const interval = setInterval(async () => {
            try {
                const events = sdk.getEvents();
                if (events.length > 10) { // Only score if we have enough events
                    const result = await sdk.score(userId, currentSessionId, events);
                    setScoreResult(result);
                    setScoreHistory(prev => [...prev, {
                        timestamp: Date.now(),
                        score: result.trustScore
                    }].slice(-20)); // Keep last 20 scores
                    
                    // Check for policy actions during continuous auth
                    if (result.policyAction && result.policyAction.type === 'BLOCK_SESSION') {
                        setLockPolicyAction(result.policyAction);
                        setShowLockModal(true);
                        setIsCapturing(false); // Stop capturing when blocked
                    }
                }
            } catch (error) {
                console.error('Continuous auth scoring failed:', error);
            }
        }, 30000); // Every 30 seconds
        
        return () => clearInterval(interval);
    }, [continuousAuth, isCapturing, userId, currentSessionId, sdk]);

    const handleStartCapture = async () => {
        if (!userId.trim()) {
            setErrorMessage('Please enter a user ID');
            return;
        }

        const sessionId = `test-${userId}-${Date.now()}`;
        setCurrentSessionId(sessionId);
        setIsCapturing(true);
        setErrorMessage('');
        setScoreResult(null);
        setScoreHistory([]);

        try {
            await sdk.startSession(sessionId, userId);
        } catch (error) {
            // In offline mode, continue anyway
            if (offlineMode) {
                console.warn('Session start warning (continuing in offline mode):', error);
                // Continue capturing in offline mode
            } else {
                setErrorMessage('Failed to start session. Please check your connection or enable offline mode.');
                setIsCapturing(false);
            }
        }
    };



    const handleScore = async () => {
        sdk.endSession();
        setIsCapturing(false);
        setIsScoring(true);
        setErrorMessage('');

        const events = sdk.getEvents();
        const sessionId = `test-${userId}-${Date.now()}`;

        try {
            const result = await sdk.score(userId, sessionId, events);
            setScoreResult(result);
            
            // Save session to localStorage for monitor page
            const sessionData = {
                sessionId,
                userId,
                trustScore: result.trustScore,
                isAnomaly: result.isAnomaly,
                timestamp: Date.now(),
                keystrokes: events.filter(e => e.type === 'keydown' || e.type === 'keyup').length,
                mouseEvents: events.filter(e => e.type === 'mousemove').length
            };
            localStorage.setItem(`fluxauth_session_${sessionId}`, JSON.stringify(sessionData));
            
            // Check for policy actions that require UI response
            if (result.policyAction) {
                if (result.policyAction.type === 'BLOCK_SESSION') {
                    setLockPolicyAction(result.policyAction);
                    setShowLockModal(true);
                } else if (result.policyAction.severity === 'high' || result.policyAction.severity === 'critical') {
                    setLockPolicyAction(result.policyAction);
                    setShowLockModal(true);
                }
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Scoring failed');
        } finally {
            setIsScoring(false);
            sdk.clearEvents();
        }
    };

    const handleSimulateAttack = async () => {
        setIsScoring(true);
        setErrorMessage('');
        setScoreResult(null);

        // Generate synthetic attacker session with different timing patterns
        const attackerEvents = [];
        const baseTime = Date.now();

        // Attacker types much faster with different rhythm
        for (let i = 0; i < 50; i++) {
            attackerEvents.push({
                type: 'keydown' as const,
                timestamp: baseTime + i * 50, // Much faster (50ms vs typical 150ms)
                keyClass: 'letter' as const
            });
            attackerEvents.push({
                type: 'keyup' as const,
                timestamp: baseTime + i * 50 + 20, // Shorter hold time
                keyClass: 'letter' as const
            });
        }

        const sessionId = `attack-${userId}-${Date.now()}`;

        try {
            const result = await sdk.score(userId, sessionId, attackerEvents);
            setScoreResult(result);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Simulation failed');
        } finally {
            setIsScoring(false);
        }
    };

    const handleReset = () => {
        setScoreResult(null);
        setErrorMessage('');
        sdk.clearEvents();
    };

    if (!hasConsent) {
        return (
            <ConsentBanner
                isOpen={true}
                onAccept={() => setHasConsent(true)}
                onDecline={() => window.location.href = '/'}
            />
        );
    }

    return (
        <VStack spacing={6} maxW="2xl" mx="auto">
            <Heading size="lg" color="white">Edge/Offline SDK Mode</Heading>
            <Text color="white" textAlign="center">
                Browser SDK scores locally before sending summary to server — privacy-first & efficient
            </Text>

            {/* Offline Mode Toggle */}
            <Card w="full" bg="brand.800" borderTop="4px" borderColor="accent.500">
                <CardBody>
                    <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" color="white">Local Mode (Offline Scoring)</Text>
                                <Text fontSize="sm" color="white">
                                    Compute trust score client-side using JS function
                                </Text>
                                {offlineMode && (
                                    <Alert status="success" borderRadius="md" mt={2} fontSize="xs">
                                        <AlertIcon />
                                        <Text fontSize="xs">✓ Offline mode enabled. Scoring happens client-side using localStorage.</Text>
                                    </Alert>
                                )}
                            </VStack>
                            <Button
                                colorScheme={offlineMode ? 'green' : 'gray'}
                                onClick={() => setOfflineMode(!offlineMode)}
                                size="sm"
                            >
                                {offlineMode ? 'Enabled ✓' : 'Disabled'}
                            </Button>
                        </HStack>
                        
                        <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" color="white">Continuous Authentication</Text>
                                <Text fontSize="sm" color="white">
                                    Automatically score every 30 seconds during active session
                                </Text>
                                {continuousAuth && isCapturing && (
                                    <Alert status="info" borderRadius="md" mt={2} fontSize="xs">
                                        <AlertIcon />
                                        <Text fontSize="xs">🔄 Active: Trust score updates every 30s</Text>
                                    </Alert>
                                )}
                            </VStack>
                            <Button
                                colorScheme={continuousAuth ? 'blue' : 'gray'}
                                onClick={() => setContinuousAuth(!continuousAuth)}
                                size="sm"
                                isDisabled={!isCapturing}
                            >
                                {continuousAuth ? 'Active ✓' : 'Inactive'}
                            </Button>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>

            {
                errorMessage && (
                    <Alert status="error" borderRadius="md" color="red.900">
                        <AlertIcon />
                        {errorMessage}
                    </Alert>
                )
            }

            <FormControl>
                <FormLabel>User ID</FormLabel>
                <Input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your enrolled user ID"
                    isDisabled={isCapturing}
                />
            </FormControl>

            {
                !scoreResult && (
                    <Card w="full">
                        <CardBody>
                            <VStack spacing={4}>
                                <Text fontWeight="medium">Authentication Test</Text>
                                <Text fontSize="sm" color="white">
                                    Type the following text naturally:
                                </Text>
                                <Text fontSize="lg" fontWeight="medium" color="white" textAlign="center" p={4} bg="brand.800" borderRadius="md">
                                    {TEST_PROMPT}
                                </Text>
                                <Textarea
                                    placeholder="Start typing here..."
                                    rows={3}
                                    isDisabled={!isCapturing}
                                />
                                {!isCapturing ? (
                                    <HStack w="full" spacing={3}>
                                        <Button colorScheme="brand" onClick={handleStartCapture} flex={1}>
                                            Start Test
                                        </Button>
                                        <Button variant="outline" onClick={handleSimulateAttack} flex={1}>
                                            Simulate Attack
                                        </Button>
                                    </HStack>
                                ) : (
                                    <Button
                                        colorScheme="green"
                                        onClick={handleScore}
                                        isLoading={isScoring}
                                        w="full"
                                    >
                                        Complete & Score
                                    </Button>
                                )}
                            </VStack>
                        </CardBody>
                    </Card>
                )
            }

            {
                scoreResult && (
                    <Card w="full" borderWidth={2} borderColor={scoreResult.isAnomaly ? 'red.300' : 'green.300'}>
                        <CardBody>
                            <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                    <Heading size="md">Authentication Result</Heading>
                                    <HStack>
                                        {offlineMode && (
                                            <Badge colorScheme="purple" fontSize="sm">
                                                Offline Mode
                                            </Badge>
                                        )}
                                        <Badge colorScheme={scoreResult.isAnomaly ? 'red' : 'green'} fontSize="lg" px={3} py={1}>
                                            {scoreResult.isAnomaly ? 'ANOMALY' : 'VERIFIED'}
                                        </Badge>
                                    </HStack>
                                </HStack>

                                <Divider />

                                <Box>
                                    <Text fontSize="sm" color="white" mb={2}>
                                        Trust Score
                                    </Text>
                                    <HStack>
                                        <Heading size="2xl" color={scoreResult.trustScore > 70 ? 'green.500' : 'red.500'}>
                                            {scoreResult.trustScore}
                                        </Heading>
                                        <Text fontSize="xl" color="white">
                                            / 100
                                        </Text>
                                    </HStack>
                                </Box>

                                <Divider />

                                {scoreResult.aiAnalysis && (
                                    <>
                                        <Box bg="brand.800" p={4} borderRadius="md" borderLeft="4px" borderColor="purple.500">
                                            <HStack mb={2}>
                                                <Text fontSize="sm" fontWeight="bold" color="white">
                                                    🤖 AI Security Analysis
                                                </Text>
                                                <Badge colorScheme="purple" fontSize="xs">Powered by Gemini</Badge>
                                            </HStack>
                                            <Text fontSize="sm" color="white">
                                                {scoreResult.aiAnalysis}
                                            </Text>
                                        </Box>
                                        <Divider />
                                    </>
                                )}

                                {scoreResult.aiExplanation && (
                                    <>
                                        <Box bg="brand.800" p={4} borderRadius="md" borderLeft="4px" borderColor="blue.500">
                                            <Text fontSize="sm" fontWeight="bold" color="white" mb={2}>
                                                💡 What This Means For You
                                            </Text>
                                            <Text fontSize="sm" color="white">
                                                {scoreResult.aiExplanation}
                                            </Text>
                                        </Box>
                                        <Divider />
                                    </>
                                )}

                                <Box>
                                    <Text fontSize="sm" color="white" mb={3}>
                                        Technical Details
                                    </Text>
                                    <VStack spacing={2} align="stretch">
                                        {scoreResult.topReasons.map((reason, idx) => (
                                            <Card key={idx} size="sm" bg="brand.800">
                                                <CardBody>
                                                    <HStack justify="space-between" mb={1}>
                                                        <Text fontWeight="medium" fontSize="sm">
                                                            {reason.feature}
                                                        </Text>
                                                        <Badge colorScheme={Math.abs(reason.zscore) > 2 ? 'red' : 'yellow'}>
                                                            {reason.zscore > 0 ? '+' : ''}{reason.zscore}σ
                                                        </Badge>
                                                    </HStack>
                                                    <Text fontSize="xs" color="white">
                                                        {reason.message}
                                                    </Text>
                                                </CardBody>
                                            </Card>
                                        ))}
                                    </VStack>
                                </Box>

                                <Button variant="outline" onClick={handleReset}>
                                    Test Again
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                )
            }

            {/* Session Lock Modal */}
            {lockPolicyAction && (
                <SessionLockModal
                    isOpen={showLockModal}
                    onClose={() => {
                        setShowLockModal(false);
                        if (lockPolicyAction?.type !== 'BLOCK_SESSION') {
                            setLockPolicyAction(null);
                        }
                    }}
                    policyAction={lockPolicyAction}
                    trustScore={scoreResult?.trustScore}
                    reasons={scoreResult?.topReasons}
                />
            )}
        </VStack>
    );
}
