import { describe, it, expect } from 'vitest';
import { IsolationForest } from './isolationForest';
import { FeatureVector } from './types';

describe('IsolationForest', () => {
    const normalData: FeatureVector[] = [
        { meanFlight: 150, stdFlight: 50, meanHold: 100, stdHold: 30, backspaceRate: 0.05, bigramMean: 200, totalKeys: 50, mouseAvgSpeed: 0.5 },
        { meanFlight: 155, stdFlight: 52, meanHold: 98, stdHold: 32, backspaceRate: 0.06, bigramMean: 205, totalKeys: 52, mouseAvgSpeed: 0.52 },
        { meanFlight: 148, stdFlight: 48, meanHold: 102, stdHold: 28, backspaceRate: 0.04, bigramMean: 198, totalKeys: 48, mouseAvgSpeed: 0.48 },
        { meanFlight: 152, stdFlight: 51, meanHold: 101, stdHold: 31, backspaceRate: 0.05, bigramMean: 202, totalKeys: 51, mouseAvgSpeed: 0.51 }
    ];

    const anomalyData: FeatureVector = {
        meanFlight: 300, stdFlight: 150, meanHold: 200, stdHold: 100,
        backspaceRate: 0.2, bigramMean: 400, totalKeys: 100, mouseAvgSpeed: 2.0
    };

    it('should train without errors', () => {
        const forest = new IsolationForest(10, 4, 4);
        expect(() => forest.fit(normalData)).not.toThrow();
    });

    it('should score normal data as low anomaly', () => {
        const forest = new IsolationForest(50, 4, 4);
        forest.fit(normalData);

        const score = forest.score(normalData[0]);
        expect(score).toBeLessThan(0.6);
    });

    it('should score anomalous data as high anomaly', () => {
        const forest = new IsolationForest(50, 4, 4);
        forest.fit(normalData);

        const score = forest.score(anomalyData);
        expect(score).toBeGreaterThan(0.6);
    });

    it('should provide feature importances', () => {
        const forest = new IsolationForest(20, 4, 4);
        forest.fit(normalData);

        const importances = forest.getFeatureImportances();
        expect(Object.keys(importances)).toHaveLength(8);

        const total = Object.values(importances).reduce((a, b) => a + b, 0);
        expect(total).toBeCloseTo(1.0, 1);
    });

    it('should serialize and deserialize', () => {
        const forest = new IsolationForest(10, 4, 4);
        forest.fit(normalData);

        const json = forest.toJSON();
        const loaded = IsolationForest.fromJSON(json);

        const originalScore = forest.score(normalData[0]);
        const loadedScore = loaded.score(normalData[0]);

        expect(loadedScore).toBeCloseTo(originalScore, 2);
    });
});
