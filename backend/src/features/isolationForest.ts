/**
 * Isolation Forest implementation for anomaly detection
 * Alternative to centroid-based scoring
 */

import { FeatureVector } from './types';

interface IsolationTree {
    splitFeature?: keyof FeatureVector;
    splitValue?: number;
    left?: IsolationTree;
    right?: IsolationTree;
    size: number;
}

export class IsolationForest {
    private trees: IsolationTree[] = [];
    private numTrees: number;
    private subsampleSize: number;
    private maxDepth: number;

    constructor(numTrees = 100, subsampleSize = 256, maxDepth = 8) {
        this.numTrees = numTrees;
        this.subsampleSize = subsampleSize;
        this.maxDepth = maxDepth;
    }

    /**
     * Train the isolation forest on enrollment data
     */
    fit(data: FeatureVector[]): void {
        this.trees = [];

        for (let i = 0; i < this.numTrees; i++) {
            const sample = this.subsample(data, this.subsampleSize);
            const tree = this.buildTree(sample, 0);
            this.trees.push(tree);
        }
    }

    /**
     * Compute anomaly score for a test vector
     * Returns score between 0 and 1 (higher = more anomalous)
     */
    score(vector: FeatureVector): number {
        if (this.trees.length === 0) {
            throw new Error('Model not trained. Call fit() first.');
        }

        const avgPathLength = this.trees.reduce((sum, tree) => {
            return sum + this.pathLength(vector, tree, 0);
        }, 0) / this.trees.length;

        // Normalize using expected path length
        const c = this.expectedPathLength(this.subsampleSize);
        const anomalyScore = Math.pow(2, -avgPathLength / c);

        return anomalyScore;
    }

    /**
     * Get feature importances based on split frequency
     */
    getFeatureImportances(): Record<keyof FeatureVector, number> {
        const importances: Record<string, number> = {};
        const features: (keyof FeatureVector)[] = [
            'meanFlight', 'stdFlight', 'meanHold', 'stdHold',
            'backspaceRate', 'bigramMean', 'totalKeys', 'mouseAvgSpeed'
        ];

        features.forEach(f => importances[f] = 0);

        this.trees.forEach(tree => {
            this.countSplits(tree, importances);
        });

        // Normalize
        const total = Object.values(importances).reduce((a, b) => a + b, 0);
        if (total > 0) {
            features.forEach(f => importances[f] /= total);
        }

        return importances as Record<keyof FeatureVector, number>;
    }

    private subsample(data: FeatureVector[], size: number): FeatureVector[] {
        const sample: FeatureVector[] = [];
        const n = Math.min(size, data.length);

        for (let i = 0; i < n; i++) {
            const idx = Math.floor(Math.random() * data.length);
            sample.push(data[idx]);
        }

        return sample;
    }

    private buildTree(data: FeatureVector[], depth: number): IsolationTree {
        if (depth >= this.maxDepth || data.length <= 1) {
            return { size: data.length };
        }

        const features: (keyof FeatureVector)[] = [
            'meanFlight', 'stdFlight', 'meanHold', 'stdHold',
            'backspaceRate', 'bigramMean', 'totalKeys', 'mouseAvgSpeed'
        ];

        // Random feature selection
        const splitFeature = features[Math.floor(Math.random() * features.length)];

        // Find min/max for split
        const values = data.map(d => d[splitFeature]);
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (min === max) {
            return { size: data.length };
        }

        // Random split value
        const splitValue = min + Math.random() * (max - min);

        // Split data
        const left = data.filter(d => d[splitFeature] < splitValue);
        const right = data.filter(d => d[splitFeature] >= splitValue);

        return {
            splitFeature,
            splitValue,
            left: this.buildTree(left, depth + 1),
            right: this.buildTree(right, depth + 1),
            size: data.length
        };
    }

    private pathLength(vector: FeatureVector, tree: IsolationTree, depth: number): number {
        if (!tree.splitFeature || !tree.left || !tree.right) {
            return depth + this.expectedPathLength(tree.size);
        }

        if (vector[tree.splitFeature] < tree.splitValue!) {
            return this.pathLength(vector, tree.left, depth + 1);
        } else {
            return this.pathLength(vector, tree.right, depth + 1);
        }
    }

    private expectedPathLength(n: number): number {
        if (n <= 1) return 0;
        const H = Math.log(n - 1) + 0.5772156649; // Euler's constant
        return 2 * H - (2 * (n - 1) / n);
    }

    private countSplits(tree: IsolationTree, counts: Record<string, number>): void {
        if (tree.splitFeature) {
            counts[tree.splitFeature]++;
            if (tree.left) this.countSplits(tree.left, counts);
            if (tree.right) this.countSplits(tree.right, counts);
        }
    }

    /**
     * Serialize model to JSON
     */
    toJSON(): string {
        return JSON.stringify({
            numTrees: this.numTrees,
            subsampleSize: this.subsampleSize,
            maxDepth: this.maxDepth,
            trees: this.trees
        });
    }

    /**
     * Load model from JSON
     */
    static fromJSON(json: string): IsolationForest {
        const data = JSON.parse(json);
        const forest = new IsolationForest(data.numTrees, data.subsampleSize, data.maxDepth);
        forest.trees = data.trees;
        return forest;
    }
}
