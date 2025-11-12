/**
 * BIaaS Browser SDK
 * Lightweight, dependency-free behavioral biometrics capture
 */

export type KeyClass = 'letter' | 'digit' | 'backspace' | 'other';

export interface BehaviorEvent {
  type: 'keydown' | 'keyup' | 'mousemove' | 'click' | 'scroll' | 'focus';
  timestamp: number;
  keyClass?: KeyClass;
  deltaX?: number;
  deltaY?: number;
  scrollDelta?: number;
  clickButton?: 'left' | 'right' | 'middle';
  timeOnPage?: number;
}

export interface SDKConfig {
  apiUrl: string;
  apiKey: string;
  batchInterval?: number;
  enableMouse?: boolean;
  enableNavigation?: boolean; // Enable navigation pattern tracking
  enableDeviceFingerprint?: boolean; // Enable device fingerprinting (requires testing)
  offlineMode?: boolean; // Enable offline scoring
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
  // Navigation patterns
  scrollFrequency?: number;
  clickFrequency?: number;
  avgScrollSpeed?: number;
  focusChanges?: number;
  avgTimeBetweenActions?: number;
}

interface EnrollmentProfile {
  centroid: FeatureVector;
  stdDevs: FeatureVector;
}

export interface ScoreResult {
  trustScore: number;
  isAnomaly: boolean;
  isBot?: boolean; // Bot detection flag
  topReasons: Array<{
    code: string;
    message: string;
    feature: string;
    zscore: number;
  }>;
  aiAnalysis?: string;
  aiExplanation?: string;
  policyAction?: {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  } | null;
}

export class BehaviorSDK {
  private config: Required<SDKConfig>;
  private events: BehaviorEvent[] = [];
  private sessionId: string | null = null;
  private isCapturing = false;
  private batchTimer: number | null = null;
  private lastMousePos = { x: 0, y: 0 };
  private lastScrollY = 0;
  private sessionStartTime = 0;
  private lastActionTime = 0;
  private clickCount = 0;
  private scrollCount = 0;
  private focusCount = 0;

  constructor(config: SDKConfig) {
    this.config = {
      ...config,
      batchInterval: config.batchInterval || 5000,
      enableMouse: config.enableMouse ?? true,
      enableNavigation: config.enableNavigation ?? true,
      enableDeviceFingerprint: config.enableDeviceFingerprint ?? false,
      offlineMode: config.offlineMode ?? false
    };
  }

  /**
   * Start capturing behavioral events
   */
  async startSession(sessionId: string, userId?: string): Promise<void> {
    if (this.isCapturing) {
      console.warn('Session already active');
      return;
    }

    this.sessionId = sessionId;
    this.events = [];
    this.isCapturing = true;
    this.sessionStartTime = Date.now();
    this.lastActionTime = Date.now();
    this.clickCount = 0;
    this.scrollCount = 0;
    this.focusCount = 0;
    this.lastScrollY = window.scrollY || 0;

    // Register session with backend (skip in offline mode)
    if (!this.config.offlineMode) {
      try {
        const response = await fetch(`${this.config.apiUrl}/session/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey
          },
          body: JSON.stringify({ sessionId, userId })
        });

        if (!response.ok) {
          throw new Error(`Failed to start session: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to start session:', error);
        throw error;
      }
    }

    // Attach event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);

    if (this.config.enableMouse) {
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('click', this.handleClick);
    }

    if (this.config.enableNavigation) {
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      window.addEventListener('focus', this.handleFocus);
      window.addEventListener('blur', this.handleBlur);
    }

    // Start batch timer
    this.batchTimer = window.setInterval(() => {
      this.flushEvents();
    }, this.config.batchInterval);
  }

  /**
   * Stop capturing and flush remaining events
   */
  endSession(): void {
    if (!this.isCapturing) {
      return;
    }

    this.isCapturing = false;

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);

    // Clear batch timer
    if (this.batchTimer !== null) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Flush remaining events
    this.flushEvents();

    this.sessionId = null;
  }

