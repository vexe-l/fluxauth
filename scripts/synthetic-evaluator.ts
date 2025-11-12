/**
 * Synthetic data evaluator for computing TPR/FPR metrics
 */

import { generateSession, normalProfile, attackerProfile } from './generate-sessions';
import { extractFeatures } from '../backend/src/features/extractor';
import { scoreVector } from '../backend/src/features/scorer';
import { computeCentroid, computeStdDevs } from '../backend/src/features/extractor';
import { FeatureVector } from '../backend/src/features/types';

interface EvaluationMetrics {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
    tpr: number;
    fpr: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    avgLatency: number;
}

export async function evaluateModel(
    numNormalSamples = 100,
    numAttackSamples = 100,
    threshold = 2.5
): Promise<EvaluationMetrics> {
    console.log('Generating synthetic data...');

    // Generate enrollment data (normal user)
    const enrollmentSessions = [];
    for (let i = 0; i < 4; i++) {
        const events = generateSession(normalProfile, 50);
        enrollmentSessions.push(extractFeatures(events));
    }

    // Compute baseline
    const centroid = computeCentroid(enrollmentSessions);
    const stdDevs = computeStdDevs(enrollmentSessions, centroid);

    console.log('Evaluating normal samples...');
    let trueNegatives = 0;
    let falsePositives = 0;
    let normalLatencies: number[] = [];

    for (let i = 0; i < numNormalSamples; i++) {
        const events = generateSession(normalProfile, 50);
        const features = extractFeatures(events);

        const startTime = Date.now();
        const result = scoreVector(features, centroid, stdDevs);
        const latency = Date.now() - startTime;
        normalLatencies.push(latency);

        if (!result.isAnomaly) {
            trueNegatives++;
        } else {
            falsePositives++;
        }
    }

    console.log('Evaluating attack samples...');
    let truePositives = 0;
    let falseNegatives = 0;
    let attackLatencies: number[] = [];

    for (let i = 0; i < numAttackSamples; i++) {
        const events = generateSession(attackerProfile, 50);
        const features = extractFeatures(events);

        const startTime = Date.now();
        const result = scoreVector(features, centroid, stdDevs);
        const latency = Date.now() - startTime;
        attackLatencies.push(latency);

        if (result.isAnomaly) {
            truePositives++;
        } else {
            falseNegatives++;
        }
    }

    // Compute metrics
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
    const f1Score = (precision + recall) > 0
        ? 2 * (precision * recall) / (precision + recall)
        : 0;

    const allLatencies = [...normalLatencies, ...attackLatencies];
    const avgLatency = allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length;

    return {
        truePositives,
        falsePositives,
        trueNegatives,
        falseNegatives,
        tpr: parseFloat(tpr.toFixed(4)),
        fpr: parseFloat(fpr.toFixed(4)),
        accuracy: parseFloat(accuracy.toFixed(4)),
        precision: parseFloat(precision.toFixed(4)),
        recall: parseFloat(recall.toFixed(4)),
        f1Score: parseFloat(f1Score.toFixed(4)),
        avgLatency: parseFloat(avgLatency.toFixed(2))
    };
}

// CLI usage
if (require.main === module) {
    const fs = require('fs');
    const path = require('path');

    console.log('🧪 BIaaS Model Evaluation\n');

    evaluateModel(100, 100, 2.5).then(metrics => {
        console.log('\n📊 Evaluation Results:');
        console.log('─'.repeat(50));
        console.log(`True Positives:  ${metrics.truePositives}`);
        console.log(`False Positives: ${metrics.falsePositives}`);
        console.log(`True Negatives:  ${metrics.trueNegatives}`);
        console.log(`False Negatives: ${metrics.falseNegatives}`);
        console.log('─'.repeat(50));
        console.log(`TPR (Recall):    ${(metrics.tpr * 100).toFixed(2)}%`);
        console.log(`FPR:             ${(metrics.fpr * 100).toFixed(2)}%`);
        console.log(`Accuracy:        ${(metrics.accuracy * 100).toFixed(2)}%`);
        console.log(`Precision:       ${(metrics.precision * 100).toFixed(2)}%`);
        console.log(`F1 Score:        ${(metrics.f1Score * 100).toFixed(2)}%`);
        console.log(`Avg Latency:     ${metrics.avgLatency}ms`);
        console.log('─'.repeat(50));

        // Save results
        const outputDir = path.join(__dirname, '../data/evaluation');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `evaluation-${Date.now()}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(metrics, null, 2));
        console.log(`\n✅ Results saved to: ${outputPath}`);
    }).catch(error => {
        console.error('❌ Evaluation failed:', error);
        process.exit(1);
    });
}

export { EvaluationMetrics };
