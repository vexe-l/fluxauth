import { Router } from 'express';
import { db } from '../db';
import { generateThreatReport, calculateContextualRisk } from '../services/geminiService';

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

// POST /api/ai/contextual-risk - Calculate contextual risk with AI
router.post('/contextual-risk', async (req, res, next) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({
                error: 'AI service not configured',
                message: 'Gemini API key not set'
            });
        }

        const {
            baseTrustScore,
            action = 'login',
            location,
            isNewDevice = false,
            amountInvolved,
            userId
        } = req.body;

        if (typeof baseTrustScore !== 'number') {
            return res.status(400).json({
                error: 'baseTrustScore is required and must be a number'
            });
        }

        // Get current time
        const now = new Date();
        const timeOfDay = now.getHours();

        // Get user history if userId provided
        let userHistory;
        if (userId) {
            const sessions = db.prepare(`
                SELECT trust_score, created_at
                FROM sessions
                WHERE user_id = ?
                AND scored_at IS NOT NULL
                ORDER BY created_at DESC
                LIMIT 30
            `).all(userId);

            if (sessions.length > 0) {
                const avgTrustScore = sessions.reduce((sum: number, s: any) => sum + (s.trust_score || 0), 0) / sessions.length;
                const loginTimes = sessions.map((s: any) => new Date(s.created_at).getHours());
                const typicalLoginTimes = [...new Set(loginTimes)].slice(0, 3);

                userHistory = {
                    avgTrustScore: Math.round(avgTrustScore),
                    typicalLoginTimes,
                    typicalLocations: location ? [location] : []
                };
            }
        }

        // Calculate contextual risk with AI
        const riskAnalysis = await calculateContextualRisk({
            baseTrustScore,
            action,
            location,
            timeOfDay,
            isNewDevice,
            amountInvolved,
            userHistory
        });

        res.json({
            ...riskAnalysis,
            baseTrustScore,
            context: {
                action,
                timeOfDay,
                isNewDevice,
                location,
                amountInvolved
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

export default router;