  /**
   * Enroll a user with collected sessions
   */
  async enroll(
    userId: string,
    sessions: Array<{ sessionId: string; events: BehaviorEvent[] }>
  ): Promise<void> {
    // Extract features from all sessions
    const vectors = sessions.map(session => this.extractFeatures(session.events));

    // Compute profile
    const centroid = this.computeCentroid(vectors);
    const stdDevs = this.computeStdDevs(vectors, centroid);

    const profile: EnrollmentProfile = { centroid, stdDevs };

    // Store locally for offline mode
    if (this.config.offlineMode) {
      localStorage.setItem(`fluxauth_profile_${userId}`, JSON.stringify(profile));
      console.log(`✅ Profile saved locally for user: ${userId}`);
      console.log('Profile:', profile);
      return Promise.resolve();
    }

    // Send to backend
    try {
      const response = await fetch(`${this.config.apiUrl}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey
        },
        body: JSON.stringify({ userId, sessions })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Enrollment failed');
      }

      // Also store locally for offline fallback
      localStorage.setItem(`fluxauth_profile_${userId}`, JSON.stringify(profile));

      return await response.json();
    } catch (error) {
      console.error('Enrollment failed:', error);
      throw error;
    }
  }

  /**
   * Score a behavioral session
   */
  async score(userId: string, sessionId: string, events: BehaviorEvent[]): Promise<ScoreResult> {
    // Try offline scoring first if enabled or if profile exists locally
    const localProfile = localStorage.getItem(`fluxauth_profile_${userId}`);

    if (this.config.offlineMode || localProfile) {
      if (!localProfile) {
        throw new Error('User not enrolled. Please complete enrollment first.');
      }

      const profile: EnrollmentProfile = JSON.parse(localProfile);
      const testVector = this.extractFeatures(events);
      const result = this.scoreVector(testVector, profile.centroid, profile.stdDevs);

      // Optionally sync to backend in background (non-blocking)
      if (!this.config.offlineMode) {
        this.syncScoreToBackend(userId, sessionId, events).catch(err => {
          console.warn('Background sync failed:', err);
        });
      }

      return result;
    }

    // Online scoring
    try {
      const response = await fetch(`${this.config.apiUrl}/session/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey
        },
        body: JSON.stringify({ userId, sessionId, events })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Scoring failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Scoring failed:', error);
      throw error;
    }
  }

