import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    Heading,
    Text,
    Alert,
    AlertIcon,
    Button,
    Box,
    HStack,
    Badge
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';

interface SessionLockModalProps {
    isOpen: boolean;
    onClose: () => void;
    policyAction: {
        type: string;
        message: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
    };
    trustScore?: number;
    reasons?: Array<{ code: string; message: string }>;
}

export default function SessionLockModal({
    isOpen,
    onClose,
    policyAction,
    trustScore,
    reasons
}: SessionLockModalProps) {
    const isBlocked = policyAction.type === 'BLOCK_SESSION';
    const severityColors = {
        low: 'blue',
        medium: 'orange',
        high: 'red',
        critical: 'red'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" closeOnOverlayClick={!isBlocked}>
            <ModalOverlay bg="blackAlpha.800" />
            <ModalContent bg="gray.900" border="2px" borderColor={severityColors[policyAction.severity] + '.500'}>
                <ModalHeader>
                    <HStack spacing={3}>
                        <WarningIcon color={severityColors[policyAction.severity] + '.500'} boxSize={6} />
                        <Heading size="lg" color="white">
                            {isBlocked ? 'Session Locked' : 'Security Alert'}
                        </Heading>
                    </HStack>
                </ModalHeader>
                {!isBlocked && <ModalCloseButton color="white" />}

                <ModalBody pb={6}>
                    <VStack spacing={4} align="stretch">
                        <Alert
                            status={policyAction.severity === 'critical' ? 'error' : 'warning'}
                            borderRadius="md"
                        >
                            <AlertIcon />
                            <Box>
                                <Text fontWeight="bold">{policyAction.message}</Text>
                                <Text fontSize="sm" mt={1}>
                                    Policy Action: {policyAction.type}
                                </Text>
                            </Box>
                        </Alert>

                        {trustScore !== undefined && (
                            <Box p={4} bg="rgba(0, 0, 0, 0.3)" borderRadius="md">
                                <HStack justify="space-between">
                                    <Text color="white" fontWeight="medium">
                                        Trust Score:
                                    </Text>
                                    <Badge
                                        colorScheme={trustScore > 70 ? 'green' : trustScore > 40 ? 'orange' : 'red'}
                                        fontSize="lg"
                                        px={3}
                                        py={1}
                                    >
                                        {trustScore} / 100
                                    </Badge>
                                </HStack>
                            </Box>
                        )}

                        {reasons && reasons.length > 0 && (
                            <Box>
                                <Text color="white" fontWeight="medium" mb={2}>
                                    Detection Reasons:
                                </Text>
                                <VStack spacing={2} align="stretch">
                                    {reasons.map((reason, idx) => (
                                        <Box
                                            key={idx}
                                            p={2}
                                            bg="rgba(239, 68, 68, 0.2)"
                                            borderRadius="md"
                                            borderLeft="3px solid"
                                            borderColor="red.500"
                                        >
                                            <Text fontSize="sm" color="white">
                                                {reason.message}
                                            </Text>
                                        </Box>
                                    ))}
                                </VStack>
                            </Box>
                        )}

                        {isBlocked ? (
                            <VStack spacing={3} mt={4}>
                                <Text color="white" textAlign="center">
                                    Your session has been locked due to suspicious activity detected by our behavioral
                                    authentication system.
                                </Text>
                                <Text fontSize="sm" color="white" opacity={0.8} textAlign="center">
                                    For security reasons, you'll need to re-authenticate. Please contact support if you
                                    believe this is an error.
                                </Text>
                                <Button
                                    colorScheme="red"
                                    size="lg"
                                    w="full"
                                    onClick={() => {
                                        // Redirect to login or home
                                        window.location.href = '/';
                                    }}
                                >
                                    Return to Login
                                </Button>
                            </VStack>
                        ) : (
                            <VStack spacing={3} mt={4}>
                                <Text color="white" textAlign="center" fontSize="sm">
                                    {policyAction.type === 'REQUIRE_OTP' &&
                                        'Please complete additional verification to continue.'}
                                    {policyAction.type === 'NOTIFY_ADMIN' &&
                                        'An administrator has been notified of this activity.'}
                                    {policyAction.type === 'REQUIRE_CAPTCHA' &&
                                        'Please complete a CAPTCHA to verify you are human.'}
                                </Text>
                                <Button colorScheme="brand" onClick={onClose} w="full">
                                    Acknowledge
                                </Button>
                            </VStack>
                        )}
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

