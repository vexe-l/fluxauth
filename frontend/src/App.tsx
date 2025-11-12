import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Box, Container, Flex, Heading, Button, HStack, Badge } from '@chakra-ui/react';
import HomePage from './pages/HomePage';
import LiveMonitorPage from './pages/LiveMonitorPage';
import EnrollPage from './pages/EnrollPage';
import TestPage from './pages/TestPage';
import DashboardPage from './pages/DashboardPage';
import DocsPage from './pages/DocsPage';
import TransparencyPage from './pages/TransparencyPage';
import PolicyRulesPage from './pages/PolicyRulesPage';
import ContextualRiskPage from './pages/ContextualRiskPage';
import PrivacyPage from './pages/PrivacyPage';
import GlassmorphismBackground from './components/GlassmorphismBackground';

function App() {
    return (
        <BrowserRouter>
            <Box minH="100vh" position="relative">
                <GlassmorphismBackground />

                <Box position="relative" zIndex={1}>
                    {/* Navigation */}
                    <Box
                        bg="rgba(26, 26, 26, 0.95)"
                        backdropFilter="blur(10px)"
                        borderBottom="1px"
                        borderColor="brand.500"
                        py={4}
                        position="sticky"
                        top={0}
                        zIndex={100}
                    >
                        <Container maxW="container.xl">
                            <Flex justify="space-between" align="center">
                                <HStack spacing={3}>
                                    <Box
                                        w="8px"
                                        h="8px"
                                        bg="brand.500"
                                        borderRadius="full"
                                        animation="pulse 2s infinite"
                                    />
                                    <Heading size="md" color="brand.500" fontWeight="bold" letterSpacing="wider">
                                        FLUXAUTH
                                    </Heading>
                                    <Badge colorScheme="green" fontSize="xs">LIVE</Badge>
                                </HStack>
                                <HStack spacing={2}>
                                    <Button as={Link} to="/" variant="ghost" size="sm">
                                        Home
                                    </Button>
                                    <Button as={Link} to="/enroll" colorScheme="brand" size="sm">
                                        Try It
                                    </Button>
                                    <Button as={Link} to="/live-monitor" variant="ghost" size="sm">
                                        Monitor
                                    </Button>
                                    <Button as={Link} to="/dashboard" variant="ghost" size="sm">
                                        Detection
                                    </Button>
                                    <Button as={Link} to="/transparency" variant="ghost" size="sm">
                                        Fairness
                                    </Button>
                                    <Button as={Link} to="/privacy" variant="ghost" size="sm">
                                        Privacy
                                    </Button>
                                    <Button as={Link} to="/policy" variant="ghost" size="sm">
                                        Policy
                                    </Button>
                                    <Button as={Link} to="/contextual-risk" variant="ghost" size="sm">
                                        AI Risk
                                    </Button>
                                    <Button as={Link} to="/docs" variant="ghost" size="sm">
                                        Docs
                                    </Button>
                                </HStack>
                            </Flex>
                        </Container>
                    </Box>

                    {/* Routes */}
                    <Container maxW="container.xl" py={8}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/live-monitor" element={<LiveMonitorPage />} />
                            <Route path="/enroll" element={<EnrollPage />} />
                            <Route path="/test" element={<TestPage />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/transparency" element={<TransparencyPage />} />
                            <Route path="/privacy" element={<PrivacyPage />} />
                            <Route path="/policy" element={<PolicyRulesPage />} />
                            <Route path="/contextual-risk" element={<ContextualRiskPage />} />
                            <Route path="/docs" element={<DocsPage />} />
                        </Routes>
                    </Container>
                </Box>
            </Box>
        </BrowserRouter>
    );
}

export default App;
