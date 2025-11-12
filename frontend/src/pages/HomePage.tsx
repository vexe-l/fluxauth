import { Box, Heading, Text, VStack, Button, HStack, Card, CardBody } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <VStack spacing={8} align="stretch">
            <Box textAlign="center" py={12}>
                <Heading size="2xl" mb={4} color="navy.500">
                    FluxAuth
                </Heading>
                <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto" mb={2}>
                    Adaptive Trust Infrastructure Using Efficient, Edge-Capable Technology
                </Text>
                <Text fontSize="lg" color="brand.500" fontWeight="medium">
                    Privacy-first behavioral biometrics for seamless authentication
                </Text>
                <HStack justify="center" spacing={3} mt={4}>
                    <Badge colorScheme="brand" fontSize="sm" px={3} py={1}>SDG 9: Innovation</Badge>
                    <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>SDG 16: Transparency</Badge>
                </HStack>
            </Box>

            <HStack spacing={4} justify="center">
                <Button as={Link} to="/live-monitor" colorScheme="brand" size="lg">
                    Live Demo
                </Button>
                <Button as={Link} to="/test" colorScheme="accent" size="lg">
                    Test SDK
                </Button>
                <Button as={Link} to="/transparency" variant="outline" size="lg" borderColor="navy.500" color="navy.500">
                    View Metrics
                </Button>
            </HStack>

            <Box py={8}>
                <Heading size="lg" mb={6} textAlign="center" color="navy.500">
                    Post-Phase 3 Features
                </Heading>
                <HStack spacing={6} align="stretch">
                    <Card flex={1} borderTop="4px" borderColor="brand.400">
                        <CardBody>
                            <Heading size="md" mb={3} color="brand.500">
                                1. Live Monitor
                            </Heading>
                            <Text color="gray.600">
                                Real-time behavioral tracking with trust meter updates every few seconds
                            </Text>
                        </CardBody>
                    </Card>

                    <Card flex={1} borderTop="4px" borderColor="red.400">
                        <CardBody>
                            <Heading size="md" mb={3} color="red.500">
                                2. Bot Detection
                            </Heading>
                            <Text color="gray.600">
                                Detects non-human or repetitive behavior using pattern heuristics
                            </Text>
                        </CardBody>
                    </Card>

                    <Card flex={1} borderTop="4px" borderColor="purple.400">
                        <CardBody>
                            <Heading size="md" mb={3} color="purple.500">
                                3. Fairness Dashboard
                            </Heading>
                            <Text color="gray.600">
                                Visualizes metrics per cohort/device with bias reports
                            </Text>
                        </CardBody>
                    </Card>
                </HStack>
                <HStack spacing={6} align="stretch" mt={6}>
                    <Card flex={1} borderTop="4px" borderColor="accent.500">
                        <CardBody>
                            <Heading size="md" mb={3} color="accent.500">
                                4. Policy Engine
                            </Heading>
                            <Text color="gray.600">
                                Admin UI for custom rules: IF trustScore&lt;40 THEN REQUIRE_OTP
                            </Text>
                        </CardBody>
                    </Card>

                    <Card flex={1} borderTop="4px" borderColor="green.400">
                        <CardBody>
                            <Heading size="md" mb={3} color="green.500">
                                5. Edge/Offline SDK
                            </Heading>
                            <Text color="gray.600">
                                Browser SDK scores locally before sending summary — privacy-first
                            </Text>
                        </CardBody>
                    </Card>
                </HStack>
            </Box>

            <Box py={8}>
                <Heading size="lg" mb={6} textAlign="center">
                    Key Features
                </Heading>
                <VStack spacing={4} align="stretch">
                    <Card>
                        <CardBody>
                            <Heading size="sm" mb={2}>
                                🔒 Privacy-First
                            </Heading>
                            <Text color="gray.600">
                                We never capture what you type. Only anonymized timing patterns and key categories.
                            </Text>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Heading size="sm" mb={2}>
                                🚀 Developer-Friendly
                            </Heading>
                            <Text color="gray.600">
                                Simple REST API and lightweight SDK. Integrate in minutes with clear documentation.
                            </Text>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Heading size="sm" mb={2}>
                                📊 Explainable Results
                            </Heading>
                            <Text color="gray.600">
                                Every score includes detailed reasoning with z-scores for each behavioral feature.
                            </Text>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Heading size="sm" mb={2}>
                                🌐 Open Source
                            </Heading>
                            <Text color="gray.600">
                                MIT licensed. Inspect the code, contribute improvements, or self-host.
                            </Text>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardBody>
                            <Heading size="sm" mb={2}>
                                🌍 SDG-Aligned
                            </Heading>
                            <Text color="gray.600">
                                Built with UN SDG 9 (resilient infrastructure) and SDG 16 (transparent institutions) principles.
                                Energy-efficient, accessible, and accountable.
                            </Text>
                        </CardBody>
                    </Card>
                </VStack>
            </Box>
        </VStack>
    );
}
