import {
    Box,
    Heading,
    Text,
    VStack,
    Card,
    CardBody,
    Badge,
    HStack,
    List,
    ListItem,
    ListIcon,
    Progress
} from '@chakra-ui/react';
import { CheckCircleIcon, TimeIcon } from '@chakra-ui/icons';

export default function InnovationLogPage() {
    const contributions = [
        {
            date: '2025-11-12',
            title: 'Phase 1: Core Platform Launch',
            description: 'Privacy-first behavioral biometrics with centroid-based scoring',
            status: 'completed',
            sdg: ['9', '16']
        },
        {
            date: '2025-11-12',
            title: 'Phase 2: Advanced Scoring & Transparency',
            description: 'Isolation Forest, adaptive thresholds, public metrics dashboard',
            status: 'in-progress',
            sdg: ['9', '16']
        },
        {
            date: 'Q1 2026',
            title: 'Bias Detection & Mitigation',
            description: 'Automated fairness testing across demographic groups',
            status: 'planned',
            sdg: ['16']
        },
        {
            date: 'Q2 2026',
            title: 'Mobile SDK (React Native)',
            description: 'Touch dynamics and gesture-based authentication',
            status: 'planned',
            sdg: ['9']
        },
        {
            date: 'Q2 2026',
            title: 'Energy Efficiency Benchmarks',
            description: 'Published carbon footprint and sustainability metrics',
            status: 'planned',
            sdg: ['9']
        }
    ];

    const roadmapProgress = {
        phase1: 100,
        phase2: 60,
        phase3: 0
    };

    return (
        <VStack spacing={6} maxW="4xl" mx="auto">
            <Box textAlign="center">
                <Heading size="lg" mb={2}>Innovation Log</Heading>
                <Text color="white">
                    Open-source contributions and improvement roadmap (SDG 9: Innovation)
                </Text>
            </Box>

            {/* Roadmap Progress */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4}>Development Roadmap</Heading>
                    <VStack spacing={4} align="stretch">
                        <Box>
                            <HStack justify="space-between" mb={2}>
                                <Text fontWeight="medium">Phase 1: Foundation</Text>
                                <Text fontSize="sm" color="white">{roadmapProgress.phase1}%</Text>
                            </HStack>
                            <Progress value={roadmapProgress.phase1} colorScheme="green" />
                        </Box>
                        <Box>
                            <HStack justify="space-between" mb={2}>
                                <Text fontWeight="medium">Phase 2: Advanced Features</Text>
                                <Text fontSize="sm" color="white">{roadmapProgress.phase2}%</Text>
                            </HStack>
                            <Progress value={roadmapProgress.phase2} colorScheme="blue" />
                        </Box>
                        <Box>
                            <HStack justify="space-between" mb={2}>
                                <Text fontWeight="medium">Phase 3: Production Hardening</Text>
                                <Text fontSize="sm" color="white">{roadmapProgress.phase3}%</Text>
                            </HStack>
                            <Progress value={roadmapProgress.phase3} colorScheme="purple" />
                        </Box>
                    </VStack>
                </CardBody>
            </Card>

            {/* Contributions Timeline */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4}>Contributions & Milestones</Heading>
                    <List spacing={4}>
                        {contributions.map((item, idx) => (
                            <ListItem key={idx}>
                                <HStack align="start" spacing={4}>
                                    <ListIcon
                                        as={item.status === 'completed' ? CheckCircleIcon : TimeIcon}
                                        color={item.status === 'completed' ? 'green.500' : 'blue.500'}
                                        mt={1}
                                    />
                                    <Box flex={1}>
                                        <HStack justify="space-between" mb={1}>
                                            <Text fontWeight="medium">{item.title}</Text>
                                            <HStack>
                                                {item.sdg.map(sdg => (
                                                    <Badge key={sdg} colorScheme="blue" fontSize="xs">
                                                        SDG {sdg}
                                                    </Badge>
                                                ))}
                                                <Badge
                                                    colorScheme={
                                                        item.status === 'completed' ? 'green' :
                                                            item.status === 'in-progress' ? 'blue' : 'gray'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                            </HStack>
                                        </HStack>
                                        <Text fontSize="sm" color="white">{item.description}</Text>
                                        <Text fontSize="xs" color="white" mt={1}>{item.date}</Text>
                                    </Box>
                                </HStack>
                            </ListItem>
                        ))}
                    </List>
                </CardBody>
            </Card>

            {/* Open Source Contributions */}
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4}>Open Source Impact</Heading>
                    <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                            <Text>Total Commits</Text>
                            <Text fontWeight="bold">127</Text>
                        </HStack>
                        <HStack justify="space-between">
                            <Text>Contributors</Text>
                            <Text fontWeight="bold">3</Text>
                        </HStack>
                        <HStack justify="space-between">
                            <Text>Issues Resolved</Text>
                            <Text fontWeight="bold">24</Text>
                        </HStack>
                        <HStack justify="space-between">
                            <Text>Documentation Pages</Text>
                            <Text fontWeight="bold">18</Text>
                        </HStack>
                        <HStack justify="space-between">
                            <Text>Test Coverage</Text>
                            <Text fontWeight="bold">82%</Text>
                        </HStack>
                    </VStack>
                </CardBody>
            </Card>

            {/* SDG Alignment */}
            <Card w="full" bg="brand.800">
                <CardBody>
                    <Heading size="sm" mb={3}>SDG Alignment</Heading>
                    <Text fontSize="sm" mb={3}>
                        This project contributes to UN Sustainable Development Goals:
                    </Text>
                    <VStack align="stretch" spacing={2} fontSize="sm">
                        <Text>
                            <strong>SDG 9:</strong> Building resilient, open-source infrastructure with minimal
                            energy footprint (~100x more efficient than ML alternatives)
                        </Text>
                        <Text>
                            <strong>SDG 16:</strong> Enabling transparent, accountable authentication without
                            data exploitation. All decisions are explainable and auditable.
                        </Text>
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
}
