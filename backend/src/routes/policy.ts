import { Router } from 'express';
import { z } from 'zod';
import {
    getPolicyRules,
    savePolicyRule,
    updatePolicyRule,
    deletePolicyRule,
    PolicyRule
} from '../services/policyEngine';

const router = Router();

const policyRuleSchema = z.object({
    name: z.string().min(1).max(200),
    condition: z.string().min(1).max(500),
    action: z.enum(['REQUIRE_OTP', 'BLOCK_SESSION', 'NOTIFY_ADMIN', 'LOG_EVENT', 'REQUIRE_CAPTCHA']),
    enabled: z.boolean().optional().default(true),
    priority: z.number().int().min(0).optional().default(0)
});

// GET /api/policy/rules - Get all policy rules
router.get('/rules', (req, res, next) => {
    try {
        const rules = getPolicyRules();
        res.json({ rules });
    } catch (error) {
        next(error);
    }
});

// POST /api/policy/rules - Create a new policy rule
router.post('/rules', (req, res, next) => {
    try {
        const data = policyRuleSchema.parse(req.body);
        
        const now = Date.now();
        const rule: Omit<PolicyRule, 'id'> = {
            ...data,
            enabled: data.enabled ?? true,
            priority: data.priority ?? 0
        };

        const id = savePolicyRule(rule);

        res.status(201).json({
            success: true,
            id,
            rule: { id, ...rule }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/policy/rules/:id - Update a policy rule
router.put('/rules/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = policyRuleSchema.partial().parse(req.body);

        updatePolicyRule(id, updates);

        res.json({
            success: true,
            message: 'Policy rule updated'
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/policy/rules/:id - Delete a policy rule
router.delete('/rules/:id', (req, res, next) => {
    try {
        const { id } = req.params;
        deletePolicyRule(id);

        res.json({
            success: true,
            message: 'Policy rule deleted'
        });
    } catch (error) {
        next(error);
    }
});

export default router;

