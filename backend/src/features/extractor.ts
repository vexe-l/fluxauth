import { BehaviorEvent, FeatureVector } from './types';

interface KeyEvent {
    timestamp: number;
    type: 'keydown' | 'keyup';
    keyClass: string;
}

/**
 * Extract behavioral features from anonymized event stream
 */
export function extractFeatures(events: BehaviorEvent[]): FeatureVector {
    const keyEvents = events.filter(e => e.type === 'keydown' || e.type === 'keyup') as KeyEvent[];
    const mouseEvents = events.filter(e => e.type === 'mousemove');

    // Sort by timestamp
    keyEvents.sort((a, b) => a.timestamp - b.timestamp);

    // Extract keystroke dynamics
    const flights: number[] = [];
    const holds: number[] = [];
    const bigrams: number[] = [];
    let backspaceCount = 0;

    const keyDownMap = new Map<number, number>();
    let lastKeyUpTime = 0;

    for (let i = 0; i < keyEvents.length; i++) {
        const event = keyEvents[i];

        if (event.type === 'keydown') {
            keyDownMap.set(i, event.timestamp);

            // Flight time: time between previous key release and this key press
            if (lastKeyUpTime > 0) {
                const flight = event.timestamp - lastKeyUpTime;
                if (flight >= 0 && flight < 5000) { // Sanity check: < 5 seconds
                    flights.push(flight);
                }
            }

            // Count backspaces
            if (event.keyClass === 'backspace') {
                backspaceCount++;
            }
        } else if (event.type === 'keyup') {
            const downTime = keyDownMap.get(i - 1);
            if (downTime !== undefined) {
                // Hold time: duration key was pressed
                const hold = event.timestamp - downTime;
                if (hold >= 0 && hold < 2000) { // Sanity check: < 2 seconds
                    holds.push(hold);
                }
            }
            lastKeyUpTime = event.timestamp;

            // Bigram: time between two consecutive key presses
            if (i >= 2) {
                const prevDownTime = keyDownMap.get(i - 2);
                const currDownTime = keyDownMap.get(i - 1);
                if (prevDownTime !== undefined && currDownTime !== undefined) {
                    const bigram = currDownTime - prevDownTime;
                    if (bigram >= 0 && bigram < 5000) {
                        bigrams.push(bigram);
                    }
                }
            }
        }
    }

    // Extract mouse dynamics
    let totalMouseDistance = 0;
    let totalMouseTime = 0;

    for (let i = 1; i < mouseEvents.length; i++) {
        const prev = mouseEvents[i - 1];
        const curr = mouseEvents[i];

        if (prev.deltaX !== undefined && prev.deltaY !== undefined &&
            curr.deltaX !== undefined && curr.deltaY !== undefined) {
            const dx = curr.deltaX - prev.deltaX;
            const dy = curr.deltaY - prev.deltaY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const time = curr.timestamp - prev.timestamp;

            if (time > 0 && time < 1000) { // Sanity check
                totalMouseDistance += distance;
                totalMouseTime += time;
            }
        }
    }

    return {
        meanFlight: mean(flights),
        stdFlight: std(flights),
        meanHold: mean(holds),
        stdHold: std(holds),
        backspaceRate: keyEvents.length > 0 ? backspaceCount / keyEvents.length : 0,
        bigramMean: mean(bigrams),
        totalKeys: keyEvents.length,
        mouseAvgSpeed: totalMouseTime > 0 ? totalMouseDistance / totalMouseTime : 0
    };
}

/**
 * Compute mean of array
 */
function mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Compute standard deviation of array
 */
function std(arr: number[]): number {
    if (arr.length === 0) return 0;
    const m = mean(arr);
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
    return Math.sqrt(variance);
}

/**
 * Compute centroid (mean) of multiple feature vectors
 */
export function computeCentroid(vectors: FeatureVector[]): FeatureVector {
    if (vectors.length === 0) {
        throw new Error('Cannot compute centroid of empty vector set');
    }

    const centroid: FeatureVector = {
        meanFlight: 0,
        stdFlight: 0,
        meanHold: 0,
        stdHold: 0,
        backspaceRate: 0,
        bigramMean: 0,
        totalKeys: 0,
        mouseAvgSpeed: 0
    };

    for (const vector of vectors) {
        centroid.meanFlight += vector.meanFlight;
        centroid.stdFlight += vector.stdFlight;
        centroid.meanHold += vector.meanHold;
        centroid.stdHold += vector.stdHold;
        centroid.backspaceRate += vector.backspaceRate;
        centroid.bigramMean += vector.bigramMean;
        centroid.totalKeys += vector.totalKeys;
        centroid.mouseAvgSpeed += vector.mouseAvgSpeed;
    }

    const n = vectors.length;
    centroid.meanFlight /= n;
    centroid.stdFlight /= n;
    centroid.meanHold /= n;
    centroid.stdHold /= n;
    centroid.backspaceRate /= n;
    centroid.bigramMean /= n;
    centroid.totalKeys /= n;
    centroid.mouseAvgSpeed /= n;

    return centroid;
}

/**
 * Compute standard deviation for each feature across multiple vectors
 */
export function computeStdDevs(vectors: FeatureVector[], centroid: FeatureVector): FeatureVector {
    if (vectors.length === 0) {
        throw new Error('Cannot compute std devs of empty vector set');
    }

    const variances: FeatureVector = {
        meanFlight: 0,
        stdFlight: 0,
        meanHold: 0,
        stdHold: 0,
        backspaceRate: 0,
        bigramMean: 0,
        totalKeys: 0,
        mouseAvgSpeed: 0
    };

    for (const vector of vectors) {
        variances.meanFlight += Math.pow(vector.meanFlight - centroid.meanFlight, 2);
        variances.stdFlight += Math.pow(vector.stdFlight - centroid.stdFlight, 2);
        variances.meanHold += Math.pow(vector.meanHold - centroid.meanHold, 2);
        variances.stdHold += Math.pow(vector.stdHold - centroid.stdHold, 2);
        variances.backspaceRate += Math.pow(vector.backspaceRate - centroid.backspaceRate, 2);
        variances.bigramMean += Math.pow(vector.bigramMean - centroid.bigramMean, 2);
        variances.totalKeys += Math.pow(vector.totalKeys - centroid.totalKeys, 2);
        variances.mouseAvgSpeed += Math.pow(vector.mouseAvgSpeed - centroid.mouseAvgSpeed, 2);
    }

    const n = vectors.length;
    return {
        meanFlight: Math.sqrt(variances.meanFlight / n),
        stdFlight: Math.sqrt(variances.stdFlight / n),
        meanHold: Math.sqrt(variances.meanHold / n),
        stdHold: Math.sqrt(variances.stdHold / n),
        backspaceRate: Math.sqrt(variances.backspaceRate / n),
        bigramMean: Math.sqrt(variances.bigramMean / n),
        totalKeys: Math.sqrt(variances.totalKeys / n),
        mouseAvgSpeed: Math.sqrt(variances.mouseAvgSpeed / n)
    };
}
