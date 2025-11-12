import { FeatureVector, ScoreResult, ScoreReason } from './types';

const ANOMALY_THRESHOLD = parseFloat(process.env.ANOMALY_THRESHOLD || '2.5');

/**
 * Detect bot-like behavior patterns
 * Returns true if behavior suggests automation/script
 */
export function detectBotPatterns(testVector: FeatureVector, centroid: FeatureVector, stdDevs: FeatureVector): boolean {
    // Bot detection heuristics:
    
    // 1. Extremely consistent timing (low variance) suggests automation
    const flightVariability = stdDevs.stdFlight / (centroid.meanFlight || 1);
    if (flightVariability < 0.1 && testVector.stdFlight < centroid.stdFlight * 0.5) {
        return true; // Too consistent
    }
    
    // 2. Very fast typing with no variation
    if (testVector.meanFlight < 50 && testVector.stdFlight < 10) {
        return true; // Unnaturally fast and consistent
    }
    
    // 3. Perfect timing (no human-like variation)
    const holdVariability = stdDevs.stdHold / (centroid.meanHold || 1);
    if (holdVariability < 0.05 && testVector.stdHold < 5) {
        return true; // Too perfect
    }
    
    // 4. No backspaces (humans make mistakes)
    if (testVector.backspaceRate < 0.01 && centroid.backspaceRate > 0.03) {
        return true; // Suspiciously perfect typing
    }
    
    // 5. Very high key count with low time variance
    if (testVector.totalKeys > 100 && testVector.stdFlight < 20) {
        return true; // High volume with machine-like consistency
    }
    
    return false;
}

interface ZScores {
    [key: string]: number;
}

/**
 * Score a feature vector against an enrollment profile
 */
export function scoreVector(
    testVector: FeatureVector,
    centroid: FeatureVector,
    stdDevs: FeatureVector
): ScoreResult {
    // Compute z-scores for each feature
    const zscores: ZScores = {};
    const features = Object.keys(centroid) as (keyof FeatureVector)[];

    for (const feature of features) {
        const testVal = testVector[feature];
        const centroidVal = centroid[feature];
        const stdDev = stdDevs[feature];

        // Avoid division by zero
        if (stdDev === 0 || isNaN(stdDev)) {
            zscores[feature] = 0;
        } else {
            zscores[feature] = (testVal - centroidVal) / stdDev;
        }
    }

    // Compute aggregate anomaly score (mean absolute z-score)
    const absZScores = Object.values(zscores).map(Math.abs);
    const meanAbsZScore = absZScores.reduce((sum, z) => sum + z, 0) / absZScores.length;

    // Determine if anomaly
    const isAnomaly = meanAbsZScore > ANOMALY_THRESHOLD;

    // Convert to trust score (0-100)
    // Lower z-score = higher trust
    // Map: 0σ → 100, 2.5σ → 50, 5σ → 0
    const trustScore = Math.max(0, Math.min(100, 100 - (meanAbsZScore / 5) * 100));

    // Generate top reasons (features with highest absolute z-scores)
    const reasons: ScoreReason[] = features
        .map(feature => ({
            feature,
            zscore: zscores[feature],
            absZscore: Math.abs(zscores[feature])
        }))
        .sort((a, b) => b.absZscore - a.absZscore)
        .slice(0, 3)
        .map(({ feature, zscore }) => ({
            code: generateReasonCode(feature, zscore),
            message: generateReasonMessage(feature, zscore),
            feature,
            zscore: parseFloat(zscore.toFixed(2))
        }));

    // Check for bot patterns
    const isBot = detectBotPatterns(testVector, centroid, stdDevs);
    
    return {
        trustScore: parseFloat(trustScore.toFixed(1)),
        isAnomaly: isAnomaly || isBot, // Mark as anomaly if bot detected
        isBot, // Add bot flag
        topReasons: reasons
    };
}

/**
 * Generate reason code for a feature deviation
 */
function generateReasonCode(feature: keyof FeatureVector, zscore: number): string {
    const direction = zscore > 0 ? 'HIGH' : 'LOW';
    const featureName = feature.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '');
    return `${featureName}_${direction}`;
}

/**
 * Generate human-readable reason message
 */
function generateReasonMessage(feature: keyof FeatureVector, zscore: number): string {
    const featureLabels: Record<keyof FeatureVector, string> = {
        meanFlight: 'Flight time',
        stdFlight: 'Flight time variability',
        meanHold: 'Hold time',
        stdHold: 'Hold time variability',
        backspaceRate: 'Backspace rate',
        bigramMean: 'Bigram timing',
        totalKeys: 'Total keystrokes',
        mouseAvgSpeed: 'Mouse speed'
    };

    const label = featureLabels[feature] || feature;
    const absZ = Math.abs(zscore);
    const direction = zscore > 0 ? 'above' : 'below';

    if (absZ < 1) {
        return `${label} is within normal range`;
    } else if (absZ < 2) {
        return `${label} is slightly ${direction} normal (${absZ.toFixed(1)}σ)`;
    } else {
        return `${label} is ${absZ.toFixed(1)} standard deviations ${direction} normal`;
    }
}

/**
 * Create a default enrollment profile for new users
 * This is used when no enrollment data exists yet
 */
export function createDefaultProfile(): { centroid: FeatureVector; stdDevs: FeatureVector } {
    // Default values based on typical typing patterns
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

    // Default standard deviations (wide tolerance for new users)
    const stdDevs: FeatureVector = {
        meanFlight: 50,
        stdFlight: 30,
        meanHold: 40,
        stdHold: 20,
        backspaceRate: 0.03,
        bigramMean: 60,
        totalKeys: 20,
        mouseAvgSpeed: 0.3
    };

    return { centroid, stdDevs };
}
