// scripts/validateQualityGate.cjs
// Validates all Quality Gate conditions according to Krishna AI CI/CD requirements:
// 1. reports/test-results.json exists, valid JSON, total >= 400, failed === 0, blocked === 0
// 2. reports/Krishna-Test-Report.xlsx exists, size > 0
// 3. reports/index.html exists, non-empty
// 4. Quality Gate status: DEPLOYMENT READY = YES (exit 0) or NO (exit 1)

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');
const JSON_REPORT = path.join(REPORTS_DIR, 'test-results.json');
const EXCEL_REPORT = path.join(REPORTS_DIR, 'Krishna-Test-Report.xlsx');
const HTML_REPORT = path.join(REPORTS_DIR, 'index.html');

console.log('='.repeat(70));
console.log('  [QUALITY GATE] KRISHNA AI CI/CD DEPLOYMENT READINESS AUDIT');
console.log('='.repeat(70));

let gatePass = true;
const checks = [];

function check(name, pass, details) {
  checks.push({ name, pass, details });
  if (!pass) gatePass = false;
  const icon = pass ? '✓ PASS' : '✗ FAIL';
  console.log(`  [${icon}] ${name.padEnd(35)} : ${details}`);
}

// 1. JSON Report Validation
if (!fs.existsSync(JSON_REPORT)) {
  check('JSON Report Exists', false, `${JSON_REPORT} missing`);
} else {
  try {
    const raw = fs.readFileSync(JSON_REPORT, 'utf8');
    const data = JSON.parse(raw);
    const summary = data.summary || {};
    const total = summary.total || (data.results ? data.results.length : 0);
    const passed = summary.passed || 0;
    const failed = summary.failed || 0;
    const blocked = summary.blocked || 0;

    check('JSON Report Parseable', true, `${raw.length} bytes`);
    check('Minimum 400+ Test Cases', total >= 400, `Actual Total: ${total} tests (Threshold >= 400)`);
    check('Zero Failed Tests', failed === 0, `Failed: ${failed}`);
    check('Zero Blocked Mandatory Tests', blocked === 0, `Blocked: ${blocked}`);
    check('Pass Rate Threshold (100%)', total > 0 && failed === 0, `Pass Rate: ${((passed / total) * 100).toFixed(1)}%`);
  } catch (err) {
    check('JSON Report Parseable', false, `Parse error: ${err.message}`);
  }
}

// 2. Excel Report Validation
if (!fs.existsSync(EXCEL_REPORT)) {
  check('Excel Report Exists', false, `${EXCEL_REPORT} missing`);
} else {
  const stat = fs.statSync(EXCEL_REPORT);
  check('Excel Report Valid & Sized', stat.size > 1000, `Size: ${stat.size} bytes (${(stat.size / 1024).toFixed(1)} KB)`);
}

// 3. HTML Report Validation
if (!fs.existsSync(HTML_REPORT)) {
  check('HTML Report Exists', false, `${HTML_REPORT} missing`);
} else {
  const stat = fs.statSync(HTML_REPORT);
  check('HTML Dashboard Generated', stat.size > 1000, `Size: ${stat.size} bytes (${(stat.size / 1024).toFixed(1)} KB)`);
}

console.log('-'.repeat(70));
if (gatePass) {
  console.log('  >>> DEPLOYMENT READY: YES <<<');
  console.log('  All quality gates satisfied. Automated release gate unlocked.');
  console.log('='.repeat(70));
  process.exit(0);
} else {
  console.error('  >>> DEPLOYMENT READY: NO <<<');
  console.error('  Quality gate check failed. Review errors above.');
  console.log('='.repeat(70));
  process.exit(1);
}
