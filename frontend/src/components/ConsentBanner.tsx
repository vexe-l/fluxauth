import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    VStack,
    List,
    ListItem,
    ListIcon,
    useDisclosure
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

interface ConsentBannerProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export default function ConsentBanner({ isOpen, onAccept, onDecline }: ConsentBannerProps) {
    const { isOpen: isDetailsOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Modal isOpen={isOpen} onClose={onDecline} closeOnOverlayClick={false} size="lg">
                <ModalOverlay backdropFilter="blur(4px)" />
                <ModalContent bg="#1A1A1A" color="white" border="1px solid" borderColor="#2A2A2A">
                    <ModalHeader color="white">Behavioral Data Collection Consent</ModalHeader>
                    <ModalBody>
                        <VStack align="start" spacing={4}>
                            <Text color="white">
                                This application collects behavioral biometric data to verify your identity.
                                Your consent is required before any data collection begins.
                            </Text>
                            <Text fontSize="sm" fontStyle="italic" color="blue.300">
                                This system is designed with UN SDG 16 principles: transparency, accountability,
                                and respect for user rights. You have full control over your data.
                            </Text>

                            <List spacing={2}>
                                <ListItem color="white">
                                    <ListIcon as={CheckCircleIcon} color="green.400" />
                                    Keystroke timing (when keys are pressed and released)
                                </ListItem>
                                <ListItem color="white">
                                    <ListIcon as={CheckCircleIcon} color="green.400" />
                                    Key categories (letter, digit, backspace, other)
                                </ListItem>
                                <ListItem color="white">
                                    <ListIcon as={CheckCircleIcon} color="green.400" />
                                    Mouse movement patterns (relative deltas only)
                                </ListItem>
                                <ListItem color="white">
                                    <ListIcon as={WarningIcon} color="red.400" />
                                    We DO NOT collect what you type (no raw text)
                                </ListItem>
                                <ListItem color="white">
                                    <ListIcon as={WarningIcon} color="red.400" />
                                    We DO NOT collect screen content or absolute mouse positions
                                </ListItem>
                            </List>

                            <Text fontSize="sm" color="gray.300">
                                You can revoke consent and stop data collection at any time by closing the session.
                                You also have the right to access, export, and delete your data.
                            </Text>

                            <Button variant="link" size="sm" onClick={onOpen} color="blue.300" _hover={{ color: "blue.200" }}>
                                Learn more about our privacy practices
                            </Button>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onDecline} color="white" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}>
                            Decline
                        </Button>
                        <Button colorScheme="brand" onClick={onAccept} bg="brand.600" color="white" _hover={{ bg: "brand.500" }}>
                            Accept & Continue
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Privacy Details Modal */}
            <Modal isOpen={isDetailsOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent bg="#1A1A1A" color="white" border="1px solid" borderColor="#2A2A2A">
                    <ModalHeader color="white">Privacy & Data Handling</ModalHeader>
                    <ModalBody>
                        <VStack align="start" spacing={4}>
                            <Text fontWeight="bold" color="white">What We Collect:</Text>
                            <Text fontSize="sm" color="gray.200">
                                We capture anonymized behavioral patterns including keystroke timing,
                                key categories, and mouse movement deltas. This data is used to build
                                a unique behavioral profile for authentication.
                            </Text>

                            <Text fontWeight="bold" color="white">What We Don't Collect:</Text>
                            <Text fontSize="sm" color="gray.200">
                                We never capture the actual text you type, specific key values, screen
                                content, or absolute cursor positions. All data is anonymized at the
                                source before transmission.
                            </Text>

                            <Text fontWeight="bold" color="white">Data Retention:</Text>
                            <Text fontSize="sm" color="gray.200">
                                Session data is retained for 30 days. Enrollment profiles are kept
                                until you request deletion. You can export or delete your data at any time.
                            </Text>

                            <Text fontWeight="bold" color="white">Security:</Text>
                            <Text fontSize="sm" color="gray.200">
                                All communication is encrypted. API keys are required for access.
                                Data is validated and sanitized on both client and server.
                            </Text>

                            <Text fontWeight="bold" color="white">Your Rights (SDG 16):</Text>
                            <Text fontSize="sm" color="gray.200">
                                You have the right to access, export, and delete your data at any time.
                                You can withdraw consent without penalty. All decisions are explainable
                                and you can challenge incorrect results.
                            </Text>

                            <Text fontSize="sm" color="gray.400" fontStyle="italic">
                                This is a Phase-1 prototype. Production deployments require additional
                                security hardening. See SECURITY.md for details.
                            </Text>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={onClose} bg="brand.600" color="white" _hover={{ bg: "brand.500" }}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