  /**
   * Sync score result to backend (non-blocking)
   */
  private async syncScoreToBackend(
    userId: string,
    sessionId: string,
    events: BehaviorEvent[]
  ): Promise<void> {
    // This is a background operation, don't wait for it
    fetch(`${this.config.apiUrl}/session/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey
      },
      body: JSON.stringify({ userId, sessionId, events })
    }).catch(() => {
      // Silently fail - this is just for analytics
    });
  }

  /**
   * Get captured events (for enrollment)
   */
  getEvents(): BehaviorEvent[] {
    return [...this.events];
  }

  /**
   * Clear captured events
   */
  clearEvents(): void {
    this.events = [];
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.isCapturing) return;

    // Sanitize: only capture key class, never raw key value
    const keyClass = this.classifyKey(e.key);

    this.events.push({
      type: 'keydown',
      timestamp: Date.now(),
      keyClass
    });
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (!this.isCapturing) return;

    const keyClass = this.classifyKey(e.key);

    this.events.push({
      type: 'keyup',
      timestamp: Date.now(),
      keyClass
    });
  };

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.isCapturing) return;

    // Only capture deltas, not absolute positions
    const deltaX = e.clientX - this.lastMousePos.x;
    const deltaY = e.clientY - this.lastMousePos.y;

    this.lastMousePos = { x: e.clientX, y: e.clientY };

    // Throttle mouse events (only capture every 100ms)
    if (this.events.length > 0) {
      const lastEvent = this.events[this.events.length - 1];
      if (lastEvent.type === 'mousemove' && Date.now() - lastEvent.timestamp < 100) {
        return;
      }
    }

    this.events.push({
      type: 'mousemove',
      timestamp: Date.now(),
      deltaX,
      deltaY
    });
    this.lastActionTime = Date.now();
  };

  private handleClick = (e: MouseEvent): void => {
    if (!this.isCapturing) return;

    const button = e.button === 0 ? 'left' : e.button === 2 ? 'right' : 'middle';
    this.clickCount++;

    this.events.push({
      type: 'click',
      timestamp: Date.now(),
      clickButton: button,
      timeOnPage: Date.now() - this.sessionStartTime
    });
    this.lastActionTime = Date.now();
  };

  private handleScroll = (): void => {
    if (!this.isCapturing) return;

    const currentScrollY = window.scrollY || 0;
    const scrollDelta = Math.abs(currentScrollY - this.lastScrollY);
    this.lastScrollY = currentScrollY;

    if (scrollDelta > 5) {
      // Only capture significant scrolls
      this.scrollCount++;
      this.events.push({
        type: 'scroll',
        timestamp: Date.now(),
        scrollDelta,
        timeOnPage: Date.now() - this.sessionStartTime
      });
      this.lastActionTime = Date.now();
    }
  };

  private handleFocus = (): void => {
    if (!this.isCapturing) return;
    this.focusCount++;
    this.events.push({
      type: 'focus',
      timestamp: Date.now(),
      timeOnPage: Date.now() - this.sessionStartTime
    });
    this.lastActionTime = Date.now();
  };

  private handleBlur = (): void => {
    if (!this.isCapturing) return;
    // Track when user loses focus (switches tabs/windows)
    this.lastActionTime = Date.now();
  };

  /**
   * Classify key into anonymized category
   */
  private classifyKey(key: string): KeyClass {
    if (key.length === 1 && /[a-zA-Z]/.test(key)) {
      return 'letter';
    } else if (key.length === 1 && /[0-9]/.test(key)) {
      return 'digit';
    } else if (key === 'Backspace') {
      return 'backspace';
    } else {
      return 'other';
    }
  }

  /**
   * Flush events to backend (internal batching)
   */
  private flushEvents(): void {
    if (this.events.length === 0) {
      return;
    }

    // In a real implementation, you might send events to backend here
    // For now, we just keep them in memory for enrollment/scoring
    console.log(`Captured ${this.events.length} events`);
  }

  // ===== Offline Scoring Functions =====

  /**
   * Extract features from events (ported from backend)
   */
  private extractFeatures(events: BehaviorEvent[]): FeatureVector {
    const keyEvents = events.filter(e => e.type === 'keydown' || e.type === 'keyup');
    const mouseEvents = events.filter(e => e.type === 'mousemove');

    keyEvents.sort((a, b) => a.timestamp - b.timestamp);

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

        if (lastKeyUpTime > 0) {
          const flight = event.timestamp - lastKeyUpTime;
          if (flight >= 0 && flight < 5000) {
            flights.push(flight);
          }
        }

        if (event.keyClass === 'backspace') {
          backspaceCount++;
        }
      } else if (event.type === 'keyup') {
        const downTime = keyDownMap.get(i - 1);
        if (downTime !== undefined) {
          const hold = event.timestamp - downTime;
          if (hold >= 0 && hold < 2000) {
            holds.push(hold);
          }
        }
        lastKeyUpTime = event.timestamp;

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

    let totalMouseDistance = 0;
    let totalMouseTime = 0;

    for (let i = 1; i < mouseEvents.length; i++) {
      const prev = mouseEvents[i - 1];
      const curr = mouseEvents[i];

      if (
        prev.deltaX !== undefined &&
        prev.deltaY !== undefined &&
        curr.deltaX !== undefined &&
        curr.deltaY !== undefined
      ) {
        const dx = curr.deltaX - prev.deltaX;
        const dy = curr.deltaY - prev.deltaY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const time = curr.timestamp - prev.timestamp;

        if (time > 0 && time < 1000) {
          totalMouseDistance += distance;
          totalMouseTime += time;
        }
      }
    }

    // Extract navigation patterns
    const scrollEvents = events.filter(e => e.type === 'scroll');
    const clickEvents = events.filter(e => e.type === 'click');
    const focusEvents = events.filter(e => e.type === 'focus');

    const sessionDuration =
      events.length > 0 ? events[events.length - 1].timestamp - events[0].timestamp : 1;

    const scrollDeltas = scrollEvents.map(e => e.scrollDelta || 0).filter(d => d > 0);

    const actionIntervals: number[] = [];
    for (let i = 1; i < events.length; i++) {
      const interval = events[i].timestamp - events[i - 1].timestamp;
      if (interval > 0 && interval < 10000) {
        // Sanity check: < 10 seconds
        actionIntervals.push(interval);
      }
    }

    return {
      meanFlight: this.mean(flights),
      stdFlight: this.std(flights),
      meanHold: this.mean(holds),
      stdHold: this.std(holds),
      backspaceRate: keyEvents.length > 0 ? backspaceCount / keyEvents.length : 0,
      bigramMean: this.mean(bigrams),
      totalKeys: keyEvents.length,
      mouseAvgSpeed: totalMouseTime > 0 ? totalMouseDistance / totalMouseTime : 0,
      // Navigation patterns
      scrollFrequency: sessionDuration > 0 ? (scrollEvents.length / sessionDuration) * 1000 : 0,
      clickFrequency: sessionDuration > 0 ? (clickEvents.length / sessionDuration) * 1000 : 0,
      avgScrollSpeed: scrollDeltas.length > 0 ? this.mean(scrollDeltas) : 0,
      focusChanges: focusEvents.length,
      avgTimeBetweenActions: actionIntervals.length > 0 ? this.mean(actionIntervals) : 0
    };
  }

  private mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  private std(arr: number[]): number {
    if (arr.length === 0) return 0;
    const m = this.mean(arr);
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  private computeCentroid(vectors: FeatureVector[]): FeatureVector {
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
      centroid.avgTimeBetweenActions =
        (centroid.avgTimeBetweenActions || 0) + (vector.avgTimeBetweenActions || 0);
    }

    const n = vectors.length;
    return {
      meanFlight: centroid.meanFlight / n,
      stdFlight: centroid.stdFlight / n,
      meanHold: centroid.meanHold / n,
      stdHold: centroid.stdHold / n,
      backspaceRate: centroid.backspaceRate / n,
      bigramMean: centroid.bigramMean / n,
      totalKeys: centroid.totalKeys / n,
      mouseAvgSpeed: centroid.mouseAvgSpeed / n,
      scrollFrequency: (centroid.scrollFrequency || 0) / n,
      clickFrequency: (centroid.clickFrequency || 0) / n,
      avgScrollSpeed: (centroid.avgScrollSpeed || 0) / n,
      focusChanges: (centroid.focusChanges || 0) / n,
      avgTimeBetweenActions: (centroid.avgTimeBetweenActions || 0) / n
    };
  }

  private computeStdDevs(vectors: FeatureVector[], centroid: FeatureVector): FeatureVector {
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
      variances.scrollFrequency =
        (variances.scrollFrequency || 0) +
        Math.pow(scrollFreq - (centroid.scrollFrequency || 0), 2);
      variances.clickFrequency =
        (variances.clickFrequency || 0) + Math.pow(clickFreq - (centroid.clickFrequency || 0), 2);
      variances.avgScrollSpeed =
        (variances.avgScrollSpeed || 0) + Math.pow(scrollSpeed - (centroid.avgScrollSpeed || 0), 2);
      variances.focusChanges =
        (variances.focusChanges || 0) + Math.pow(focus - (centroid.focusChanges || 0), 2);
      variances.avgTimeBetweenActions =
        (variances.avgTimeBetweenActions || 0) +
        Math.pow(actionTime - (centroid.avgTimeBetweenActions || 0), 2);
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

  private scoreVector(
    testVector: FeatureVector,
    centroid: FeatureVector,
    stdDevs: FeatureVector
  ): ScoreResult {
    const ANOMALY_THRESHOLD = 2.5;
    const zscores: Record<string, number> = {};
    const features = Object.keys(centroid) as (keyof FeatureVector)[];

    for (const feature of features) {
      const testVal = testVector[feature];
      const centroidVal = centroid[feature];
      const stdDev = stdDevs[feature];

      if (testVal === undefined || centroidVal === undefined || stdDev === undefined) {
        zscores[feature] = 0;
      } else if (stdDev === 0 || isNaN(stdDev)) {
        zscores[feature] = 0;
      } else {
        zscores[feature] = (testVal - centroidVal) / stdDev;
      }
    }

    const absZScores = Object.values(zscores).map(Math.abs);
    const meanAbsZScore = absZScores.reduce((sum, z) => sum + z, 0) / absZScores.length;

    const isAnomaly = meanAbsZScore > ANOMALY_THRESHOLD;
    const trustScore = Math.max(0, Math.min(100, 100 - (meanAbsZScore / 5) * 100));

    const reasons = features
      .map(feature => ({
        feature,
        zscore: zscores[feature],
        absZscore: Math.abs(zscores[feature])
      }))
      .sort((a, b) => b.absZscore - a.absZscore)
      .slice(0, 3)
      .map(({ feature, zscore }) => ({
        code: this.generateReasonCode(feature, zscore),
        message: this.generateReasonMessage(feature, zscore),
        feature: feature as string,
        zscore: parseFloat(zscore.toFixed(2))
      }));

    const isBot = this.detectBotPatterns(testVector, centroid, stdDevs);

    return {
      trustScore: parseFloat(trustScore.toFixed(1)),
      isAnomaly: isAnomaly || isBot,
      isBot,
      topReasons: reasons
    };
  }

  private detectBotPatterns(
    testVector: FeatureVector,
    centroid: FeatureVector,
    stdDevs: FeatureVector
  ): boolean {
    const flightVariability = stdDevs.stdFlight / (centroid.meanFlight || 1);
    if (flightVariability < 0.1 && testVector.stdFlight < centroid.stdFlight * 0.5) {
      return true;
    }

    if (testVector.meanFlight < 50 && testVector.stdFlight < 10) {
      return true;
    }

    const holdVariability = stdDevs.stdHold / (centroid.meanHold || 1);
    if (holdVariability < 0.05 && testVector.stdHold < 5) {
      return true;
    }

    if (testVector.backspaceRate < 0.01 && centroid.backspaceRate > 0.03) {
      return true;
    }

    if (testVector.totalKeys > 100 && testVector.stdFlight < 20) {
      return true;
    }

    return false;
  }

  private generateReasonCode(feature: keyof FeatureVector, zscore: number): string {
    const direction = zscore > 0 ? 'HIGH' : 'LOW';
    const featureName = feature
      .toUpperCase()
      .replace(/([A-Z])/g, '_$1')
      .replace(/^_/, '');
    return `${featureName}_${direction}`;
  }

  private generateReasonMessage(feature: keyof FeatureVector, zscore: number): string {
    const featureLabels: Record<keyof FeatureVector, string> = {
      meanFlight: 'Flight time',
      stdFlight: 'Flight time variability',
      meanHold: 'Hold time',
      stdHold: 'Hold time variability',
      backspaceRate: 'Backspace rate',
      bigramMean: 'Bigram timing',
      totalKeys: 'Total keystrokes',
      mouseAvgSpeed: 'Mouse speed',
      scrollFrequency: 'Scroll frequency',
      clickFrequency: 'Click frequency',
      avgScrollSpeed: 'Average scroll speed',
      focusChanges: 'Focus changes',
      avgTimeBetweenActions: 'Average time between actions'
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
}
