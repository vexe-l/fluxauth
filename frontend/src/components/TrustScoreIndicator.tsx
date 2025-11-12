import { Box, Text, VStack, keyframes } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface TrustScoreIndicatorProps {
    score: number;
    isAnomaly: boolean;
    animate?: boolean;
}

const pulseRing = keyframes`
  0% { transform: scale(0.95); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(0.95); opacity: 1; }
`;

const fillAnimation = keyframes`
  from { stroke-dashoffset: 440; }
`;

export default function TrustScoreIndicator({ score, isAnomaly, animate = true }: TrustScoreIndicatorProps) {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        if (animate) {
            let current = 0;
            const increment = score / 30;
            const timer = setInterval(() => {
                current += increment;
                if (current >= score) {
                    setDisplayScore(score);
                    clearInterval(timer);
                } else {
                    setDisplayScore(Math.floor(current));
                }
            }, 20);
            return () => clearInterval(timer);
        } else {
            setDisplayScore(score);
        }
    }, [score, animate]);

    const getColor = () => {
        if (isAnomaly) return '#FF6B6B';
        if (score >= 80) return '#51CF66';
        if (score >= 60) return '#FFD93D';
        return '#FF6B6B';
    };

    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (displayScore / 100) * circumference;

    return (
        <VStack spacing={2}>
            <Box position="relative" w="180px" h="180px">
                {/* Pulse ring for anomalies */}
                {isAnomaly && (
                    <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        w="200px"
                        h="200px"
                        borderRadius="full"
                        border="3px solid"
                        borderColor={getColor()}
                        animation={`${pulseRing} 2s ease-in-out infinite`}
                    />
                )}

                {/* SVG Circle */}
                <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background circle */}
                    <circle
                        cx="90"
                        cy="90"
                        r="70"
                        stroke="#E2E8F0"
                        strokeWidth="12"
                        fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="90"
                        cy="90"
                        r="70"
                        stroke={getColor()}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke-dashoffset 0.5s ease',
                            animation: animate ? `${fillAnimation} 1.5s ease-out` : 'none'
                        }}
                    />
                </svg>

                {/* Score text */}
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    textAlign="center"
                >
                    <Text fontSize="4xl" fontWeight="bold" color={getColor()}>
                        {displayScore}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Trust Score
                    </Text>
                </Box>
            </Box>

            {/* Status badge */}
            <Box
                px={4}
                py={1}
                borderRadius="full"
                bg={isAnomaly ? 'red.50' : 'green.50'}
                border="1px solid"
                borderColor={isAnomaly ? 'red.200' : 'green.200'}
            >
                <Text fontSize="sm" fontWeight="medium" color={isAnomaly ? 'red.600' : 'green.600'}>
                    {isAnomaly ? '⚠️ Anomaly Detected' : '✓ Verified'}
                </Text>
            </Box>
        </VStack>
    );
}
