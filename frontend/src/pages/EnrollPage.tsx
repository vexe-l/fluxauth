import { useState } from 'react';
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
import { BehaviorSDK } from '../sdk/browser';

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
        apiUrl: '/api',
        apiKey: 'dev_key_12345'
    }));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleStartCapture = async () => {
        if (!userId.trim()) {
            setError('Please enter a user ID');
            return;
        }

        const sessionId = `enroll-${userId}-${currentPrompt}-${Date.now()}`;
        setIsCapturing(true);
        setError('');

        try {
            await sdk.startSession(sessionId, userId);
        } catch (err) {
            setError('Failed to start session');
            setIsCapturing(false);
        }
    };

    const handleCompletePrompt = () => {
        sdk.endSession();
        const events = sdk.getEvents();

        setSessions([...sessions, {
            sessionId: `enroll-${userId}-${currentPrompt}`,
            events
        }]);

        sdk.clearEvents();
        setIsCapturing(false);

        if (currentPrompt < PROMPTS.length - 1) {
            setCurrentPrompt(currentPrompt + 1);
        } else {
            handleEnroll();
        }
    };

    const handleEnroll = async () => {
        try {
            await sdk.enroll(userId, sessions);
            setSuccess(true);
        } catch (err) {
            setError('Enrollment failed. Please try again.');
        }
    };

    const progress = ((currentPrompt + (isCapturing ? 0.5 : 0)) / PROMPTS.length) * 100;

    if (success) {
        return (
            <VStack spacing={6} maxW="2xl" mx="auto">
                <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    Enrollment complete! You can now test authentication.
                </Alert>
                <Button colorScheme="brand" onClick={() => window.location.href = '/test'}>
                    Go to Test Page
                </Button>
            </VStack>
        );
    }

    return (
        <VStack spacing={6} maxW="2xl" mx="auto">
            <Heading size="lg" color="white">Enroll Your Behavioral Profile</Heading>
            <Text color="gray.300" textAlign="center">
                Type 4 short prompts naturally to create your unique behavioral baseline
            </Text>

            {error && (
                <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            <Card w="full">
                <CardBody>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>User ID</FormLabel>
                            <Input
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter a unique user ID"
                                isDisabled={sessions.length > 0}
                            />
                        </FormControl>

                        <Box w="full">
                            <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm" fontWeight="medium">
                                    Progress: {currentPrompt + 1} / {PROMPTS.length}
                                </Text>
                                <Badge colorScheme="brand">{Math.round(progress)}%</Badge>
                            </HStack>
                            <Progress value={progress} colorScheme="brand" />
                        </Box>

                        <Box w="full" p={4} bg="gray.50" borderRadius="md">
                            <Text fontSize="sm" color="gray.400" mb={2}>
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
                        />

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
                            >
                                Complete Prompt
                            </Button>
                        )}

                        <Text fontSize="xs" color="gray.400">
                            {sessions.length} / {PROMPTS.length} prompts completed
                        </Text>
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
}
