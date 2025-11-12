import { useState } from 'react';
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
    useToast
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';

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
    const [rules, setRules] = useState<PolicyRule[]>([
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

    const [newRule, setNewRule] = useState({
        name: '',
        condition: '',
        action: 'REQUIRE_OTP'
    });

    const handleAddRule = () => {
        if (!newRule.name || !newRule.condition) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all required fields',
                status: 'error',
                duration: 3000
            });
            return;
        }

        const rule: PolicyRule = {
            id: `rule-${Date.now()}`,
            name: newRule.name,
            condition: newRule.condition,
            action: newRule.action,
            enabled: true,
            priority: rules.length + 1
        };

        setRules([...rules, rule]);
        setNewRule({ name: '', condition: '', action: 'REQUIRE_OTP' });

        toast({
            title: 'Rule added',
            description: 'Policy rule has been created successfully',
            status: 'success',
            duration: 3000
        });
    };

    const toggleRule = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const deleteRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
        toast({
            title: 'Rule deleted',
            status: 'info',
            duration: 2000
        });
    };

    return (
        <VStack spacing={6} maxW="6xl" mx="auto">
            <Box textAlign="center">
                <Heading size="lg" color="navy.500">Custom Policy Engine</Heading>
                <Text color="gray.600" mt={2}>
                    Admin UI for writing policies as logic: IF trustScore&lt;40 THEN REQUIRE_OTP
                </Text>
            </Box>

            {/* Add New Rule */}
            <Card w="full" bg="brand.50" borderTop="4px" borderColor="brand.400">
                <CardBody>
                    <Heading size="md" mb={4} color="navy.500">
                        <AddIcon mr={2} boxSize={4} />
                        Create New Policy Rule
                    </Heading>

                    <VStack spacing={4} align="stretch">
                        <FormControl>
                            <FormLabel color="navy.500">Rule Name</FormLabel>
                            <Input
                                placeholder="e.g., Block Suspicious Login"
                                value={newRule.name}
                                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                bg="white"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel color="navy.500">Condition (Logic)</FormLabel>
                            <Textarea
                                placeholder="IF trustScore < 40 AND isAnomaly = true THEN"
                                value={newRule.condition}
                                onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                                bg="white"
                                fontFamily="mono"
                                fontSize="sm"
                            />
                            <Text fontSize="xs" color="gray.600" mt={1}>
                                Available variables: trustScore, isAnomaly, userId, sessionId
                            </Text>
                        </FormControl>

                        <FormControl>
                            <FormLabel color="navy.500">Action</FormLabel>
                            <Select
                                value={newRule.action}
                                onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                                bg="white"
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
            <Card w="full">
                <CardBody>
                    <Heading size="md" mb={4} color="navy.500">Active Policy Rules</Heading>

                    <VStack spacing={4} align="stretch">
                        {rules.map((rule) => (
                            <Card key={rule.id} variant="outline" bg={rule.enabled ? 'white' : 'gray.50'}>
                                <CardBody>
                                    <HStack justify="space-between" mb={3}>
                                        <HStack>
                                            <Badge colorScheme="purple">Priority {rule.priority}</Badge>
                                            <Heading size="sm" color="navy.500">{rule.name}</Heading>
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
                                            <Text fontSize="xs" color="gray.600" mb={1}>CONDITION:</Text>
                                            <Code colorScheme="blue" p={2} borderRadius="md" w="full" display="block">
                                                {rule.condition}
                                            </Code>
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.600" mb={1}>ACTION:</Text>
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
            <Card w="full" bg="purple.50">
                <CardBody>
                    <Heading size="sm" mb={3} color="navy.500">Policy Syntax Examples</Heading>
                    <VStack align="stretch" spacing={2} fontSize="sm" fontFamily="mono">
                        <Code p={2}>IF trustScore &lt; 40 THEN REQUIRE_OTP</Code>
                        <Code p={2}>IF isAnomaly = true THEN NOTIFY_ADMIN</Code>
                        <Code p={2}>IF trustScore &lt; 30 AND isAnomaly = true THEN BLOCK_SESSION</Code>
                        <Code p={2}>IF userId = "admin" THEN LOG_EVENT</Code>
                    </VStack>
                </CardBody>
            </Card>
        </VStack>
    );
}
