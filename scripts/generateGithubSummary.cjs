// scripts/generateGithubSummary.cjs
// Dynamically generates the GitHub Actions Step Summary from actual test results.
// Reads test-results/test-results.json — NEVER hard-codes any values.

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEST_RESULTS_DIR = path.join(PROJECT_ROOT, 'test-results');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');

// Find test results JSON
const INPUT_FILE = fs.existsSync(path.join(TEST_RESULTS_DIR, 'test-results.json'))
  ? path.join(TEST_RESULTS_DIR, 'test-results.json')
  : path.join(REPORTS_DIR, 'test-results.json');

if (!fs.existsSync(INPUT_FILE)) {
  console.error('[QA] WARNING: test-results.json not found. Writing fallback summary.');
  const fallback = [
    '# Krishna Website — Automated Test Report',
    '',
    '> ⚠️ **Test results file not found.** The test suite may not have executed.',
    '',
    '| Metric | Value |',
    '| --- | --- |',
    '| **Status** | ❌ UNKNOWN |',
    '| **Reason** | test-results.json missing |',
  ].join('\n');

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, fallback + '\n');
  } else {
    console.log(fallback);
  }
  process.exit(0);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
} catch (err) {
  console.error('[QA] FATAL: test-results.json is not valid JSON.', err.message);
  process.exit(1);
}

const results = data.results || [];
const meta = data.meta || {};

// ── Dynamic Calculations ────────────────────────────────────────────────
const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const skipped = results.filter(r => r.status === 'SKIPPED').length;
const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
const totalDuration = results.reduce((acc, r) => acc + (r.duration || 0), 0);
const durationStr = (totalDuration / 1000).toFixed(2) + 's';

const isPassing = failed === 0 && passed > 0;

// ── Suite Breakdown ─────────────────────────────────────────────────────
const suiteCategories = ['Static Validation', 'Frontend', 'Backend', 'End-to-End', 'Security', 'Build'];

const suites = suiteCategories.map(cat => {
  const suiteTests = results.filter(r => r.category === cat);
  const sTotal = suiteTests.length;
  const sPassed = suiteTests.filter(r => r.status === 'PASS').length;
  const sFailed = suiteTests.filter(r => r.status === 'FAIL').length;
  const sStatus = sFailed > 0 ? '🔴 FAIL' : (sTotal > 0 && sPassed === sTotal ? '🟢 PASS' : '⚪ N/A');
  return { category: cat, total: sTotal, passed: sPassed, failed: sFailed, status: sStatus };
});

// ── Quality Gates (derived from actual test results) ────────────────────
function getQualityGateStatus(testIdPattern) {
  const test = results.find(r => r.testId && r.testId.startsWith(testIdPattern));
  if (!test) return '⚪ N/A';
  return test.status === 'PASS' ? '🟢 PASS' : '🔴 FAIL';
}

function getSuiteQualityGate(category) {
  const suiteTests = results.filter(r => r.category === category);
  if (suiteTests.length === 0) return '⚪ N/A';
  const allPassed = suiteTests.every(r => r.status === 'PASS');
  return allPassed ? '🟢 PASS' : '🔴 FAIL';
}

const qualityGates = [
  { name: 'TypeScript Type Check', status: getQualityGateStatus('TC-STATIC-001') },
  { name: 'ESLint / Linting', status: getQualityGateStatus('TC-STATIC-010') },
  { name: 'Unit Tests', status: getSuiteQualityGate('Frontend') },
  { name: 'Integration Tests', status: getSuiteQualityGate('Backend') },
  { name: 'E2E Tests', status: getSuiteQualityGate('End-to-End') },
  { name: 'Production Build', status: getSuiteQualityGate('Build') },
];

// ── Build the Markdown ──────────────────────────────────────────────────
const lines = [];

lines.push('# Krishna Website — Automated Test Report');
lines.push('');

