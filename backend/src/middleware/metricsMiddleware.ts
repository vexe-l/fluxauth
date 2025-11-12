import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metricsService';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;

        metricsService.logAPICall({
            endpoint: req.path,
            method: req.method,
            statusCode: res.statusCode,
            duration,
            userId: (req as any).userId
        });
    });

    next();
}
