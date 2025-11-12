import { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Card,
    CardBody,
    Button,
    Input,
    Select,
    Textarea,
    FormControl,
    FormLabel,
    Switch,
    Badge,
    IconButton,
    Code,
    Divider,
    useToast,
    Alert,
    AlertIcon
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { API_CONFIG } from '../config';

interface PolicyRule {
    id: string;
    name: string;
    condition: string;
    action: string;
    enabled: boolean;
    priority: number;
}

export default function PolicyRulesPage() {
    const toast = useToast();
    const [rules, setRules] = useState<PolicyRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch rules from backend
    useEffect(() => {
        const fetchRules = async () => {
            try {
                const response = await fetch('/api/policy/rules', {
                    headers: {
                        'x-api-key': API_CONFIG.API_KEY
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setRules(data.rules || []);
                } else {
                    // If no rules exist, use default rules
                    setRules([
                        {
                            id: 'rule-1',
                            name: 'Block Low Trust Score',
                            condition: 'IF trustScore < 40 THEN',
                            action: 'REQUIRE_OTP',
                            enabled: true,
                            priority: 1
                        },
                        {
                            id: 'rule-2',
                            name: 'Flag Anomalous Behavior',
                            condition: 'IF isAnomaly = true THEN',
                            action: 'NOTIFY_ADMIN',
                            enabled: true,
                            priority: 2
                        },
                        {
                            id: 'rule-3',
                            name: 'High Risk Session',
                            condition: 'IF trustScore < 30 AND isAnomaly = true THEN',
                            action: 'BLOCK_SESSION',
                            enabled: false,
                            priority: 3
                        }
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch rules:', error);
                // Use default rules on error
                setRules([
                    {
                        id: 'rule-1',
                        name: 'Block Low Trust Score',
                        condition: 'IF trustScore < 40 THEN',
                        action: 'REQUIRE_OTP',
                        enabled: true,
                        priority: 1
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRules();
    }, []);

    const [newRule, setNewRule] = useState({
        name: '',
        condition: '',
        action: 'REQUIRE_OTP'
    });

    const handleAddRule = async () => {
        if (!newRule.name || !newRule.condition) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all required fields',
                status: 'error',
                duration: 3000
            });
            return;
        }

        try {
            const response = await fetch('/api/policy/rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_CONFIG.API_KEY
                },
                body: JSON.stringify({
                    name: newRule.name,
                    condition: newRule.condition,
                    action: newRule.action,
                    enabled: true,
                    priority: rules.length + 1
                })
            });

            if (response.ok) {
                const data = await response.json();
                setRules([...rules, { id: data.id, ...data.rule }]);
                setNewRule({ name: '', condition: '', action: 'REQUIRE_OTP' });

                toast({
                    title: 'Rule added',
                    description: 'Policy rule has been created and will be enforced',
                    status: 'success',
                    duration: 3000
                });
            } else {
                throw new Error('Failed to create rule');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create policy rule',
                status: 'error',
                duration: 3000
            });
        }
    };

    const toggleRule = async (id: string) => {
        const rule = rules.find(r => r.id === id);
        if (!rule) return;

        const newEnabled = !rule.enabled;
        try {
            const response = await fetch(`/api/policy/rules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_CONFIG.API_KEY
                },
                body: JSON.stringify({ enabled: newEnabled })
            });

            if (response.ok) {
                setRules(rules.map(r => r.id === id ? { ...r, enabled: newEnabled } : r));
                toast({
                    title: newEnabled ? 'Rule enabled' : 'Rule disabled',
                    status: 'success',
                    duration: 2000
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update rule',
                status: 'error',
                duration: 3000
            });
        }
    };

    const deleteRule = async (id: string) => {
        try {
            const response = await fetch(`/api/policy/rules/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-api-key': API_CONFIG.API_KEY
                }
            });

            if (response.ok) {
                setRules(rules.filter(r => r.id !== id));
                toast({
                    title: 'Rule deleted',
                    status: 'info',
                    duration: 2000
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete rule',
                status: 'error',
                duration: 3000
            });
        }
    };

    return (
        <VStack spacing={6} maxW="6xl" mx="auto">
            <Box textAlign="center">
                <HStack justify="center" mb={2}>
                    <Heading size="lg" color="white">Custom Policy Engine</Heading>
                    <Badge colorScheme="green" fontSize="sm">✅ Backend Enforced</Badge>
                </HStack>
                <Text color="white" mt={2}>
                    Admin UI for writing policies as logic: IF trustScore&lt;40 THEN REQUIRE_OTP
                </Text>
                <Alert status="success" borderRadius="md" mt={2} bg="green.900" color="white">
                    <AlertIcon />
                    <Box>
                        <Text fontWeight="bold" color="white">✅ Policy Engine Active</Text>
                        <Text fontSize="sm" color="white">
                            Rules are now automatically executed by the backend. Policy actions are evaluated on every session score.
                        </Text>
                    </Box>
                </Alert>
            </Box>

            {/* Add New Rule */}
            <Card w="full" bg="brand.800" borderTop="4px" borderColor="brand.400">
                <CardBody>
                    <Heading size="md" mb={4} color="white">
                        <AddIcon mr={2} boxSize={4} />
                        Create New Policy Rule
                    </Heading>

                    <VStack spacing={4} align="stretch">
                        <FormControl>
                            <FormLabel color="white">Rule Name</FormLabel>
                            <Input
                                placeholder="e.g., Block Suspicious Login"
                                value={newRule.name}
                                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                bg="white"
                                color="gray.800"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel color="white">Condition (Logic)</FormLabel>
                            <Textarea
                                placeholder="IF trustScore < 40 AND isAnomaly = true THEN"
                                value={newRule.condition}
                                onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                                bg="white"
                                color="gray.800"
                                fontFamily="mono"
                                fontSize="sm"
                            />
                            <Text fontSize="xs" color="white" mt={1}>
                                Available variables: trustScore, isAnomaly, userId, sessionId
                            </Text>
                        </FormControl>

                        <FormControl>
                            <FormLabel color="white">Action</FormLabel>
                            <Select
                                value={newRule.action}
                                onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                                bg="white"
                                color="gray.800"
                            >
                                <option value="REQUIRE_OTP">Require OTP</option>
                                <option value="BLOCK_SESSION">Block Session</option>
                                <option value="NOTIFY_ADMIN">Notify Admin</option>
                                <option value="LOG_EVENT">Log Event</option>
                                <option value="REQUIRE_CAPTCHA">Require CAPTCHA</option>
                            </Select>
                        </FormControl>

                        <Button
                            colorScheme="brand"
                            onClick={handleAddRule}
                            leftIcon={<AddIcon />}
                        >
                            Add Policy Rule
                        </Button>
                    </VStack>
                </CardBody>
            </Card>

            {/* Existing Rules */}
            <Card w="full" bg="rgba(0, 0, 0, 0.2)">
                <CardBody>
                    <Heading size="md" mb={4} color="white">Active Policy Rules</Heading>

                    <VStack spacing={4} align="stretch">
                        {rules.map((rule) => (
                            <Card key={rule.id} variant="outline" bg={rule.enabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)'}>
                                <CardBody>
                                    <HStack justify="space-between" mb={3}>
                                        <HStack>
                                            <Badge colorScheme="purple">Priority {rule.priority}</Badge>
                                            <Heading size="sm" color={rule.enabled ? 'white' : 'gray.400'}>{rule.name}</Heading>
                                            <Badge colorScheme={rule.enabled ? 'green' : 'gray'}>
                                                {rule.enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </HStack>
                                        <HStack>
                                            <Switch
                                                isChecked={rule.enabled}
                                                onChange={() => toggleRule(rule.id)}
                                                colorScheme="brand"
                                            />
                                            <IconButton
                                                aria-label="Edit rule"
                                                icon={<EditIcon />}
                                                size="sm"
                                                variant="ghost"
                                            />
                                            <IconButton
                                                aria-label="Delete rule"
                                                icon={<DeleteIcon />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => deleteRule(rule.id)}
                                            />
                                        </HStack>
                                    </HStack>

                                    <Divider mb={3} />

                                    <VStack align="stretch" spacing={2}>
                                        <Box>
                                            <Text fontSize="xs" color={rule.enabled ? 'white' : 'gray.400'} mb={1} fontWeight="bold">CONDITION:</Text>
                                            <Code colorScheme="blue" p={2} borderRadius="md" w="full" display="block" bg="blue.900" color="white">
                                                {rule.condition}
                                            </Code>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color={rule.enabled ? 'white' : 'gray.400'} mb={1} fontWeight="bold">ACTION:</Text>
                                            <Badge colorScheme="accent" fontSize="sm" p={2}>
                                                {rule.action}
                                            </Badge>
                                        </Box>
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                    </VStack>
                </CardBody>
            </Card>

            {/* Example Syntax */}
            <Card w="full" bg="brand.800">
                <CardBody>
                    <Heading size="sm" mb={3} color="white">Policy Syntax Examples</Heading>
                    <VStack align="stretch" spacing={2} fontSize="sm" fontFamily="mono">
                        <Code p={2} bg="gray.800" color="green.300" display="block">IF trustScore &lt; 40 THEN REQUIRE_OTP</Code>
                        <Code p={2} bg="gray.800" color="green.300" display="block">IF isAnomaly = true THEN NOTIFY_ADMIN</Code>
                        <Code p={2} bg="gray.800" color="green.300" display="block">IF trustScore &lt; 30 AND isAnomaly = true THEN BLOCK_SESSION</Code>
                        <Code p={2} bg="gray.800" color="green.300" display="block">IF userId = "admin" THEN LOG_EVENT</Code>
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
}
