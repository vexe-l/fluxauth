/**
 * Metrics collection for transparency dashboard
 */

interface APICall {
    timestamp: number;
    endpoint: string;
    method: string;
    statusCode: number;
    duration: number;
    userId?: string;
}

interface ModelMetrics {
    totalSessions: number;
    totalAnomalies: number;
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    avgLatency: number;
    uptime: number;
}

export class MetricsService {
    private apiCalls: APICall[] = [];
    private maxCalls = 1000;
    private startTime = Date.now();
    private modelMetrics: ModelMetrics = {
        totalSessions: 0,
        totalAnomalies: 0,
        truePositives: 0,
        falsePositives: 0,
        trueNegatives: 0,
        falseNegatives: 0,
        avgLatency: 0,
        uptime: 0
    };

    /**
     * Log an API call
     */
    logAPICall(call: Omit<APICall, 'timestamp'>): void {
        this.apiCalls.push({
            ...call,
            timestamp: Date.now()
        });

        // Keep only recent calls
        if (this.apiCalls.length > this.maxCalls) {
            this.apiCalls.shift();
        }

        // Update avg latency
        const latencies = this.apiCalls.map(c => c.duration);
        this.modelMetrics.avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    }

    /**
     * Log a scoring result
     */
    logScore(isAnomaly: boolean, isActualAnomaly?: boolean): void {
        this.modelMetrics.totalSessions++;

        if (isAnomaly) {
            this.modelMetrics.totalAnomalies++;
        }

        // If ground truth is provided, update confusion matrix
        if (isActualAnomaly !== undefined) {
            if (isAnomaly && isActualAnomaly) {
                this.modelMetrics.truePositives++;
            } else if (isAnomaly && !isActualAnomaly) {
                this.modelMetrics.falsePositives++;
            } else if (!isAnomaly && !isActualAnomaly) {
                this.modelMetrics.trueNegatives++;
            } else if (!isAnomaly && isActualAnomaly) {
                this.modelMetrics.falseNegatives++;
            }
        }
    }

    /**
     * Get recent API calls (for transparency dashboard)
     */
    getRecentCalls(limit = 10): APICall[] {
        return this.apiCalls
            .slice(-limit)
            .reverse()
            .map(call => ({
                ...call,
                userId: call.userId ? this.anonymizeUserId(call.userId) : undefined
            }));
    }

    /**
     * Get model performance metrics
     */
    getModelMetrics(): ModelMetrics & {
        tpr: number;
        fpr: number;
        accuracy: number;
        precision: number;
        recall: number;
    } {
        const { truePositives, falsePositives, trueNegatives, falseNegatives } = this.modelMetrics;

        const total = truePositives + falsePositives + trueNegatives + falseNegatives;
        const positives = truePositives + falseNegatives;
        const negatives = trueNegatives + falsePositives;

        const tpr = positives > 0 ? truePositives / positives : 0;
        const fpr = negatives > 0 ? falsePositives / negatives : 0;
        const accuracy = total > 0 ? (truePositives + trueNegatives) / total : 0;
        const precision = (truePositives + falsePositives) > 0
            ? truePositives / (truePositives + falsePositives)
            : 0;
        const recall = tpr;

        return {
            ...this.modelMetrics,
            uptime: Date.now() - this.startTime,
            tpr: parseFloat(tpr.toFixed(3)),
            fpr: parseFloat(fpr.toFixed(3)),
            accuracy: parseFloat(accuracy.toFixed(3)),
            precision: parseFloat(precision.toFixed(3)),
            recall: parseFloat(recall.toFixed(3))
        };
    }

    /**
     * Get uptime statistics
     */
    getUptimeStats(): {
        uptime: number;
        uptimeFormatted: string;
        startTime: number;
    } {
        const uptime = Date.now() - this.startTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);

        return {
            uptime,
            uptimeFormatted: `${hours}h ${minutes}m ${seconds}s`,
            startTime: this.startTime
        };
    }

    /**
     * Anonymize user ID for public display
     */
    private anonymizeUserId(userId: string): string {
        // Simple hash for display
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = ((hash << 5) - hash) + userId.charCodeAt(i);
            hash = hash & hash;
        }
        return `user-${Math.abs(hash).toString(16).substring(0, 8)}`;
    }
}

// Singleton instance
export const metricsService = new MetricsService();
