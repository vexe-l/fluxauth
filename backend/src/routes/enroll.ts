import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { extractFeatures, computeCentroid, computeStdDevs } from '../features/extractor';
import { BehaviorEvent } from '../features/types';

const router = Router();

const MIN_ENROLLMENT_SESSIONS = parseInt(process.env.MIN_ENROLLMENT_SESSIONS || '4');

// Validation schemas
const behaviorEventSchema = z.object({
    type: z.enum(['keydown', 'keyup', 'mousemove']),
    timestamp: z.number(),
    keyClass: z.enum(['letter', 'digit', 'backspace', 'other']).optional(),
    deltaX: z.number().optional(),
    deltaY: z.number().optional()
});

const enrollSessionSchema = z.object({
    sessionId: z.string().min(1).max(100),
    events: z.array(behaviorEventSchema).min(1).max(10000)
});

const enrollSchema = z.object({
    userId: z.string().min(1).max(100),
    sessions: z.array(enrollSessionSchema).min(MIN_ENROLLMENT_SESSIONS)
});

// POST /api/enroll
router.post('/', (req, res, next) => {
    try {
        const { userId, sessions } = enrollSchema.parse(req.body);

        // Sanitize: ensure no raw text in events
        for (const session of sessions) {
            for (const event of session.events) {
                if ('key' in event || 'code' in event || 'char' in event) {
                    return res.status(400).json({
                        error: 'Raw key data not allowed. Only keyClass is permitted.'
                    });
                }
            }
        }

        // Extract feature vectors from all sessions
        const vectors = sessions.map(session =>
            extractFeatures(session.events as BehaviorEvent[])
        );

        // Compute centroid and standard deviations
        const centroid = computeCentroid(vectors);
        const stdDevs = computeStdDevs(vectors, centroid);

        const profile = {
            centroid,
            stdDevs
        };

        const now = Date.now();

        // Create or update user
        db.prepare(`
      INSERT INTO users (user_id, created_at, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET updated_at = ?
    `).run(userId, now, now, now);

        // Store enrollment profile
        db.prepare(`
      INSERT INTO enrollment_profiles (user_id, feature_vector, sample_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        feature_vector = ?,
        sample_count = ?,
        updated_at = ?
    `).run(
            userId,
            JSON.stringify(profile),
            sessions.length,
            now,
            now,
            JSON.stringify(profile),
            sessions.length,
            now
        );

        res.json({
            success: true,
            userId,
            samplesCollected: sessions.length,
            message: 'Enrollment successful'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
