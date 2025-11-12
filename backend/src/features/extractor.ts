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

    // Extract navigation patterns
    const scrollEvents = events.filter(e => e.type === 'scroll');
    const clickEvents = events.filter(e => e.type === 'click');
    const focusEvents = events.filter(e => e.type === 'focus');
    
    const sessionDuration = events.length > 0 
        ? events[events.length - 1].timestamp - events[0].timestamp 
        : 1;
    
    const scrollDeltas = scrollEvents
        .map((e: any) => e.scrollDelta || 0)
        .filter((d: number) => d > 0);
    
    const actionIntervals: number[] = [];
    for (let i = 1; i < events.length; i++) {
        const interval = events[i].timestamp - events[i - 1].timestamp;
        if (interval > 0 && interval < 10000) { // Sanity check: < 10 seconds
            actionIntervals.push(interval);
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
        mouseAvgSpeed: totalMouseTime > 0 ? totalMouseDistance / totalMouseTime : 0,
        // Navigation patterns
        scrollFrequency: sessionDuration > 0 ? (scrollEvents.length / sessionDuration) * 1000 : 0,
        clickFrequency: sessionDuration > 0 ? (clickEvents.length / sessionDuration) * 1000 : 0,
        avgScrollSpeed: scrollDeltas.length > 0 ? mean(scrollDeltas) : 0,
        focusChanges: focusEvents.length,
        avgTimeBetweenActions: actionIntervals.length > 0 ? mean(actionIntervals) : 0
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
        mouseAvgSpeed: 0,
        scrollFrequency: 0,
        clickFrequency: 0,
        avgScrollSpeed: 0,
        focusChanges: 0,
        avgTimeBetweenActions: 0
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
        centroid.scrollFrequency = (centroid.scrollFrequency || 0) + (vector.scrollFrequency || 0);
        centroid.clickFrequency = (centroid.clickFrequency || 0) + (vector.clickFrequency || 0);
        centroid.avgScrollSpeed = (centroid.avgScrollSpeed || 0) + (vector.avgScrollSpeed || 0);
        centroid.focusChanges = (centroid.focusChanges || 0) + (vector.focusChanges || 0);
        centroid.avgTimeBetweenActions = (centroid.avgTimeBetweenActions || 0) + (vector.avgTimeBetweenActions || 0);
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
    centroid.scrollFrequency = (centroid.scrollFrequency || 0) / n;
    centroid.clickFrequency = (centroid.clickFrequency || 0) / n;
    centroid.avgScrollSpeed = (centroid.avgScrollSpeed || 0) / n;
    centroid.focusChanges = (centroid.focusChanges || 0) / n;
    centroid.avgTimeBetweenActions = (centroid.avgTimeBetweenActions || 0) / n;

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
        mouseAvgSpeed: 0,
        scrollFrequency: 0,
        clickFrequency: 0,
        avgScrollSpeed: 0,
        focusChanges: 0,
        avgTimeBetweenActions: 0
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
        const scrollFreq = vector.scrollFrequency || 0;
        const clickFreq = vector.clickFrequency || 0;
        const scrollSpeed = vector.avgScrollSpeed || 0;
        const focus = vector.focusChanges || 0;
        const actionTime = vector.avgTimeBetweenActions || 0;
        variances.scrollFrequency = (variances.scrollFrequency || 0) + Math.pow(scrollFreq - (centroid.scrollFrequency || 0), 2);
        variances.clickFrequency = (variances.clickFrequency || 0) + Math.pow(clickFreq - (centroid.clickFrequency || 0), 2);
        variances.avgScrollSpeed = (variances.avgScrollSpeed || 0) + Math.pow(scrollSpeed - (centroid.avgScrollSpeed || 0), 2);
        variances.focusChanges = (variances.focusChanges || 0) + Math.pow(focus - (centroid.focusChanges || 0), 2);
        variances.avgTimeBetweenActions = (variances.avgTimeBetweenActions || 0) + Math.pow(actionTime - (centroid.avgTimeBetweenActions || 0), 2);
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
        mouseAvgSpeed: Math.sqrt(variances.mouseAvgSpeed / n),
        scrollFrequency: Math.sqrt((variances.scrollFrequency || 0) / n),
        clickFrequency: Math.sqrt((variances.clickFrequency || 0) / n),
        avgScrollSpeed: Math.sqrt((variances.avgScrollSpeed || 0) / n),
        focusChanges: Math.sqrt((variances.focusChanges || 0) / n),
        avgTimeBetweenActions: Math.sqrt((variances.avgTimeBetweenActions || 0) / n)
    };
}
