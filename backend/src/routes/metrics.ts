import { Router } from 'express';
import { metricsService } from '../services/metricsService';

const router = Router();

// GET /api/metrics/calls - Recent API calls
router.get('/calls', (_req, res) => {
    const calls = metricsService.getRecentCalls(10);
    res.json({ calls });
});

// GET /api/metrics/model - Model performance metrics
router.get('/model', (_req, res) => {
    const metrics = metricsService.getModelMetrics();
    res.json(metrics);
});

// GET /api/metrics/uptime - Uptime statistics
router.get('/uptime', (_req, res) => {
    const uptime = metricsService.getUptimeStats();
    res.json(uptime);
});

export default router;
