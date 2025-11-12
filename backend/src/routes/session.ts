import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { extractFeatures } from '../features/extractor';
import { scoreVector } from '../features/scorer';
import { BehaviorEvent, FeatureVector } from '../features/types';
import { analyzeSessionWithAI, explainAnomalyToUser } from '../services/geminiService';
import crypto from 'crypto';

const router = Router();

// Validation schemas
const behaviorEventSchema = z.object({
    type: z.enum(['keydown', 'keyup', 'mousemove']),
    timestamp: z.number(),
    keyClass: z.enum(['letter', 'digit', 'backspace', 'other']).optional(),
    deltaX: z.number().optional(),
    deltaY: z.number().optional()
});

const startSessionSchema = z.object({
    sessionId: z.string().min(1).max(100),
    userId: z.string().min(1).max(100).optional()
});

const scoreSessionSchema = z.object({
    userId: z.string().min(1).max(100),
    sessionId: z.string().min(1).max(100),
    events: z.array(behaviorEventSchema).min(1).max(10000)
});

// POST /api/session/start
router.post('/start', (req, res, next) => {
    try {
        const { sessionId, userId } = startSessionSchema.parse(req.body);

        const sessionToken = crypto.randomBytes(32).toString('hex');
        const now = Date.now();

        const stmt = db.prepare(`
      INSERT INTO sessions (session_id, user_id, session_token, created_at)
      VALUES (?, ?, ?, ?)
    `);

        stmt.run(sessionId, userId || null, sessionToken, now);

        res.json({
            sessionToken,
            timestamp: new Date(now).toISOString()
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sessions/recent - Get recent sessions for live monitoring
router.get('/recent', (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;

        const sessions = db.prepare(`
            SELECT session_id, user_id, trust_score, is_anomaly, events, created_at, scored_at
            FROM sessions
            WHERE scored_at IS NOT NULL
            ORDER BY scored_at DESC
            LIMIT ?
        `).all(limit);

        res.json({ sessions });
    } catch (error) {
        next(error);
    }
});

// POST /api/session/score
router.post('/score', async (req, res, next) => {
    try {
        const { userId, sessionId, events } = scoreSessionSchema.parse(req.body);

        // Sanitize: ensure no raw text in events
        for (const event of events) {
            if ('key' in event || 'code' in event || 'char' in event) {
                return res.status(400).json({
                    error: 'Raw key data not allowed. Only keyClass is permitted.'
                });
            }
        }

        // Extract features from events
        const testVector = extractFeatures(events as BehaviorEvent[]);

        // Retrieve user's enrollment profile
        const profileRow = db.prepare(`
      SELECT feature_vector FROM enrollment_profiles WHERE user_id = ?
    `).get(userId) as { feature_vector: string } | undefined;

        if (!profileRow) {
            return res.status(404).json({
                error: 'User not enrolled',
                message: 'Please complete enrollment before scoring'
            });
        }

        const profile = JSON.parse(profileRow.feature_vector);
        const centroid = profile.centroid as FeatureVector;
        const stdDevs = profile.stdDevs as FeatureVector;

        // Score the test vector
        const result = scoreVector(testVector, centroid, stdDevs);

        // AI-powered analysis (if Gemini API key is configured)
        let aiAnalysis = null;
        let aiExplanation = null;

        if (process.env.GEMINI_API_KEY) {
            try {
                // Get AI security analysis
                aiAnalysis = await analyzeSessionWithAI({
                    userId,
                    trustScore: result.trustScore,
                    isAnomaly: result.isAnomaly,
                    features: testVector,
                    topReasons: result.topReasons
                });

                // Get user-friendly explanation if anomaly detected
                if (result.isAnomaly) {
                    aiExplanation = await explainAnomalyToUser(result.topReasons);
                }
            } catch (error) {
                console.error('AI analysis failed:', error);
            }
        }

        // Store session result
        const now = Date.now();
        db.prepare(`
      UPDATE sessions
      SET events = ?, trust_score = ?, is_anomaly = ?, scored_at = ?
      WHERE session_id = ?
    `).run(
            JSON.stringify(events),
            result.trustScore,
            result.isAnomaly ? 1 : 0,
            now,
            sessionId
        );

        res.json({
            ...result,
            aiAnalysis,
            aiExplanation
        });
    } catch (error) {
        next(error);
    }
});

export default router;
