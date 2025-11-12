/**
 * Adaptive scoring with rolling windows and per-user thresholds
 */

import { FeatureVector, ScoreResult, ScoreReason } from './types';
import { scoreVector } from './scorer';
import { IsolationForest } from './isolationForest';

interface AdaptiveProfile {
    userId: string;
    centroid: FeatureVector;
    stdDevs: FeatureVector;
    threshold: number;
    recentScores: number[];
    isolationForest?: IsolationForest;
    lastUpdated: number;
}

export class AdaptiveScorer {
    private profiles: Map<string, AdaptiveProfile> = new Map();
    private windowSize = 10;
    private baseThreshold = 2.5;
    private useIsolationForest = false;

    constructor(useIsolationForest = false) {
        this.useIsolationForest = useIsolationForest;
    }

    /**
     * Initialize or update user profile
     */
    updateProfile(
        userId: string,
        centroid: FeatureVector,
        stdDevs: FeatureVector,
        trainingData?: FeatureVector[]
    ): void {
        let profile = this.profiles.get(userId);

        if (!profile) {
            profile = {
                userId,
                centroid,
                stdDevs,
                threshold: this.baseThreshold,
                recentScores: [],
                lastUpdated: Date.now()
            };
        } else {
            profile.centroid = centroid;
            profile.stdDevs = stdDevs;
            profile.lastUpdated = Date.now();
        }

        // Train isolation forest if enabled and data provided
        if (this.useIsolationForest && trainingData && trainingData.length >= 4) {
            profile.isolationForest = new IsolationForest(100, 256, 8);
            profile.isolationForest.fit(trainingData);
        }

        this.profiles.set(userId, profile);
    }

    /**
     * Score with adaptive threshold
     */
    score(userId: string, testVector: FeatureVector): ScoreResult & { adaptiveThreshold: number } {
        const profile = this.profiles.get(userId);

        if (!profile) {
            throw new Error(`No profile found for user ${userId}`);
        }

        // Get base score using centroid method
        const baseResult = scoreVector(testVector, profile.centroid, profile.stdDevs);

        // Compute z-scores for adaptive threshold
        const zscores = this.computeZScores(testVector, profile.centroid, profile.stdDevs);
        const meanAbsZScore = Object.values(zscores).reduce((sum, z) => sum + Math.abs(z), 0) / Object.keys(zscores).length;

        // If isolation forest is available, combine scores
        let finalScore = baseResult.trustScore;
        let isAnomaly = baseResult.isAnomaly;
        const reasons = [...baseResult.topReasons];

        if (profile.isolationForest) {
            const ifScore = profile.isolationForest.score(testVector);
            const ifTrustScore = (1 - ifScore) * 100;

            // Weighted average: 60% centroid, 40% isolation forest
            finalScore = baseResult.trustScore * 0.6 + ifTrustScore * 0.4;

            // Anomaly if either method flags it
            const ifAnomaly = ifScore > 0.6;
            isAnomaly = baseResult.isAnomaly || ifAnomaly;

            if (ifAnomaly) {
                reasons.push({
                    code: 'ISOLATION_FOREST_ANOMALY',
                    message: `Isolation Forest detected anomalous pattern (score: ${ifScore.toFixed(2)})`,
                    feature: 'combined',
                    zscore: ifScore * 5 // Scale to z-score range
                });
            }
        }

        // Update rolling window
        profile.recentScores.push(meanAbsZScore);
        if (profile.recentScores.length > this.windowSize) {
            profile.recentScores.shift();
        }

        // Adapt threshold based on recent behavior
        const adaptiveThreshold = this.computeAdaptiveThreshold(profile);
        isAnomaly = meanAbsZScore > adaptiveThreshold;

        return {
            trustScore: parseFloat(finalScore.toFixed(1)),
            isAnomaly,
            topReasons: reasons.slice(0, 3),
            adaptiveThreshold: parseFloat(adaptiveThreshold.toFixed(2))
        };
    }

    /**
     * Get user's current adaptive threshold
     */
    getThreshold(userId: string): number {
        const profile = this.profiles.get(userId);
        return profile ? this.computeAdaptiveThreshold(profile) : this.baseThreshold;
    }

    /**
     * Get feature importances (if using isolation forest)
     */
    getFeatureImportances(userId: string): Record<keyof FeatureVector, number> | null {
        const profile = this.profiles.get(userId);
        return profile?.isolationForest?.getFeatureImportances() || null;
    }

    private computeZScores(
        testVector: FeatureVector,
        centroid: FeatureVector,
        stdDevs: FeatureVector
    ): Record<keyof FeatureVector, number> {
        const zscores: Record<string, number> = {};
        const features = Object.keys(centroid) as (keyof FeatureVector)[];

        for (const feature of features) {
            const testVal = testVector[feature];
            const centroidVal = centroid[feature];
            const stdDev = stdDevs[feature];

            if (stdDev === 0 || isNaN(stdDev)) {
                zscores[feature] = 0;
            } else {
                zscores[feature] = (testVal - centroidVal) / stdDev;
            }
        }

        return zscores as Record<keyof FeatureVector, number>;
    }

    private computeAdaptiveThreshold(profile: AdaptiveProfile): number {
        if (profile.recentScores.length < 3) {
            return profile.threshold;
        }

        // Compute mean and std of recent scores
        const mean = profile.recentScores.reduce((a, b) => a + b, 0) / profile.recentScores.length;
        const variance = profile.recentScores.reduce((sum, score) => {
            return sum + Math.pow(score - mean, 2);
        }, 0) / profile.recentScores.length;
        const std = Math.sqrt(variance);

        // Adaptive threshold: base + (mean + 2*std)
        // This allows threshold to increase if user's behavior becomes more variable
        const adaptiveComponent = Math.min(1.0, mean + 2 * std);
        return this.baseThreshold + adaptiveComponent;
    }
}
