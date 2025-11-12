/**
 * BIaaS Browser SDK
 * Lightweight, dependency-free behavioral biometrics capture
 */

export type KeyClass = 'letter' | 'digit' | 'backspace' | 'other';

export interface BehaviorEvent {
    type: 'keydown' | 'keyup' | 'mousemove';
    timestamp: number;
    keyClass?: KeyClass;
    deltaX?: number;
    deltaY?: number;
}

export interface SDKConfig {
    apiUrl: string;
    apiKey: string;
    batchInterval?: number;
    enableMouse?: boolean;
}

export interface ScoreResult {
    trustScore: number;
    isAnomaly: boolean;
    topReasons: Array<{
        code: string;
        message: string;
        feature: string;
        zscore: number;
    }>;
    aiAnalysis?: string;
    aiExplanation?: string;
}

export class BehaviorSDK {
    private config: Required<SDKConfig>;
    private events: BehaviorEvent[] = [];
    private sessionId: string | null = null;
    private isCapturing = false;
    private batchTimer: number | null = null;
    private lastMousePos = { x: 0, y: 0 };

    constructor(config: SDKConfig) {
        this.config = {
            ...config,
            batchInterval: config.batchInterval || 5000,
            enableMouse: config.enableMouse ?? true
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

        // Register session with backend
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

        // Attach event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        if (this.config.enableMouse) {
            document.addEventListener('mousemove', this.handleMouseMove);
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
    async enroll(userId: string, sessions: Array<{ sessionId: string; events: BehaviorEvent[] }>): Promise<void> {
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
}
