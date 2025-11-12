import { Box, Container, VStack, Heading, Text, Button, Alert, AlertIcon, AlertTitle, AlertDescription, Code, HStack, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { checkExtensionInstalled, ExtensionStatus } from '../utils/extensionDetector';

interface ExtensionBlockingPageProps {
  reason?: 'missing' | 'suspicious' | 'inactive';
  trustScore?: number;
  details?: string;
  onRetry?: () => void;
}

export default function ExtensionBlockingPage({
  reason = 'missing',
  trustScore,
  details,
  onRetry
}: ExtensionBlockingPageProps) {
  const [status, setStatus] = useState<ExtensionStatus | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkExtension = async () => {
      setChecking(true);
      const extStatus = await checkExtensionInstalled();
      setStatus(extStatus);
      setChecking(false);
    };

    checkExtension();
    const interval = setInterval(checkExtension, 2000);
    return () => clearInterval(interval);
  }, []);

  const getTitle = () => {
    switch (reason) {
      case 'missing':
        return '🔒 Chrome Extension Required';
      case 'suspicious':
        return '⚠️ Suspicious Activity Detected';
      case 'inactive':
        return '⚠️ Extension Not Active';
      default:
        return '🔒 Access Restricted';
    }
  };

  const getDescription = () => {
    switch (reason) {
      case 'missing':
        return 'FluxAuth requires the Chrome extension to be installed for security monitoring. Please install the extension to continue.';
      case 'suspicious':
        return `Your behavior pattern has been flagged as suspicious (Trust Score: ${trustScore || 'N/A'}). For your security, access has been restricted.`;
      case 'inactive':
        return 'The FluxAuth extension is installed but not active. Please enable it in the extension settings.';
      default:
        return 'Access to this application requires the FluxAuth Chrome extension.';
    }
  };

  const getAlertColor = () => {
    switch (reason) {
      case 'missing':
        return 'blue';
      case 'suspicious':
        return 'red';
      case 'inactive':
        return 'orange';
      default:
        return 'blue';
    }
  };

  return (
    <Box minH="100vh" bg="gray.900" color="white" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Heading size="2xl" color="brand.500">
              {getTitle()}
            </Heading>
            <Text fontSize="lg" color="gray.300" maxW="600px">
              {getDescription()}
            </Text>
          </VStack>

          <Alert status={getAlertColor()} borderRadius="md" variant="left-accent">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>
                {reason === 'missing' && 'Installation Required'}
                {reason === 'suspicious' && 'Security Alert'}
                {reason === 'inactive' && 'Activation Required'}
              </AlertTitle>
              <AlertDescription>
                {reason === 'missing' && (
                  <>
                    Download and install the FluxAuth Security extension from the Chrome Web Store.
                    After installation, refresh this page.
                  </>
                )}
                {reason === 'suspicious' && (
                  <>
                    {details || 'Unusual typing patterns detected. This could indicate unauthorized access.'}
                    {trustScore !== undefined && (
                      <Box mt={2}>
                        <Text fontSize="sm" fontWeight="bold">Trust Score: {trustScore}/100</Text>
                        <Text fontSize="xs" mt={1}>
                          A score below 50 indicates high risk. Please contact support if you believe this is an error.
                        </Text>
                      </Box>
                    )}
                  </>
                )}
                {reason === 'inactive' && (
                  <>
                    The extension is installed but monitoring is disabled. Please enable it in the extension popup.
                  </>
                )}
              </AlertDescription>
            </Box>
          </Alert>

          {checking ? (
            <Box textAlign="center" py={8}>
              <Spinner size="xl" color="brand.500" />
              <Text mt={4} color="gray.400">Checking extension status...</Text>
            </Box>
          ) : status && (
            <Box bg="gray.800" p={6} borderRadius="md">
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Extension Status:</Text>
                  <Code colorScheme={status.isInstalled ? 'green' : 'red'}>
                    {status.isInstalled ? 'Installed' : 'Not Installed'}
                  </Code>
                </HStack>
                {status.isInstalled && (
                  <>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Active:</Text>
                      <Code colorScheme={status.isActive ? 'green' : 'orange'}>
                        {status.isActive ? 'Active' : 'Inactive'}
                      </Code>
                    </HStack>
                    {status.sessionId && (
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Session ID:</Text>
                        <Code fontSize="xs">{status.sessionId.substring(0, 16)}...</Code>
                      </HStack>
                    )}
                    {status.trustScore !== undefined && (
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Trust Score:</Text>
                        <Code colorScheme={status.trustScore > 70 ? 'green' : status.trustScore > 50 ? 'yellow' : 'red'}>
                          {status.trustScore}/100
                        </Code>
                      </HStack>
                    )}
                    {status.isAnomaly && (
                      <Alert status="error" borderRadius="md">
                        <AlertIcon />
                        <AlertDescription>
                          Anomaly detected in current session
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </VStack>
            </Box>
          )}

          {reason === 'missing' && (
            <VStack spacing={4}>
              <Button
                as="a"
                href="https://chrome.google.com/webstore"
                target="_blank"
                colorScheme="brand"
                size="lg"
                w="full"
              >
                Open Chrome Web Store
              </Button>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Search for "FluxAuth Security" in the Chrome Web Store
              </Text>
            </VStack>
          )}

          {onRetry && (
            <Button
              onClick={onRetry}
              colorScheme="brand"
              variant="outline"
              size="lg"
              w="full"
            >
              Retry Connection
            </Button>
          )}

          {reason === 'suspicious' && (
            <VStack spacing={2} mt={4}>
              <Button
                colorScheme="red"
                variant="outline"
                size="md"
                w="full"
                onClick={() => {
                  // Clear session and redirect to home
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
              >
                Log Out and Return Home
              </Button>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                If you believe this is an error, please contact support with your Session ID
              </Text>
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
}

