import { describe, it, expect } from 'vitest';
import { extractFeatures, computeCentroid, computeStdDevs } from './extractor';
import { BehaviorEvent, FeatureVector } from './types';

describe('Feature Extractor', () => {
    describe('extractFeatures', () => {
        it('should extract flight times correctly', () => {
            const events: BehaviorEvent[] = [
                { type: 'keydown', timestamp: 100, keyClass: 'letter' },
                { type: 'keyup', timestamp: 150, keyClass: 'letter' },
                { type: 'keydown', timestamp: 200, keyClass: 'letter' },
                { type: 'keyup', timestamp: 250, keyClass: 'letter' }
            ];

            const features = extractFeatures(events);

            // Flight time: time between keyup and next keydown
            // 200 - 150 = 50ms
            expect(features.meanFlight).toBe(50);
        });

        it('should extract hold times correctly', () => {
            const events: BehaviorEvent[] = [
                { type: 'keydown', timestamp: 100, keyClass: 'letter' },
                { type: 'keyup', timestamp: 150, keyClass: 'letter' },
                { type: 'keydown', timestamp: 200, keyClass: 'letter' },
                { type: 'keyup', timestamp: 260, keyClass: 'letter' }
            ];

            const features = extractFeatures(events);

            // Hold times: 150-100=50ms, 260-200=60ms
            // Mean: (50+60)/2 = 55ms
            expect(features.meanHold).toBe(55);
        });

        it('should calculate backspace rate', () => {
            const events: BehaviorEvent[] = [
                { type: 'keydown', timestamp: 100, keyClass: 'letter' },
                { type: 'keyup', timestamp: 150, keyClass: 'letter' },
                { type: 'keydown', timestamp: 200, keyClass: 'backspace' },
                { type: 'keyup', timestamp: 250, keyClass: 'backspace' },
                { type: 'keydown', timestamp: 300, keyClass: 'letter' },
                { type: 'keyup', timestamp: 350, keyClass: 'letter' }
            ];

            const features = extractFeatures(events);

            // 2 backspace events out of 6 total = 1/3
            expect(features.backspaceRate).toBeCloseTo(1 / 3, 2);
        });

        it('should handle empty events', () => {
            const features = extractFeatures([]);

            expect(features.meanFlight).toBe(0);
            expect(features.meanHold).toBe(0);
            expect(features.backspaceRate).toBe(0);
        });

        it('should extract mouse speed', () => {
            const events: BehaviorEvent[] = [
                { type: 'mousemove', timestamp: 100, deltaX: 0, deltaY: 0 },
                { type: 'mousemove', timestamp: 200, deltaX: 100, deltaY: 0 },
                { type: 'mousemove', timestamp: 300, deltaX: 200, deltaY: 0 }
            ];

            const features = extractFeatures(events);

            // Distance: sqrt(100^2) + sqrt(100^2) = 200
            // Time: 100ms + 100ms = 200ms
            // Speed: 200/200 = 1.0
            expect(features.mouseAvgSpeed).toBeCloseTo(1.0, 1);
        });
    });

    describe('computeCentroid', () => {
        it('should compute mean of feature vectors', () => {
            const vectors: FeatureVector[] = [
                {
                    meanFlight: 100,
                    stdFlight: 50,
                    meanHold: 80,
                    stdHold: 30,
                    backspaceRate: 0.1,
                    bigramMean: 150,
                    totalKeys: 50,
                    mouseAvgSpeed: 1.0
                },
                {
                    meanFlight: 200,
                    stdFlight: 60,
                    meanHold: 100,
                    stdHold: 40,
                    backspaceRate: 0.2,
                    bigramMean: 180,
                    totalKeys: 60,
                    mouseAvgSpeed: 1.5
                }
            ];

            const centroid = computeCentroid(vectors);

            expect(centroid.meanFlight).toBe(150);
            expect(centroid.stdFlight).toBe(55);
            expect(centroid.meanHold).toBe(90);
            expect(centroid.backspaceRate).toBe(0.15);
        });

        it('should throw error for empty vectors', () => {
            expect(() => computeCentroid([])).toThrow();
        });
    });

    describe('computeStdDevs', () => {
        it('should compute standard deviations', () => {
            const vectors: FeatureVector[] = [
                {
                    meanFlight: 100,
                    stdFlight: 50,
                    meanHold: 80,
                    stdHold: 30,
                    backspaceRate: 0.1,
                    bigramMean: 150,
                    totalKeys: 50,
                    mouseAvgSpeed: 1.0
                },
                {
                    meanFlight: 200,
                    stdFlight: 50,
                    meanHold: 80,
                    stdHold: 30,
                    backspaceRate: 0.1,
                    bigramMean: 150,
                    totalKeys: 50,
                    mouseAvgSpeed: 1.0
                }
            ];

            const centroid = computeCentroid(vectors);
            const stdDevs = computeStdDevs(vectors, centroid);

            // meanFlight: centroid=150, values=[100,200], variance=5000, std=70.71
            expect(stdDevs.meanFlight).toBeCloseTo(50, 0);

            // Other features have no variance
            expect(stdDevs.stdFlight).toBe(0);
            expect(stdDevs.meanHold).toBe(0);
        });
    });
});
