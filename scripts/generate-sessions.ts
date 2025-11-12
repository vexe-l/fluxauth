/**
 * Synthetic Session Generator
 * Creates normal and attacker behavioral sessions for testing
 */

interface BehaviorEvent {
    type: 'keydown' | 'keyup' | 'mousemove';
    timestamp: number;
    keyClass?: 'letter' | 'digit' | 'backspace' | 'other';
    deltaX?: number;
    deltaY?: number;
}

interface SessionProfile {
    meanFlight: number;
    stdFlight: number;
    meanHold: number;
    stdHold: number;
    backspaceRate: number;
}

/**
 * Generate a random value from normal distribution
 */
function randomNormal(mean: number, std: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + std * z0;
}

/**
 * Generate a synthetic typing session
 */
function generateSession(profile: SessionProfile, numKeys: number = 50): BehaviorEvent[] {
    const events: BehaviorEvent[] = [];
    let currentTime = Date.now();

    for (let i = 0; i < numKeys; i++) {
        // Generate flight time (time since last key release)
        if (i > 0) {
            const flight = Math.max(10, randomNormal(profile.meanFlight, profile.stdFlight));
            currentTime += flight;
        }

        // Key down
        events.push({
            type: 'keydown',
            timestamp: currentTime,
            keyClass: Math.random() < profile.backspaceRate ? 'backspace' : 'letter'
        });

        // Generate hold time
        const hold = Math.max(10, randomNormal(profile.meanHold, profile.stdHold));
        currentTime += hold;

        // Key up
        events.push({
            type: 'keyup',
            timestamp: currentTime,
            keyClass: events[events.length - 1].keyClass
        });
    }

    return events;
}

/**
 * Normal user profile (typical typing)
 */
const normalProfile: SessionProfile = {
    meanFlight: 150,
    stdFlight: 50,
    meanHold: 100,
    stdHold: 30,
    backspaceRate: 0.05
};

/**
 * Attacker profile (different typing patterns)
 */
const attackerProfile: SessionProfile = {
    meanFlight: 80,  // Much faster
    stdFlight: 20,   // More consistent
    meanHold: 50,    // Shorter holds
    stdHold: 15,     // Less variation
    backspaceRate: 0.15  // More errors
};

/**
 * Generate enrollment sessions for a normal user
 */
function generateEnrollmentSessions(userId: string, count: number = 4) {
    const sessions = [];

    for (let i = 0; i < count; i++) {
        const sessionId = `enroll-${userId}-${i}`;
        const events = generateSession(normalProfile, 50);
        sessions.push({ sessionId, events });
    }

    return {
        userId,
        sessions
    };
}

/**
 * Generate a test session (normal user)
 */
function generateTestSession(userId: string) {
    const sessionId = `test-${userId}-${Date.now()}`;
    const events = generateSession(normalProfile, 50);

    return {
        userId,
        sessionId,
        events
    };
}

/**
 * Generate an attacker session
 */
function generateAttackerSession(userId: string) {
    const sessionId = `attack-${userId}-${Date.now()}`;
    const events = generateSession(attackerProfile, 50);

    return {
        userId,
        sessionId,
        events
    };
}

// CLI usage
if (require.main === module) {
    const fs = require('fs');
    const path = require('path');

    const outputDir = path.join(__dirname, '../data/synthetic');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate enrollment data
    const enrollment = generateEnrollmentSessions('demo-user', 4);
    fs.writeFileSync(
        path.join(outputDir, 'enrollment.json'),
        JSON.stringify(enrollment, null, 2)
    );
    console.log('✅ Generated enrollment.json');

    // Generate test session
    const testSession = generateTestSession('demo-user');
    fs.writeFileSync(
        path.join(outputDir, 'test-session.json'),
        JSON.stringify(testSession, null, 2)
    );
    console.log('✅ Generated test-session.json');

    // Generate attacker session
    const attackerSession = generateAttackerSession('demo-user');
    fs.writeFileSync(
        path.join(outputDir, 'attacker-session.json'),
        JSON.stringify(attackerSession, null, 2)
    );
    console.log('✅ Generated attacker-session.json');

    console.log('\n📁 Synthetic sessions saved to:', outputDir);
}

export {
    generateSession,
    generateEnrollmentSessions,
    generateTestSession,
    generateAttackerSession,
    normalProfile,
    attackerProfile
};