// Overall Status
if (isPassing) {
  lines.push('### Overall Status');
  lines.push(`🟢 **PASS — ${passRate}% Pass Rate**`);
} else {
  lines.push('### Overall Status');
  lines.push(`🔴 **FAIL — ${passRate}% Pass Rate**`);
}
lines.push('');

// Results Summary
lines.push('### Results Summary');
lines.push('');
lines.push('| Metric | Result |');
lines.push('| --- | --- |');
lines.push(`| **Total Tests** | ${total} |`);
lines.push(`| **Passed** | ${passed} |`);
lines.push(`| **Failed** | ${failed} |`);
lines.push(`| **Skipped** | ${skipped} |`);
lines.push(`| **Pass Rate** | **${passRate}%** |`);
lines.push(`| **Total Duration** | ${durationStr} |`);
lines.push('');

// Test Suites
lines.push('### Test Suites');
lines.push('');
lines.push('| Suite | Total | Passed | Failed | Status |');
lines.push('| --- | --- | --- | --- | --- |');
for (const s of suites) {
  lines.push(`| **${s.category}** | ${s.total} | ${s.passed} | ${s.failed} | ${s.status} |`);
}
lines.push('');

// Quality Gates
lines.push('### Quality Gates');
lines.push('');
lines.push('| Quality Gate | Status |');
lines.push('| --- | --- |');
for (const g of qualityGates) {
  lines.push(`| ${g.name} | ${g.status} |`);
}
lines.push('');

// Failed Tests (if any)
if (failed > 0) {
  lines.push('### ❌ Failed Tests');
  lines.push('');
  lines.push('| Test ID | Test Name | Error |');
  lines.push('| --- | --- | --- |');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    const errMsg = (r.errorMessage || 'Unknown error').replace(/\|/g, '\\|').substring(0, 120);
    lines.push(`| \`${r.testId}\` | ${r.testName} | ${errMsg} |`);
  });
  lines.push('');
}

// CI/CD Info
lines.push('### CI/CD Information');
lines.push('');
lines.push('| Property | Value |');
lines.push('| --- | --- |');
lines.push(`| **Repository** | Hevanth-8705/Krishna-website |`);
lines.push(`| **Branch** | ${process.env.GITHUB_REF_NAME || 'main'} |`);
lines.push(`| **Commit** | \`${(process.env.GITHUB_SHA || 'local').substring(0, 7)}\` |`);
lines.push(`| **Workflow** | ${process.env.GITHUB_WORKFLOW || 'Local Execution'} |`);
lines.push(`| **Run ID** | ${process.env.GITHUB_RUN_ID || 'N/A'} |`);
lines.push(`| **Node.js** | ${meta.nodeVersion || process.version} |`);
lines.push(`| **OS** | ${process.env.RUNNER_OS || meta.environment || process.platform} |`);
lines.push(`| **Generated** | ${meta.generatedAt || new Date().toISOString()} |`);
lines.push('');

// Artifact
lines.push('### 📦 Test Report Artifact');
lines.push('');
lines.push('Download the **krishna-website-test-report** artifact from this workflow run to view the interactive HTML QA dashboard.');
lines.push('');

// Final Verdict
lines.push('---');
lines.push('');
if (isPassing) {
  lines.push(`### ✅ Final Verdict: ALL REQUIRED TESTS PASSED (${passed}/${total})`);
} else {
  lines.push(`### ❌ Final Verdict: TEST PIPELINE FAILED (${passed}/${total} passed, ${failed} failed)`);
}

const markdown = lines.join('\n');

// Write to GITHUB_STEP_SUMMARY or stdout
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown + '\n');
  console.log('[QA] GitHub Step Summary written successfully.');
} else {
  // Local execution — print to stdout for preview
  console.log('[QA] GitHub Step Summary Preview (GITHUB_STEP_SUMMARY not set):');
  console.log('');
  console.log(markdown);
}
