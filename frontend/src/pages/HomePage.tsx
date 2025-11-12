import { Box, Heading, Text, VStack, Button, HStack, Card, CardBody } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    return (
        <VStack spacing={16} align="stretch" py={8}>
            {/* Hero */}
            <Box textAlign="center" py={12}>
                <Heading size="3xl" mb={6} color="brand.400" letterSpacing="tight">
                    FluxAuth
                </Heading>
                <Text fontSize="2xl" color="white" maxW="3xl" mx="auto" mb={4} fontWeight="600">
                    Continuous Behavioral Authentication
                </Text>
                <Text fontSize="lg" color="white" maxW="2xl" mx="auto">
                    Verify users throughout their session based on typing patterns—not just passwords
                </Text>
            </Box>

            {/* CTA */}
            <Card maxW="xl" mx="auto">
                <CardBody>
                    <VStack spacing={4}>
                        <Heading size="md" color="brand.400">Quick Start</Heading>
                        <Text fontSize="sm" color="white" textAlign="center">
                            Test the system in under 2 minutes
                        </Text>
                        <VStack spacing={3} align="stretch" w="full">
                            <HStack>
                                <Box w="6px" h="6px" bg="brand.400" borderRadius="full" />
                                <Text fontSize="sm" color="white">Enroll your typing pattern</Text>
                            </HStack>
                            <HStack>
                                <Box w="6px" h="6px" bg="brand.400" borderRadius="full" />
                                <Text fontSize="sm" color="white">Authenticate and see your trust score</Text>
                            </HStack>
                        </VStack>
                        <Button as={Link} to="/enroll" colorScheme="brand" size="lg" w="full">
                            Start Demo
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            {/* Features */}
            <Box>
                <Heading size="lg" mb={8} textAlign="center" color="white">
                    Core Features
                </Heading>
                <VStack spacing={4}>
                    <HStack spacing={4} align="stretch" w="full">
                        <Card flex={1}>
                            <CardBody>
                                <HStack mb={3}>
                                    <Box w="3px" h="20px" bg="brand.400" />
                                    <Heading size="sm" color="brand.400">Live Monitor</Heading>
                                </HStack>
                                <Text color="white" fontSize="sm">
                                    Real-time session tracking with continuous trust scoring
                                </Text>
                            </CardBody>
                        </Card>

                        <Card flex={1}>
                            <CardBody>
                                <HStack mb={3}>
                                    <Box w="3px" h="20px" bg="red.400" />
                                    <Heading size="sm" color="red.400">Bot Detection</Heading>
                                </HStack>
                                <Text color="white" fontSize="sm">
                                    Identifies automated attacks and non-human patterns
                                </Text>
                            </CardBody>
                        </Card>

                        <Card flex={1}>
                            <CardBody>
                                <HStack mb={3}>
                                    <Box w="3px" h="20px" bg="purple.400" />
                                    <Heading size="sm" color="purple.400">Fairness</Heading>
                                </HStack>
                                <Text color="white" fontSize="sm">
                                    Unbiased detection across all device types
                                </Text>
                            </CardBody>
                        </Card>
                    </HStack>

                    <HStack spacing={4} align="stretch" w="full">
                        <Card flex={1}>
                            <CardBody>
                                <HStack mb={3}>
                                    <Box w="3px" h="20px" bg="accent.500" />
                                    <Heading size="sm" color="accent.500">Policy Engine</Heading>
                                </HStack>
                                <Text color="white" fontSize="sm">
                                    Custom security rules with conditional logic
                                </Text>
                            </CardBody>
                        </Card>

                        <Card flex={1}>
                            <CardBody>
                                <HStack mb={3}>
                                    <Box w="3px" h="20px" bg="green.400" />
                                    <Heading size="sm" color="green.400">Edge SDK</Heading>
                                </HStack>
                                <Text color="white" fontSize="sm">
                                    Client-side scoring for maximum privacy
                                </Text>
                            </CardBody>
                        </Card>
                    </HStack>
                </VStack>
            </Box>

            {/* Navigation */}
            <HStack spacing={4} justify="center" flexWrap="wrap">
                <Button as={Link} to="/live-monitor" variant="outline" size="md">
                    Live Monitor
                </Button>
                <Button as={Link} to="/dashboard" variant="outline" size="md">
                    Bot Detection
                </Button>
                <Button as={Link} to="/transparency" variant="outline" size="md">
                    Fairness
                </Button>
                <Button as={Link} to="/policy" variant="outline" size="md">
                    Policy Rules
                </Button>
            </HStack>
        </VStack>
    );
}
