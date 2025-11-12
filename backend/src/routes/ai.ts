import { Router } from 'express';
import { db } from '../db';
import { generateThreatReport } from '../services/geminiService';

const router = Router();

// GET /api/ai/threat-report - Generate AI-powered threat analysis
router.get('/threat-report', async (req, res, next) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                error: 'AI service not configured',
                message: 'Gemini API key not set'
            });
        }

        // Get recent sessions
        const sessions = db.prepare(`
            SELECT session_id, user_id, trust_score, is_anomaly, scored_at
            FROM sessions
            WHERE scored_at IS NOT NULL
            ORDER BY scored_at DESC
            LIMIT 100
        `).all();

        if (sessions.length === 0) {
            return res.json({
                report: 'No session data available yet. Complete some authentications to generate a threat report.',
                sessions: 0
            });
        }

        const report = await generateThreatReport(sessions);

        res.json({
            report,
            sessions: sessions.length,
            anomalies: sessions.filter((s: any) => s.is_anomaly).length,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

export default router;
