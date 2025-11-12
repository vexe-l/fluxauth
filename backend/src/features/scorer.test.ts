import { describe, it, expect } from 'vitest';
import { scoreVector, createDefaultProfile } from './scorer';
import { FeatureVector } from './types';

describe('Scorer', () => {
    describe('scoreVector', () => {
        it('should return high trust score for matching vector', () => {
            const centroid: FeatureVector = {
                meanFlight: 150,
                stdFlight: 80,
                meanHold: 100,
                stdHold: 50,
                backspaceRate: 0.05,
                bigramMean: 200,
                totalKeys: 50,
                mouseAvgSpeed: 0.5
            };

            const stdDevs: FeatureVector = {
                meanFlight: 30,
                stdFlight: 20,
                meanHold: 25,
                stdHold: 15,
                backspaceRate: 0.02,
                bigramMean: 40,
                totalKeys: 10,
                mouseAvgSpeed: 0.2
            };

            // Test vector very close to centroid
            const testVector: FeatureVector = {
                meanFlight: 155,
                stdFlight: 82,
                meanHold: 98,
                stdHold: 52,
                backspaceRate: 0.05,
                bigramMean: 205,
                totalKeys: 52,
                mouseAvgSpeed: 0.52
            };

            const result = scoreVector(testVector, centroid, stdDevs);

            expect(result.trustScore).toBeGreaterThan(90);
            expect(result.isAnomaly).toBe(false);
            expect(result.topReasons).toHaveLength(3);
        });

        it('should return low trust score for anomalous vector', () => {
            const centroid: FeatureVector = {
                meanFlight: 150,
                stdFlight: 80,
                meanHold: 100,
                stdHold: 50,
                backspaceRate: 0.05,
                bigramMean: 200,
                totalKeys: 50,
                mouseAvgSpeed: 0.5
            };

            const stdDevs: FeatureVector = {
                meanFlight: 30,
                stdFlight: 20,
                meanHold: 25,
                stdHold: 15,
                backspaceRate: 0.02,
                bigramMean: 40,
                totalKeys: 10,
                mouseAvgSpeed: 0.2
            };

            // Test vector far from centroid (attacker)
            const testVector: FeatureVector = {
                meanFlight: 300, // 5σ away
                stdFlight: 150,
                meanHold: 200,
                stdHold: 100,
                backspaceRate: 0.2,
                bigramMean: 400,
                totalKeys: 100,
                mouseAvgSpeed: 2.0
            };

            const result = scoreVector(testVector, centroid, stdDevs);

            expect(result.trustScore).toBeLessThan(50);
            expect(result.isAnomaly).toBe(true);
            expect(result.topReasons[0].zscore).toBeGreaterThan(2.5);
        });

        it('should handle zero standard deviation gracefully', () => {
            const centroid: FeatureVector = {
                meanFlight: 150,
                stdFlight: 80,
                meanHold: 100,
                stdHold: 50,
                backspaceRate: 0.05,
                bigramMean: 200,
                totalKeys: 50,
                mouseAvgSpeed: 0.5
            };

            const stdDevs: FeatureVector = {
                meanFlight: 0, // Zero std dev
                stdFlight: 20,
                meanHold: 25,
                stdHold: 15,
                backspaceRate: 0.02,
                bigramMean: 40,
                totalKeys: 10,
                mouseAvgSpeed: 0.2
            };

            const testVector: FeatureVector = {
                meanFlight: 200,
                stdFlight: 82,
                meanHold: 98,
                stdHold: 52,
                backspaceRate: 0.05,
                bigramMean: 205,
                totalKeys: 52,
                mouseAvgSpeed: 0.52
            };

            const result = scoreVector(testVector, centroid, stdDevs);

            // Should not crash or return NaN
            expect(result.trustScore).toBeGreaterThanOrEqual(0);
            expect(result.trustScore).toBeLessThanOrEqual(100);
            expect(isNaN(result.trustScore)).toBe(false);
        });

        it('should include top 3 reasons', () => {
            const centroid: FeatureVector = {
                meanFlight: 150,
                stdFlight: 80,
                meanHold: 100,
                stdHold: 50,
                backspaceRate: 0.05,
                bigramMean: 200,
                totalKeys: 50,
                mouseAvgSpeed: 0.5
            };

            const stdDevs: FeatureVector = {
                meanFlight: 30,
                stdFlight: 20,
                meanHold: 25,
                stdHold: 15,
                backspaceRate: 0.02,
                bigramMean: 40,
                totalKeys: 10,
                mouseAvgSpeed: 0.2
            };

            const testVector: FeatureVector = {
                meanFlight: 240, // 3σ away
                stdFlight: 140,  // 3σ away
                meanHold: 175,   // 3σ away
                stdHold: 52,
                backspaceRate: 0.05,
                bigramMean: 205,
                totalKeys: 52,
                mouseAvgSpeed: 0.52
            };

            const result = scoreVector(testVector, centroid, stdDevs);

            expect(result.topReasons).toHaveLength(3);
            expect(result.topReasons[0].feature).toBeDefined();
            expect(result.topReasons[0].code).toBeDefined();
            expect(result.topReasons[0].message).toBeDefined();
            expect(result.topReasons[0].zscore).toBeDefined();
        });
    });

    describe('createDefaultProfile', () => {
        it('should return valid default profile', () => {
            const { centroid, stdDevs } = createDefaultProfile();

            expect(centroid.meanFlight).toBeGreaterThan(0);
            expect(stdDevs.meanFlight).toBeGreaterThan(0);

            // All features should be defined
            expect(centroid.meanHold).toBeDefined();
            expect(centroid.backspaceRate).toBeDefined();
            expect(stdDevs.meanHold).toBeDefined();
            expect(stdDevs.backspaceRate).toBeDefined();
        });
    });
});
