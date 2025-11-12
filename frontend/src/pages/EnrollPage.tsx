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
    Input,
    FormControl,
    FormLabel,
    Progress,
    Alert,
    AlertIcon,
    Badge,
    HStack
} from '@chakra-ui/react';
import { BehaviorSDK, BehaviorEvent } from '../sdk/browser';
import { API_CONFIG } from '../config';
import TypingVisualization from '../components/TypingVisualization';

const PROMPTS = [
    'The quick brown fox jumps over the lazy dog.',
    'Pack my box with five dozen liquor jugs.',
    'How vexingly quick daft zebras jump!',
    'The five boxing wizards jump quickly.'
];

export default function EnrollPage() {
    const [userId, setUserId] = useState('');
    const [currentPrompt, setCurrentPrompt] = useState(0);
    const [isCapturing, setIsCapturing] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const [sdk] = useState(() => new BehaviorSDK({
        apiUrl: API_CONFIG.API_URL,
        apiKey: API_CONFIG.API_KEY,
        offlineMode: true // Enable offline mode to work without backend
    }));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [liveEvents, setLiveEvents] = useState<BehaviorEvent[]>([]);
    
    // Load saved progress from localStorage
    useEffect(() => {
        if (userId) {
            const saved = localStorage.getItem(`enroll_progress_${userId}`);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.userId === userId) {
                        setSessions(data.sessions || []);
                        setCurrentPrompt(data.currentPrompt || 0);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    }, [userId]);
    
    // Real-time event polling for visualization
    useEffect(() => {
        if (!isCapturing) {
            setLiveEvents([]);
            return;
        }
        
        const interval = setInterval(() => {
            const currentEvents = sdk.getEvents();
            setLiveEvents([...currentEvents]);
        }, 100); // Update every 100ms for smooth visualization
        
        return () => clearInterval(interval);
    }, [isCapturing, sdk]);
    
    // Save progress to localStorage
    const saveProgress = () => {
        if (userId) {
            localStorage.setItem(`enroll_progress_${userId}`, JSON.stringify({
                sessions,
                currentPrompt,
                userId
            }));
        }
    };

    const handleStartCapture = async () => {
        if (!userId.trim()) {
            setError('Please enter a user ID');
            return;
        }

        const sessionId = `enroll-${userId}-${currentPrompt}-${Date.now()}`;
        setError('');

        try {
            await sdk.startSession(sessionId, userId);
            setIsCapturing(true);
            setLiveEvents([]); // Reset visualization
        } catch (err) {
            // In offline mode, this shouldn't fail, but if it does, continue anyway
            console.warn('Session start warning (continuing in offline mode):', err);
            setIsCapturing(true);
            setLiveEvents([]);
        }
    };

    const handleCompletePrompt = () => {
        try {
            sdk.endSession();
            const events = sdk.getEvents();
            
            if (events.length === 0) {
                setError('No typing data captured. Please try again.');
                setIsCapturing(false);
                return;
            }

            const newSessions = [...sessions, {
                sessionId: `enroll-${userId}-${currentPrompt}`,
                events
            }];
            setSessions(newSessions);
            saveProgress();

            sdk.clearEvents();
            setIsCapturing(false);
            setLiveEvents([]); // Clear visualization

            if (currentPrompt < PROMPTS.length - 1) {
                setCurrentPrompt(currentPrompt + 1);
            } else {
                handleEnroll();
            }
        } catch (err) {
            setError('Failed to complete prompt. Your progress has been saved.');
            setIsCapturing(false);
        }
    };

    const handleEnroll = async () => {
        if (sessions.length < 4) {
            setError('Please complete all 4 prompts before enrolling.');
            return;
        }
        
        setIsEnrolling(true);
        setError('');
        
        try {
            await sdk.enroll(userId, sessions);
            
            // Verify profile was saved
            const savedProfile = localStorage.getItem(`fluxauth_profile_${userId}`);
            if (!savedProfile) {
                console.error('Profile not found in localStorage after enrollment');
                throw new Error('Profile was not saved. Please try again.');
            }
            console.log('✅ Enrollment successful - profile verified in localStorage');
            
            // Clear saved progress on success
            localStorage.removeItem(`enroll_progress_${userId}`);
            setSuccess(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Enrollment failed. Your progress has been saved.';
            setError(`${errorMessage} You can retry from where you left off.`);
            setIsEnrolling(false);
            // Progress is already saved, user can continue
        }
    };
    
    const handleRetry = () => {
        setError('');
        // Sessions are already saved, user can continue from current prompt
    };
    
    const handleReset = () => {
        if (confirm('Reset enrollment? All progress will be lost.')) {
            setSessions([]);
            setCurrentPrompt(0);
            setError('');
            setIsCapturing(false);
            sdk.clearEvents();
            if (userId) {
                localStorage.removeItem(`enroll_progress_${userId}`);
            }
        }
    };

    // Calculate progress: use sessions.length if all completed, otherwise use currentPrompt
    const progress = sessions.length >= PROMPTS.length 
        ? 100 
        : ((currentPrompt + (isCapturing ? 0.5 : 0)) / PROMPTS.length) * 100;

    if (success) {
        return (
            <VStack spacing={6} maxW="2xl" mx="auto">
                <Alert status="success" borderRadius="md" bg="rgba(34, 197, 94, 0.2)" borderColor="green.400">
                    <AlertIcon color="green.400" />
                    <Text color="white" fontWeight="medium">
                        Enrollment complete! You can now test authentication.
                    </Text>
                </Alert>
                <Button colorScheme="brand" size="lg" onClick={() => window.location.href = '/test'}>
                    Go to Test Page
                </Button>
                <Text color="white" fontSize="sm" opacity={0.7}>
                    Your behavioral profile has been saved locally. You can now test authentication on the Test page.
                </Text>
            </VStack>
        );
    }

    return (
        <VStack spacing={6} maxW="2xl" mx="auto">
            <Heading size="lg" color="white">Enroll Your Behavioral Profile</Heading>
            <Text color="white" textAlign="center">
                Type 4 short prompts naturally to create your unique behavioral baseline
            </Text>

            {error && (
                <Alert status="error" borderRadius="md" bg="rgba(220, 38, 38, 0.2)" borderColor="red.500">
                    <AlertIcon color="red.400" />
                    <Box>
                        <Text color="white">{error}</Text>
                        <HStack mt={2}>
                            <Button size="sm" onClick={handleRetry} colorScheme="red">
                                Continue
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleReset} colorScheme="red" borderColor="red.400" color="white" _hover={{ bg: 'rgba(220, 38, 38, 0.2)' }}>
                                Reset
                            </Button>
                        </HStack>
                    </Box>
                </Alert>
            )}

            <Card w="full" bg="rgba(0, 0, 0, 0.3)" borderColor="rgba(255, 255, 255, 0.1)">
                <CardBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel color="white">User ID</FormLabel>
                            <Input
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter a unique user ID"
                                isDisabled={sessions.length > 0}
                                color="white"
                                _placeholder={{ color: 'rgba(255, 255, 255, 0.5)' }}
                                borderColor="rgba(255, 255, 255, 0.2)"
                                _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                                _focus={{ borderColor: 'brand.500' }}
                            />
                        </FormControl>

                        <Box w="full">
                            <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm" fontWeight="medium" color="white">
                                    Progress: {currentPrompt + 1} / {PROMPTS.length}
                                </Text>
                                <Badge colorScheme="brand">{Math.round(progress)}%</Badge>
                            </HStack>
                            <Progress value={progress} colorScheme="brand" />
                        </Box>

                        <Box w="full" p={4} bg="rgba(255, 255, 255, 0.1)" borderRadius="md">
                            <Text fontSize="sm" color="white" mb={2}>
                                Prompt {currentPrompt + 1}:
                            </Text>
                            <Text fontSize="lg" fontWeight="medium" color="white">
                                {PROMPTS[currentPrompt]}
                            </Text>
                        </Box>

                        <Textarea
                            placeholder="Type the prompt here..."
                            rows={3}
                            isDisabled={!isCapturing}
                            autoFocus={isCapturing}
                            color="white"
                            _placeholder={{ color: 'rgba(255, 255, 255, 0.5)' }}
                            borderColor="rgba(255, 255, 255, 0.2)"
                            _hover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                            _focus={{ borderColor: 'brand.500' }}
                        />
                        
                        {/* Real-time Typing Visualization */}
                        {isCapturing && (
                            <TypingVisualization events={liveEvents} isActive={isCapturing} />
                        )}

                        {!isCapturing ? (
                            <Button
                                colorScheme="brand"
                                onClick={handleStartCapture}
                                w="full"
                                isDisabled={!userId.trim()}
                            >
                                Start Typing
                            </Button>
                        ) : (
                            <Button
                                colorScheme="green"
                                onClick={handleCompletePrompt}
                                w="full"
                                isLoading={isEnrolling}
                            >
                                Complete Prompt
                            </Button>
                        )}
                        
                        {sessions.length > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleReset}
                                colorScheme="red"
                            >
                                Reset Enrollment
                            </Button>
                        )}

                        <Text fontSize="xs" color="white">
                            {sessions.length} / {PROMPTS.length} prompts completed
                        </Text>
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
}
