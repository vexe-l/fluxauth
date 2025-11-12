import { useEffect, useRef, useState } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { BehaviorEvent } from '../sdk/browser';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TypingVisualizationProps {
    events: BehaviorEvent[];
    isActive: boolean;
}

export default function TypingVisualization({ events, isActive }: TypingVisualizationProps) {
    const [chartData, setChartData] = useState<{
        labels: string[];
        datasets: any[];
    }>({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        if (!isActive || events.length === 0) {
            setChartData({
                labels: [],
                datasets: []
            });
            return;
        }

        // Extract typing rhythm (inter-key intervals)
        const keyEvents = events.filter(e => e.type === 'keydown' || e.type === 'keyup');
        const intervals: number[] = [];
        const timestamps: string[] = [];

        let lastKeyTime = 0;
        for (let i = 0; i < keyEvents.length; i++) {
            const event = keyEvents[i];
            if (event.type === 'keydown') {
                if (lastKeyTime > 0) {
                    const interval = event.timestamp - lastKeyTime;
                    intervals.push(interval);
                    timestamps.push(`${i}`);
                }
                lastKeyTime = event.timestamp;
            }
        }

        // Keep only last 50 data points for performance
        const recentIntervals = intervals.slice(-50);
        const recentTimestamps = timestamps.slice(-50);

        setChartData({
            labels: recentTimestamps,
            datasets: [
                {
                    label: 'Inter-key Interval (ms)',
                    data: recentIntervals,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }
            ]
        });
    }, [events, isActive]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0 // Disable animation for real-time updates
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => `${context.parsed.y.toFixed(0)}ms`
                }
            }
        },
        scales: {
            x: {
                display: false,
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Time (ms)',
                    color: 'white'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: 'white'
                }
            }
        }
    };

    if (!isActive) {
        return (
            <Box w="full" h="200px" bg="rgba(0, 0, 0, 0.2)" borderRadius="md" p={4}>
                <VStack h="full" justify="center">
                    <Text color="white" fontSize="sm" opacity={0.7}>
                        Start typing to see your typing rhythm visualization
                    </Text>
                </VStack>
            </Box>
        );
    }

    return (
        <Box w="full" h="200px" bg="rgba(0, 0, 0, 0.2)" borderRadius="md" p={4}>
            <Text fontSize="sm" color="white" mb={2} fontWeight="medium">
                Live Typing Rhythm
            </Text>
            {chartData.labels.length > 0 ? (
                <Line data={chartData} options={options} />
            ) : (
                <VStack h="full" justify="center">
                    <Text color="white" fontSize="sm" opacity={0.7}>
                        Capturing typing patterns...
                    </Text>
                </VStack>
            )}
        </Box>
    );
}

