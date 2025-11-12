import { db } from '../db';

export interface PolicyRule {
    id: string;
    name: string;
    condition: string;
    action: string;
    enabled: boolean;
    priority: number;
}

export interface PolicyEvaluationContext {
    trustScore: number;
    isAnomaly: boolean;
    userId?: string;
    sessionId?: string;
    isBot?: boolean;
}

export interface PolicyAction {
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Evaluate a policy condition against context
 */
function evaluateCondition(condition: string, context: PolicyEvaluationContext): boolean {
    // Simple condition parser - supports:
    // - trustScore < 40
    // - trustScore > 70
    // - isAnomaly = true
    // - isAnomaly = false
    // - isBot = true
    // - AND, OR operators
    
    try {
        // Replace variables with actual values
        let expr = condition
            .replace(/trustScore/g, String(context.trustScore))
            .replace(/isAnomaly/g, String(context.isAnomaly))
            .replace(/isBot/g, String(context.isBot || false))
            .replace(/true/g, 'true')
            .replace(/false/g, 'false')
            .replace(/=/g, '===');

        // Handle AND/OR
        if (expr.includes(' AND ')) {
            const parts = expr.split(' AND ');
            return parts.every(part => evaluateSimpleCondition(part.trim()));
        }
        
        if (expr.includes(' OR ')) {
            const parts = expr.split(' OR ');
            return parts.some(part => evaluateSimpleCondition(part.trim()));
        }

        return evaluateSimpleCondition(expr);
    } catch (error) {
        console.error('Policy condition evaluation error:', error);
        return false;
    }
}

function evaluateSimpleCondition(expr: string): boolean {
    // Remove "IF" and "THEN" keywords
    expr = expr.replace(/^IF\s+/i, '').replace(/\s+THEN.*$/i, '').trim();
    
    // Handle comparison operators
    if (expr.includes('<')) {
        const [left, right] = expr.split('<').map(s => s.trim());
        return parseFloat(left) < parseFloat(right);
    }
    if (expr.includes('>')) {
        const [left, right] = expr.split('>').map(s => s.trim());
        return parseFloat(left) > parseFloat(right);
    }
    if (expr.includes('===')) {
        const [left, right] = expr.split('===').map(s => s.trim());
        if (left === 'true' || left === 'false') {
            return left === right;
        }
        return left === right;
    }
    if (expr.includes('!==')) {
        const [left, right] = expr.split('!==').map(s => s.trim());
        return left !== right;
    }
    
    return false;
}

/**
 * Get all enabled policy rules from database
 */
export function getPolicyRules(): PolicyRule[] {
    try {
        const rows = db.prepare(`
            SELECT id, name, condition, action, enabled, priority
            FROM policy_rules
            WHERE enabled = 1
            ORDER BY priority ASC
        `).all() as Array<{
            id: string;
            name: string;
            condition: string;
            action: string;
            enabled: number;
            priority: number;
        }>;

        return rows.map(row => ({
            ...row,
            enabled: row.enabled === 1
        }));
    } catch (error) {
        // Table might not exist yet, return empty array
        console.warn('Policy rules table not found, returning empty array');
        return [];
    }
}

/**
 * Evaluate all policy rules against a context
 * Returns the first matching action (by priority)
 */
export function evaluatePolicies(context: PolicyEvaluationContext): PolicyAction | null {
    const rules = getPolicyRules();
    
    for (const rule of rules) {
        if (!rule.enabled) continue;
        
        if (evaluateCondition(rule.condition, context)) {
            return {
                type: rule.action,
                message: `Policy "${rule.name}" triggered: ${rule.condition}`,
                severity: getActionSeverity(rule.action)
            };
        }
    }
    
    return null;
}

function getActionSeverity(action: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (action) {
        case 'BLOCK_SESSION':
            return 'critical';
        case 'REQUIRE_OTP':
            return 'high';
        case 'NOTIFY_ADMIN':
            return 'medium';
        case 'REQUIRE_CAPTCHA':
            return 'medium';
        case 'LOG_EVENT':
            return 'low';
        default:
            return 'medium';
    }
}

/**
 * Save a policy rule to database
 */
export function savePolicyRule(rule: Omit<PolicyRule, 'id'>): string {
    const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    
    db.prepare(`
        INSERT INTO policy_rules (id, name, condition, action, enabled, priority, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        rule.name,
        rule.condition,
        rule.action,
        rule.enabled ? 1 : 0,
        rule.priority,
        now,
        now
    );
    
    return id;
}

/**
 * Update a policy rule
 */
export function updatePolicyRule(id: string, updates: Partial<PolicyRule>): void {
    const updatesList: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
        updatesList.push('name = ?');
        values.push(updates.name);
    }
    if (updates.condition !== undefined) {
        updatesList.push('condition = ?');
        values.push(updates.condition);
    }
    if (updates.action !== undefined) {
        updatesList.push('action = ?');
        values.push(updates.action);
    }
    if (updates.enabled !== undefined) {
        updatesList.push('enabled = ?');
        values.push(updates.enabled ? 1 : 0);
    }
    if (updates.priority !== undefined) {
        updatesList.push('priority = ?');
        values.push(updates.priority);
    }
    
    if (updatesList.length === 0) return;
    
    // Always update updated_at
    updatesList.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    
    db.prepare(`
        UPDATE policy_rules
        SET ${updatesList.join(', ')}
        WHERE id = ?
    `).run(...values);
}

/**
 * Delete a policy rule
 */
export function deletePolicyRule(id: string): void {
    db.prepare('DELETE FROM policy_rules WHERE id = ?').run(id);
}

