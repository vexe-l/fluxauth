import { Request, Response, NextFunction } from 'express';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.API_KEY;

    if (!expectedKey) {
        console.error('⚠️  API_KEY not configured in environment');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!apiKey) {
        return res.status(401).json({ error: 'Missing API key' });
    }

    if (apiKey !== expectedKey) {
        return res.status(403).json({ error: 'Invalid API key' });
    }

    next();
}
