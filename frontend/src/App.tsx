import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Box, Container, Flex, Heading, Button, HStack } from '@chakra-ui/react';
import HomePage from './pages/HomePage';
import LiveMonitorPage from './pages/LiveMonitorPage';
import EnrollPage from './pages/EnrollPage';
import TestPage from './pages/TestPage';
import DashboardPage from './pages/DashboardPage';
import DocsPage from './pages/DocsPage';
import TransparencyPage from './pages/TransparencyPage';
import PolicyRulesPage from './pages/PolicyRulesPage';
import GlassmorphismBackground from './components/GlassmorphismBackground';

function App() {
    return (
        <BrowserRouter>
            <Box minH="100vh" position="relative">
                <GlassmorphismBackground />

                <Box position="relative" zIndex={1}>
                    {/* Navigation */}
                    <Box bg="navy.500" borderBottom="2px" borderColor="brand.400" py={4}>
                        <Container maxW="container.xl">
                            <Flex justify="space-between" align="center">
                                <Heading size="md" color="white" fontWeight="bold" letterSpacing="wide">
                                    FLUXAUTH
                                </Heading>
                                <HStack spacing={4}>
                                    <Button as={Link} to="/" variant="ghost" size="sm" color="white" _hover={{ bg: 'brand.400', color: 'navy.500' }}>
                                        Home
                                    </Button>
                                    <Button as={Link} to="/live-monitor" variant="ghost" size="sm" color="white" _hover={{ bg: 'brand.400', color: 'navy.500' }}>
                                        Live Monitor
                                    </Button>
                                    <Button as={Link} to="/dashboard" variant="ghost" size="sm" color="white" _hover={{ bg: 'brand.400', color: 'navy.500' }}>
                                        Dashboard
                                    </Button>
                                    <Button as={Link} to="/transparency" variant="ghost" size="sm" color="white" _hover={{ bg: 'brand.400', color: 'navy.500' }}>
                                        Transparency
                                    </Button>
                                    <Button as={Link} to="/policy" variant="ghost" size="sm" color="white" _hover={{ bg: 'brand.400', color: 'navy.500' }}>
                                        Policy Rules
                                    </Button>
                                    <Button as={Link} to="/test" colorScheme="accent" size="sm">
                                        Test SDK
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
                            <Route path="/policy" element={<PolicyRulesPage />} />
                            <Route path="/docs" element={<DocsPage />} />
                        </Routes>
                    </Container>
                </Box>
            </Box>
        </BrowserRouter>
    );
}

export default App;
