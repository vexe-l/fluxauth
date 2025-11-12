/**
 * Insert fake data into database for demo purposes
 * Includes: users, sessions, policy rules, and demographic metadata
 */

import { db } from '../db';
import { savePolicyRule } from '../services/policyEngine';

interface FakeSession {
    sessionId: string;
    userId: string;
    trustScore: number;
    isAnomaly: boolean;
    deviceType: string;
    region: string;
    ageGroup: string;
    gender: string;
    createdAt: number;
}

export function insertFakeData() {
    console.log('📊 Inserting fake data into database...');
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Insert fake users
    const fakeUsers = [
        { userId: 'alice-demo', createdAt: now - 7 * oneDay },
        { userId: 'bob-demo', createdAt: now - 5 * oneDay },
        { userId: 'charlie-demo', createdAt: now - 3 * oneDay },
        { userId: 'diana-demo', createdAt: now - 2 * oneDay },
        { userId: 'eve-demo', createdAt: now - 1 * oneDay },
    ];
    
    console.log('👥 Inserting users...');
    const insertUser = db.prepare(`
        INSERT OR IGNORE INTO users (user_id, created_at, updated_at)
        VALUES (?, ?, ?)
    `);
    
    for (const user of fakeUsers) {
        insertUser.run(user.userId, user.createdAt, user.createdAt);
    }
    console.log(`✅ Inserted ${fakeUsers.length} users`);
    
    // Insert fake sessions with metadata
    const fakeSessions: FakeSession[] = [
        // Alice - Normal user, high trust scores
        { sessionId: 'session-alice-1', userId: 'alice-demo', trustScore: 92, isAnomaly: false, deviceType: 'desktop', region: 'US', ageGroup: '25-34', gender: 'female', createdAt: now - 2 * oneDay },
        { sessionId: 'session-alice-2', userId: 'alice-demo', trustScore: 88, isAnomaly: false, deviceType: 'desktop', region: 'US', ageGroup: '25-34', gender: 'female', createdAt: now - 1 * oneDay },
        { sessionId: 'session-alice-3', userId: 'alice-demo', trustScore: 90, isAnomaly: false, deviceType: 'laptop', region: 'US', ageGroup: '25-34', gender: 'female', createdAt: now - 12 * 60 * 60 * 1000 },
        
        // Bob - Some anomalies
        { sessionId: 'session-bob-1', userId: 'bob-demo', trustScore: 45, isAnomaly: true, deviceType: 'mobile', region: 'EU', ageGroup: '18-24', gender: 'male', createdAt: now - 1.5 * oneDay },
        { sessionId: 'session-bob-2', userId: 'bob-demo', trustScore: 78, isAnomaly: false, deviceType: 'mobile', region: 'EU', ageGroup: '18-24', gender: 'male', createdAt: now - 0.5 * oneDay },
        
        // Charlie - Normal user
        { sessionId: 'session-charlie-1', userId: 'charlie-demo', trustScore: 85, isAnomaly: false, deviceType: 'desktop', region: 'ASIA', ageGroup: '35-44', gender: 'male', createdAt: now - 1 * oneDay },
        { sessionId: 'session-charlie-2', userId: 'charlie-demo', trustScore: 87, isAnomaly: false, deviceType: 'desktop', region: 'ASIA', ageGroup: '35-44', gender: 'male', createdAt: now - 6 * 60 * 60 * 1000 },
        
        // Diana - Mixed results
        { sessionId: 'session-diana-1', userId: 'diana-demo', trustScore: 72, isAnomaly: false, deviceType: 'laptop', region: 'US', ageGroup: '25-34', gender: 'female', createdAt: now - 0.8 * oneDay },
        { sessionId: 'session-diana-2', userId: 'diana-demo', trustScore: 35, isAnomaly: true, deviceType: 'mobile', region: 'US', ageGroup: '25-34', gender: 'female', createdAt: now - 4 * 60 * 60 * 1000 },
        
        // Eve - Recent sessions
        { sessionId: 'session-eve-1', userId: 'eve-demo', trustScore: 95, isAnomaly: false, deviceType: 'desktop', region: 'EU', ageGroup: '45-54', gender: 'female', createdAt: now - 2 * 60 * 60 * 1000 },
        { sessionId: 'session-eve-2', userId: 'eve-demo', trustScore: 89, isAnomaly: false, deviceType: 'desktop', region: 'EU', ageGroup: '45-54', gender: 'female', createdAt: now - 1 * 60 * 60 * 1000 },
    ];
    
    console.log('📝 Inserting sessions...');
    const insertSession = db.prepare(`
        INSERT OR REPLACE INTO sessions (
            session_id, user_id, session_token, events, trust_score, is_anomaly, created_at, scored_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const session of fakeSessions) {
        const fakeEvents = JSON.stringify([
            { type: 'keydown', timestamp: session.createdAt, keyClass: 'letter' },
            { type: 'keyup', timestamp: session.createdAt + 100, keyClass: 'letter' },
            { type: 'keydown', timestamp: session.createdAt + 200, keyClass: 'letter' },
            { type: 'keyup', timestamp: session.createdAt + 300, keyClass: 'letter' },
        ]);
        
        insertSession.run(
            session.sessionId,
            session.userId,
            `token-${session.sessionId}`,
            fakeEvents,
            session.trustScore,
            session.isAnomaly ? 1 : 0,
            session.createdAt,
            session.createdAt + 1000
        );
    }
    console.log(`✅ Inserted ${fakeSessions.length} sessions`);
    
    // Add metadata table for fairness metrics
    console.log('📊 Creating metadata table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS session_metadata (
            session_id TEXT PRIMARY KEY,
            device_type TEXT,
            region TEXT,
            age_group TEXT,
            gender TEXT,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        );
        
        CREATE INDEX IF NOT EXISTS idx_metadata_device ON session_metadata(device_type);
        CREATE INDEX IF NOT EXISTS idx_metadata_region ON session_metadata(region);
        CREATE INDEX IF NOT EXISTS idx_metadata_age ON session_metadata(age_group);
        CREATE INDEX IF NOT EXISTS idx_metadata_gender ON session_metadata(gender);
    `);
    
    console.log('📋 Inserting session metadata...');
    const insertMetadata = db.prepare(`
        INSERT OR REPLACE INTO session_metadata (
            session_id, device_type, region, age_group, gender, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const session of fakeSessions) {
        insertMetadata.run(
            session.sessionId,
            session.deviceType,
            session.region,
            session.ageGroup,
            session.gender,
            session.createdAt
        );
    }
    console.log(`✅ Inserted metadata for ${fakeSessions.length} sessions`);
    
    // Insert default policy rules
    console.log('🔒 Inserting default policy rules...');
    const defaultRules = [
        {
            name: 'Block Low Trust Scores',
            condition: 'trustScore < 40',
            action: 'BLOCK_SESSION',
            enabled: true,
            priority: 1
        },
        {
            name: 'Require OTP for Anomalies',
            condition: 'isAnomaly = true',
            action: 'REQUIRE_OTP',
            enabled: true,
            priority: 2
        },
        {
            name: 'Notify Admin for Bot Detection',
            condition: 'isBot = true',
            action: 'NOTIFY_ADMIN',
            enabled: true,
            priority: 3
        },
        {
            name: 'Require CAPTCHA for Medium Risk',
            condition: 'trustScore < 60 AND trustScore >= 40',
            action: 'REQUIRE_CAPTCHA',
            enabled: true,
            priority: 4
        }
    ];
    
    // Clear existing rules first (optional - comment out if you want to keep existing)
    db.prepare('DELETE FROM policy_rules').run();
    
    for (const rule of defaultRules) {
        savePolicyRule(rule);
    }
    console.log(`✅ Inserted ${defaultRules.length} policy rules`);
    
    console.log('\n✨ Fake data insertion complete!');
    console.log(`📊 Summary:`);
    console.log(`   - ${fakeUsers.length} users`);
    console.log(`   - ${fakeSessions.length} sessions`);
    console.log(`   - ${defaultRules.length} policy rules`);
    console.log(`   - Metadata for fairness metrics`);
}

// Run if called directly
if (require.main === module) {
    insertFakeData();
    process.exit(0);
}

export { insertFakeData };

