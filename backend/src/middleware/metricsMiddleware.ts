import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metricsService';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Extract userId from request body if available (for POST requests)
    let userId: string | undefined;
    if (req.body && typeof req.body === 'object') {
      userId = req.body.userId;
    }

    metricsService.logAPICall({
      endpoint: req.path,
      method: req.method,
      statusCode: res.statusCode,
      duration,
      userId
    });
  });

  next();
}
