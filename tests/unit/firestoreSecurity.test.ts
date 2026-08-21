import * as fs from 'fs';
import * as path from 'path';

describe('Firestore Security Rules Hardening', () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  let rulesContent = '';

  beforeAll(() => {
    rulesContent = fs.readFileSync(rulesPath, 'utf8');
  });

  describe('Global & Wildcard Rule Checks', () => {
    test('Must specify rules_version = "2"', () => {
      expect(rulesContent).toMatch(/rules_version\s*=\s*['"]2['"]/);
    });

    test('Must NOT contain global allow rule: allow read, write: if request.auth != null;', () => {
      expect(rulesContent).not.toContain('allow read, write: if request.auth != null;');
    });

    test('Must NOT contain open access rule: allow read, write: if true;', () => {
      expect(rulesContent).not.toContain('allow read, write: if true;');
    });

    test('Must NOT have broad wildcard match /{document=**} with allow rule', () => {
      const broadMatch = rulesContent.match(/match\s*\/\{document=\*\*\}[^}]*allow[^;]+;/);
      if (broadMatch) {
        expect(broadMatch[0]).not.toContain('request.auth');
        expect(broadMatch[0]).not.toContain('true');
      }
    });
  });

  describe('Users Collection Security (/users/{userId})', () => {
    test('Contains /users/{userId} collection matcher', () => {
      expect(rulesContent).toContain('match /users/{userId}');
    });

    test('Enforces isOwner(userId) on read', () => {
      expect(rulesContent).toMatch(/match \/users\/\{userId\}[\s\S]*?allow read:\s*if\s+isOwner\(userId\);/);
    });

    test('Enforces isOwner(userId) and UID consistency on create', () => {
      expect(rulesContent).toMatch(/match \/users\/\{userId\}[\s\S]*?allow create:\s*if\s+isOwner\(userId\)/);
      expect(rulesContent).toContain('incomingData().uid == userId');
    });

    test('Prevents identity takeover on update', () => {
      expect(rulesContent).toMatch(/match \/users\/\{userId\}[\s\S]*?allow update:\s*if\s+isOwner\(userId\)/);
      expect(rulesContent).toContain('existingData().uid == userId');
    });

    test('Enforces privilege escalation prevention (role, admin, isAdmin, permissions)', () => {
      expect(rulesContent).toContain('hasNoPrivilegeEscalation');
      expect(rulesContent).toContain("'role' in incomingData()");
      expect(rulesContent).toContain("'admin' in incomingData()");
      expect(rulesContent).toContain("'isAdmin' in incomingData()");
    });

    test('Enforces isOwner(userId) on delete', () => {
      expect(rulesContent).toMatch(/match \/users\/\{userId\}[\s\S]*?allow delete:\s*if\s+isOwner\(userId\);/);
    });
  });

  describe('User Sessions Collection Security (/user_sessions/{sessionId})', () => {
    test('Contains /user_sessions/{sessionId} collection matcher', () => {
      expect(rulesContent).toContain('match /user_sessions/{sessionId}');
    });

    test('Enforces request.auth.uid matches incoming userId on create', () => {
      expect(rulesContent).toMatch(/allow create:\s*if\s+isAuthenticated\(\)\s*&&\s*'userId' in incomingData\(\)\s*&&\s*incomingData\(\)\.userId == request\.auth\.uid;/);
    });

    test('Enforces request.auth.uid matches existing userId on read', () => {
      expect(rulesContent).toMatch(/allow read:\s*if\s+isAuthenticated\(\)\s*&&\s*existingData\(\)\.userId == request\.auth\.uid;/);
    });

    test('Enforces request.auth.uid matches existing & incoming userId on update (no transfer)', () => {
      expect(rulesContent).toMatch(/allow update:\s*if\s+isAuthenticated\(\)\s*&&\s*existingData\(\)\.userId == request\.auth\.uid/);
    });

    test('Enforces request.auth.uid matches existing userId on delete', () => {
      expect(rulesContent).toMatch(/allow delete:\s*if\s+isAuthenticated\(\)\s*&&\s*existingData\(\)\.userId == request\.auth\.uid;/);
    });
  });

  describe('Application Query & Component Compatibility', () => {
    test('FirebaseHealthCheck does not execute illegal unauthenticated collection queries', () => {
      const healthCheckPath = path.resolve(__dirname, '../../src/components/FirebaseHealthCheck.tsx');
      const content = fs.readFileSync(healthCheckPath, 'utf8');
      expect(content).not.toContain("query(collection(db, 'user_sessions'), limit(1))");
    });

    test('sessionService queries user_sessions only with where("userId", "==", userId)', () => {
      const sessionServicePath = path.resolve(__dirname, '../../src/services/sessionService.ts');
      const content = fs.readFileSync(sessionServicePath, 'utf8');
      expect(content).toContain('where("userId", "==", userId)');
    });

    test('googleAuthService syncs only to authenticated user.uid document in users collection', () => {
      const authServicePath = path.resolve(__dirname, '../../src/services/googleAuthService.ts');
      const content = fs.readFileSync(authServicePath, 'utf8');
      expect(content).toContain("doc(db, 'users', user.uid)");
    });
  });
});
