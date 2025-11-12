export type KeyClass = 'letter' | 'digit' | 'backspace' | 'other';

export interface BehaviorEvent {
    type: 'keydown' | 'keyup' | 'mousemove';
    timestamp: number;
    keyClass?: KeyClass;
    deltaX?: number;
    deltaY?: number;
}

export interface FeatureVector {
    meanFlight: number;
    stdFlight: number;
    meanHold: number;
    stdHold: number;
    backspaceRate: number;
    bigramMean: number;
    totalKeys: number;
    mouseAvgSpeed: number;
}

export interface EnrollmentProfile {
    userId: string;
    centroid: FeatureVector;
    sampleCount: number;
    createdAt: number;
    updatedAt: number;
}

export interface ScoreResult {
    trustScore: number;
    isAnomaly: boolean;
    isBot?: boolean; // Bot detection flag
    topReasons: ScoreReason[];
}

export interface ScoreReason {
    code: string;
    message: string;
    feature: keyof FeatureVector;
    zscore: number;
}
