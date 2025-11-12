import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Code,
    Badge,
    Alert,
    AlertIcon,
    Button,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td
} from '@chakra-ui/react';
import { BehaviorEvent } from '../sdk/browser';

export default function PrivacyPage() {
    const [sampleData, setSampleData] = useState<{
        events: BehaviorEvent[];
        features: any;
        profile: any;
    } | null>(null);

    useEffect(() => {
        // Generate sample data to show what we collect
        const sampleEvents: BehaviorEvent[] = [
            { type: 'keydown', timestamp: Date.now() - 1000, keyClass: 'letter' },
            { type: 'keyup', timestamp: Date.now() - 950, keyClass: 'letter' },
            { type: 'keydown', timestamp: Date.now() - 800, keyClass: 'letter' },
            { type: 'keyup', timestamp: Date.now() - 750, keyClass: 'letter' },
            { type: 'mousemove', timestamp: Date.now() - 500, deltaX: 5, deltaY: 3 }
        ];

        const sampleFeatures = {
            meanFlight: 150.5,
            stdFlight: 45.2,
            meanHold: 98.3,
            stdHold: 32.1,
            backspaceRate: 0.03,
            bigramMean: 180.7,
            totalKeys: 4,
            mouseAvgSpeed: 0.8
        };

        const sampleProfile = {
            centroid: sampleFeatures,
            stdDevs: {
                meanFlight: 25.0,
                stdFlight: 15.0,
                meanHold: 20.0,
                stdHold: 10.0,
                backspaceRate: 0.02,
                bigramMean: 30.0,
                totalKeys: 5.0,
                mouseAvgSpeed: 0.3
            }
        };

        setSampleData({
            events: sampleEvents,
            features: sampleFeatures,
            profile: sampleProfile
        });
    }, []);

    return (
        <VStack spacing={6} maxW="6xl" mx="auto">
            <Box textAlign="center">
                <Heading size="lg" color="white">Privacy & Data Transparency</Heading>
                <Text color="white" mt={2}>
                    See exactly what data FluxAuth collects — and what it doesn't
                </Text>
            </Box>

            <Alert status="success" borderRadius="md" bg="rgba(34, 197, 94, 0.2)" borderColor="green.400">
                <AlertIcon color="green.400" />
                <Box>
                    <Text fontWeight="bold" color="white">Privacy-First Design</Text>
                    <Text fontSize="sm" color="gray.200">
                        We never store what you type — only timing patterns. Your actual keystrokes are never captured or transmitted.
                    </Text>
                </Box>
            </Alert>

            {/* What We Collect */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4} color="white">What We Collect</Heading>
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <Text fontWeight="bold" color="white" mb={2}>
                                ✅ Behavioral Events (Anonymized)
                            </Text>
                            <Text fontSize="sm" color="white" mb={2}>
                                We capture only the timing and classification of keystrokes:
                            </Text>
                            {sampleData && (
                                <Code
                                    display="block"
                                    whiteSpace="pre"
                                    p={4}
                                    borderRadius="md"
                                    bg="gray.800"
                                    color="green.300"
                                    fontSize="xs"
                                    overflowX="auto"
                                >
                                    {JSON.stringify(sampleData.events, null, 2)}
                                </Code>
                            )}
                            <Text fontSize="xs" color="white" mt={2} opacity={0.7}>
                                Notice: No actual characters, only keyClass (letter/digit/backspace/other) and timestamps
                            </Text>
                        </Box>

                        <Box>
                            <Text fontWeight="bold" color="white" mb={2}>
                                ✅ Extracted Features (Statistical Patterns)
                            </Text>
                            <Text fontSize="sm" color="white" mb={2}>
                                From events, we compute statistical features:
                            </Text>
                            {sampleData && (
                                <Code
                                    display="block"
                                    whiteSpace="pre"
                                    p={4}
                                    borderRadius="md"
                                    bg="gray.800"
                                    color="blue.300"
                                    fontSize="xs"
                                    overflowX="auto"
                                >
                                    {JSON.stringify(sampleData.features, null, 2)}
                                </Code>
                            )}
                            <Text fontSize="xs" color="white" mt={2} opacity={0.7}>
                                These are mathematical patterns: mean flight time, hold time, etc. No text content.
                            </Text>
                        </Box>

                        <Box>
                            <Text fontWeight="bold" color="white" mb={2}>
                                ✅ Enrollment Profile (Your Baseline)
                            </Text>
                            <Text fontSize="sm" color="white" mb={2}>
                                Your unique typing fingerprint:
                            </Text>
                            {sampleData && (
                                <Code
                                    display="block"
                                    whiteSpace="pre"
                                    p={4}
                                    borderRadius="md"
                                    bg="gray.800"
                                    color="purple.300"
                                    fontSize="xs"
                                    overflowX="auto"
                                >
                                    {JSON.stringify(sampleData.profile, null, 2)}
                                </Code>
                            )}
                        </Box>
                    </VStack>
                </CardBody>
            </Card>

            {/* What We DON'T Collect */}
            <Card w="full" bg="red.900" borderTop="4px" borderColor="red.500">
                <CardBody>
                    <Heading size="md" mb={4} color="white">What We DON'T Collect</Heading>
                    <VStack spacing={3} align="stretch">
                        <HStack>
                            <Badge colorScheme="red" fontSize="sm">❌</Badge>
                            <Text color="white">Actual keystroke values (letters, numbers, symbols)</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="red" fontSize="sm">❌</Badge>
                            <Text color="white">Passwords or any text content</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="red" fontSize="sm">❌</Badge>
                            <Text color="white">Screen content or screenshots</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="red" fontSize="sm">❌</Badge>
                            <Text color="white">Personal information (name, email, etc.)</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="red" fontSize="sm">❌</Badge>
                            <Text color="white">IP addresses or location data</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="red" fontSize="sm">❌</Badge>
                            <Text color="white">Mouse click positions (only movement deltas)</Text>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>

            {/* Data Flow */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Data Flow & Storage</Heading>
                    <Accordion allowToggle>
                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Text fontWeight="bold" color="white">
                                        Client-Side (Browser)
                                    </Text>
                                </Box>
                                <AccordionIcon color="white" />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                                <VStack align="stretch" spacing={2}>
                                    <Text color="white" fontSize="sm">
                                        • Events captured in memory during active session
                                    </Text>
                                    <Text color="white" fontSize="sm">
                                        • Optional: Enrollment profile stored in localStorage (offline mode)
                                    </Text>
                                    <Text color="white" fontSize="sm">
                                        • No data sent until you explicitly enroll or authenticate
                                    </Text>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Text fontWeight="bold" color="white">
                                        Server-Side (Backend)
                                    </Text>
                                </Box>
                                <AccordionIcon color="white" />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                                <VStack align="stretch" spacing={2}>
                                    <Text color="white" fontSize="sm">
                                        • Events received only during enrollment/authentication
                                    </Text>
                                    <Text color="white" fontSize="sm">
                                        • Features extracted server-side (or client-side in offline mode)
                                    </Text>
                                    <Text color="white" fontSize="sm">
                                        • Enrollment profiles stored in SQLite database
                                    </Text>
                                    <Text color="white" fontSize="sm">
                                        • Session scores logged for analytics (trust score, anomaly flag)
                                    </Text>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        <AccordionItem>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    <Text fontWeight="bold" color="white">
                                        Data Retention
                                    </Text>
                                </Box>
                                <AccordionIcon color="white" />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th color="white">Data Type</Th>
                                            <Th color="white">Retention</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        <Tr>
                                            <Td color="white">Enrollment Profile</Td>
                                            <Td color="white">Until user deletion</Td>
                                        </Tr>
                                        <Tr>
                                            <Td color="white">Session Events</Td>
                                            <Td color="white">30 days (configurable)</Td>
                                        </Tr>
                                        <Tr>
                                            <Td color="white">Trust Scores</Td>
                                            <Td color="white">90 days for analytics</Td>
                                        </Tr>
                                    </Tbody>
                                </Table>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                </CardBody>
            </Card>

            {/* Compliance */}
            <Card w="full" bg="green.900" borderTop="4px" borderColor="green.500">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Privacy Compliance</Heading>
                    <VStack spacing={3} align="stretch">
                        <HStack>
                            <Badge colorScheme="green">✓</Badge>
                            <Text color="white">GDPR Compliant — No PII collected</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="green">✓</Badge>
                            <Text color="white">CCPA Compliant — Minimal data collection</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="green">✓</Badge>
                            <Text color="white">Open Source — Full transparency</Text>
                        </HStack>
                        <HStack>
                            <Badge colorScheme="green">✓</Badge>
                            <Text color="white">Offline Mode — Data never leaves device</Text>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>

            {/* Export Your Data */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Export Your Data</Heading>
                    <Text color="white" mb={4}>
                        You can export all your behavioral data at any time:
                    </Text>
                    <Button
                        colorScheme="brand"
                        onClick={() => {
                            const userId = prompt('Enter your User ID:');
                            if (userId) {
                                const profile = localStorage.getItem(`fluxauth_profile_${userId}`);
                                if (profile) {
                                    const blob = new Blob([profile], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `fluxauth_profile_${userId}.json`;
                                    a.click();
                                } else {
                                    alert('No profile found for this user ID');
                                }
                            }
                        }}
                    >
                        Export My Profile
                    </Button>
                </CardBody>
            </Card>
        </VStack>
    );
}

