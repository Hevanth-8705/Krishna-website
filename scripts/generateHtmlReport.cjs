// scripts/generateHtmlReport.cjs
// Generates a self-contained, professional QA dashboard HTML report.
// Title: KRISHNA WEBSITE — AUTOMATED TEST & QUALITY DASHBOARD
// All data is dynamically read from test-results/test-results.json.
// NO hard-coded test counts or values.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');
const TEST_RESULTS_DIR = path.join(PROJECT_ROOT, 'test-results');

fs.mkdirSync(REPORTS_DIR, { recursive: true });
fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });

const INPUT_FILE = fs.existsSync(path.join(TEST_RESULTS_DIR, 'test-results.json'))
  ? path.join(TEST_RESULTS_DIR, 'test-results.json')
  : path.join(REPORTS_DIR, 'test-results.json');

const OUTPUT_FILE_1 = path.join(TEST_RESULTS_DIR, 'index.html');
const OUTPUT_FILE_2 = path.join(REPORTS_DIR, 'index.html');

if (!fs.existsSync(INPUT_FILE)) {
  console.error('[QA] FATAL: test-results.json does not exist.');
  console.error('[QA] Run "npm run qa:test" first to generate test results.');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
} catch (err) {
  console.error('[QA] FATAL: test-results.json is not valid JSON.', err.message);
  process.exit(1);
}

const meta = data.meta || {};
const results = data.results || [];

// ── Dynamic Calculations ────────────────────────────────────────────────
const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const skipped = results.filter(r => r.status === 'SKIPPED').length;
const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
const totalDuration = results.reduce((acc, r) => acc + (r.duration || 0), 0);
const durationFormatted = totalDuration >= 1000
  ? (totalDuration / 1000).toFixed(2) + 's'
  : totalDuration + 'ms';

const isPipelinePassing = failed === 0 && passed > 0;

// Git info
let commitSha = process.env.GITHUB_SHA || '';
let branch = process.env.GITHUB_REF_NAME || '';
let runId = process.env.GITHUB_RUN_ID || '';
let workflowName = process.env.GITHUB_WORKFLOW || '';

try {
  if (!commitSha) commitSha = execSync('git rev-parse HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
  if (!branch) branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
} catch (e) {
  if (!commitSha) commitSha = 'Local Execution';
  if (!branch) branch = 'main';
}
if (!runId) runId = 'N/A (Local)';
if (!workflowName) workflowName = 'Local Execution';

const commitShort = commitSha.length > 7 ? commitSha.substring(0, 7) : commitSha;
const generatedAt = meta.generatedAt || new Date().toISOString();

// ── Suite Calculations ──────────────────────────────────────────────────
const allCategories = [...new Set(results.map(r => r.category))];
const suiteIcons = {
  'Static Validation': '🔍',
  'Frontend': '🎨',
  'Backend': '⚙️',
  'End-to-End': '🔗',
  'Security': '🛡️',
  'Build': '📦',
  'Functional Testing': '⚡',
  'UI UX Testing': '✨',
  'Unit Testing': '🧪',
  'API Testing': '📡',
  'Integration Testing': '🔌',
  'Selenium E2E': '🌐',
  'Appium': '📱',
  'Performance': '⚡',
  'Regression': '🔄',
  'Auth': '🔐',
  'AiCore': '🧠',
  'Vision': '👁️',
  'Learn': '📚',
  'Agent': '🤖',
  'Canvas': '🎨',
  'Dashboard': '📊',
  'Device Hub': '🖥️',
  'Voice': '🎙️',
};

const suiteSummary = allCategories.map(cat => {
  const suiteTests = results.filter(r => r.category === cat);
  const cTotal = suiteTests.length;
  const cPassed = suiteTests.filter(r => r.status === 'PASS').length;
  const cFailed = suiteTests.filter(r => r.status === 'FAIL').length;
  const cSkipped = suiteTests.filter(r => r.status === 'SKIPPED').length;
  const cDuration = suiteTests.reduce((a, r) => a + (r.duration || 0), 0);
  const cPassRate = cTotal > 0 ? ((cPassed / cTotal) * 100).toFixed(0) : '0';
  const cStatus = cFailed > 0 ? 'FAIL' : (cTotal > 0 && cPassed === cTotal ? 'PASS' : 'N/A');
  return { category: cat, icon: suiteIcons[cat] || '📋', total: cTotal, passed: cPassed, failed: cFailed, skipped: cSkipped, duration: cDuration, passRate: cPassRate, status: cStatus };
});

// ── Quality Gates (derived from actual test results) ────────────────────
function getGateFromTest(testId) {
  const t = results.find(r => r.testId === testId);
  return t ? t.status : 'N/A';
}
function getGateFromSuite(category) {
  const suiteTests = results.filter(r => r.category === category || (r.category && r.category.includes(category)));
  if (suiteTests.length === 0) return 'N/A';
  return suiteTests.every(r => r.status === 'PASS') ? 'PASS' : 'FAIL';
}

const qualityGates = [
  { name: 'TypeScript Type Check', status: getGateFromTest('TC-STATIC-001') },
  { name: 'ESLint / Code Quality', status: getGateFromTest('TC-STATIC-010') },
  { name: 'Unit Tests', status: getGateFromSuite('Unit') },
  { name: 'API / Backend Tests', status: getGateFromSuite('API') },
  { name: 'Integration Tests', status: getGateFromSuite('Integration') },
  { name: 'Selenium E2E Tests', status: getGateFromSuite('Selenium') },
  { name: 'Security Hardening', status: getGateFromSuite('Security') },
  { name: 'Performance Benchmarks', status: getGateFromSuite('Performance') },
  { name: 'Production Build', status: getGateFromSuite('Build') },
];

// ── HTML Escape ─────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── SVG Bar Chart ───────────────────────────────────────────────────────
function generateSuiteChart() {
  const barWidth = 60;
  const gap = 24;
  const chartWidth = suiteSummary.length * (barWidth + gap) + gap;
  const maxVal = Math.max(...suiteSummary.map(s => s.total), 1);
  const chartHeight = 180;

  let bars = '';
  suiteSummary.forEach((s, i) => {
    const x = gap + i * (barWidth + gap);
    const passH = (s.passed / maxVal) * (chartHeight - 30);
    const failH = (s.failed / maxVal) * (chartHeight - 30);
    const passY = chartHeight - passH;
    const failY = passY - failH;

    // Passed bar
    bars += `<rect x="${x}" y="${passY}" width="${barWidth}" height="${passH}" rx="4" fill="url(#passGrad)" opacity="0.9"><animate attributeName="height" from="0" to="${passH}" dur="0.6s" fill="freeze"/><animate attributeName="y" from="${chartHeight}" to="${passY}" dur="0.6s" fill="freeze"/></rect>`;
    // Failed bar (stacked on top)
    if (s.failed > 0) {
      bars += `<rect x="${x}" y="${failY}" width="${barWidth}" height="${failH}" rx="4" fill="url(#failGrad)" opacity="0.9"><animate attributeName="height" from="0" to="${failH}" dur="0.6s" fill="freeze"/><animate attributeName="y" from="${passY}" to="${failY}" dur="0.6s" fill="freeze"/></rect>`;
    }
    // Value label
    bars += `<text x="${x + barWidth / 2}" y="${passY - 6}" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">${s.total}</text>`;
    // Category label
    const shortName = s.category === 'Static Validation' ? 'Static' : (s.category === 'End-to-End' ? 'E2E' : s.category);
    bars += `<text x="${x + barWidth / 2}" y="${chartHeight + 16}" fill="#64748b" font-size="11" text-anchor="middle">${shortName}</text>`;
  });

  return `<svg viewBox="0 0 ${chartWidth} ${chartHeight + 24}" width="100%" style="max-width:${chartWidth}px;">
    <defs>
      <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient>
      <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f87171"/><stop offset="100%" stop-color="#dc2626"/></linearGradient>
    </defs>
    ${bars}
  </svg>`;
}

// ── Donut Chart ─────────────────────────────────────────────────────────
function generateDonutChart() {
  const size = 160;
  const cx = size / 2, cy = size / 2, r = 56, strokeW = 14;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: passed, color: '#10b981', label: 'Passed' },
    { value: failed, color: '#ef4444', label: 'Failed' },
    { value: skipped, color: '#f59e0b', label: 'Skipped' },
  ].filter(s => s.value > 0);

  let arcs = '';
  let offset = 0;
  segments.forEach(seg => {
    const pct = seg.value / total;
    const len = pct * circumference;
    arcs += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${strokeW}" stroke-dasharray="${len} ${circumference - len}" stroke-dashoffset="${-offset}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"><animate attributeName="stroke-dasharray" from="0 ${circumference}" to="${len} ${circumference - len}" dur="0.8s" fill="freeze"/></circle>`;
    offset += len;
  });

  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#1e293b" stroke-width="${strokeW}"/>
    ${arcs}
    <text x="${cx}" y="${cy - 6}" fill="#f8fafc" font-size="22" font-weight="800" text-anchor="middle">${passRate}%</text>
    <text x="${cx}" y="${cy + 14}" fill="#94a3b8" font-size="10" text-anchor="middle">PASS RATE</text>
  </svg>`;
}

// ── Suite Cards HTML ────────────────────────────────────────────────────
function generateSuiteCards() {
  return suiteSummary.map(s => {
    const badgeClass = s.status === 'PASS' ? 'badge-pass' : (s.status === 'FAIL' ? 'badge-fail' : 'badge-skip');
    const durStr = s.duration >= 1000 ? (s.duration / 1000).toFixed(2) + 's' : s.duration + 'ms';
    return `
      <div class="suite-card">
        <div class="suite-header">
          <span class="suite-icon">${s.icon}</span>
          <span class="suite-name">${esc(s.category)}</span>
          <span class="badge ${badgeClass}">${s.status}</span>
        </div>
        <div class="suite-stats">
          <div class="suite-stat"><span class="suite-stat-val">${s.total}</span><span class="suite-stat-lbl">Total</span></div>
          <div class="suite-stat"><span class="suite-stat-val pass-clr">${s.passed}</span><span class="suite-stat-lbl">Passed</span></div>
          <div class="suite-stat"><span class="suite-stat-val fail-clr">${s.failed}</span><span class="suite-stat-lbl">Failed</span></div>
          <div class="suite-stat"><span class="suite-stat-val skip-clr">${s.skipped}</span><span class="suite-stat-lbl">Skipped</span></div>
        </div>
        <div class="suite-progress-wrap">
          <div class="suite-progress-bar" style="width:${s.passRate}%"></div>
        </div>
        <div class="suite-footer">
          <span class="suite-rate">${s.passRate}% Pass Rate</span>
          <span class="suite-dur">⏱ ${durStr}</span>
        </div>
      </div>`;
  }).join('');
}

// ── Quality Gate Cards ──────────────────────────────────────────────────
function generateQualityGates() {
  return qualityGates.map(g => {
    const cls = g.status === 'PASS' ? 'badge-pass' : (g.status === 'FAIL' ? 'badge-fail' : 'badge-skip');
    const icon = g.status === 'PASS' ? '✓' : (g.status === 'FAIL' ? '✕' : '—');
    return `
      <div class="gate-card">
        <div class="gate-icon ${g.status === 'PASS' ? 'gate-pass' : (g.status === 'FAIL' ? 'gate-fail' : 'gate-na')}">${icon}</div>
        <div class="gate-name">${esc(g.name)}</div>
        <span class="badge ${cls}">${g.status}</span>
      </div>`;
  }).join('');
}

// ── Detailed Test Rows ──────────────────────────────────────────────────
function generateTestRows() {
  return results.map(r => {
    const badgeCls = r.status === 'PASS' ? 'badge-pass' : (r.status === 'FAIL' ? 'badge-fail' : 'badge-skip');
    const durStr = r.duration !== undefined ? r.duration + 'ms' : '—';
    const errorCol = r.status === 'FAIL' ? esc(r.errorMessage || '') : '';
    return `
      <tr data-status="${r.status}" data-search="${esc((r.testId + ' ' + r.testName + ' ' + r.module + ' ' + r.category).toLowerCase())}">
        <td><code class="test-id">${esc(r.testId)}</code></td>
        <td><strong>${esc(r.testName)}</strong></td>
        <td><span class="module-tag">${esc(r.module)}</span></td>
        <td><span class="badge ${badgeCls}">${r.status}</span></td>
        <td class="dur-cell">${durStr}</td>
        <td class="error-cell">${errorCol}</td>
      </tr>`;
  }).join('');
}

// ── Failure Diagnostics ─────────────────────────────────────────────────
function generateFailureDiagnostics() {
  const failedTests = results.filter(r => r.status === 'FAIL');
  if (failedTests.length === 0) {
    return `
      <div class="success-banner">
        <span class="success-icon">✓</span>
        <span>No failed tests detected. All test cases passed successfully.</span>
      </div>`;
  }

  return failedTests.map(r => `
    <details class="failure-detail">
      <summary class="failure-summary">
        <span class="badge badge-fail">FAIL</span>
        <code>${esc(r.testId)}</code> — ${esc(r.testName)}
      </summary>
      <div class="failure-body">
        <div class="failure-row"><span class="failure-label">Test ID</span><span>${esc(r.testId)}</span></div>
        <div class="failure-row"><span class="failure-label">Module</span><span>${esc(r.module)}</span></div>
        <div class="failure-row"><span class="failure-label">Category</span><span>${esc(r.category)}</span></div>
        <div class="failure-row"><span class="failure-label">Error Message</span><span class="fail-clr">${esc(r.errorMessage || 'Unknown error')}</span></div>
        ${r.stackTrace ? `<div class="failure-stack"><span class="failure-label">Stack Trace</span><pre>${esc(r.stackTrace)}</pre></div>` : ''}
        ${r.screenshot ? `<div class="failure-row"><span class="failure-label">Screenshot</span><a href="${esc(r.screenshot)}" target="_blank">View Screenshot</a></div>` : ''}
        ${r.trace ? `<div class="failure-row"><span class="failure-label">Trace / Video</span><a href="${esc(r.trace)}" target="_blank">View Trace</a></div>` : ''}
      </div>
    </details>`).join('');
}

// ── Build HTML ──────────────────────────────────────────────────────────
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KRISHNA WEBSITE — Automated Test & Quality Dashboard</title>
  <meta name="description" content="Professional QA Dashboard for Krishna Website — Automated Test & Quality Report">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    /* ── CSS Custom Properties ──────────────────────────────────────── */
    :root {
      --bg-primary: #0b1120;
      --bg-secondary: #111827;
      --bg-card: #1a2332;
      --bg-card-hover: #1f2b3d;
      --bg-glass: rgba(26, 35, 50, 0.7);
      --border-primary: #1e3a5f;
      --border-subtle: rgba(255, 255, 255, 0.06);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-pass: #10b981;
      --accent-pass-bg: rgba(16, 185, 129, 0.12);
      --accent-fail: #ef4444;
      --accent-fail-bg: rgba(239, 68, 68, 0.12);
      --accent-skip: #f59e0b;
      --accent-skip-bg: rgba(245, 158, 11, 0.12);
      --accent-blue: #3b82f6;
      --accent-blue-bg: rgba(59, 130, 246, 0.12);
      --accent-purple: #8b5cf6;
      --accent-indigo: #6366f1;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 16px;
      --radius-xl: 20px;
      --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.25);
      --shadow-glow-pass: 0 0 30px rgba(16, 185, 129, 0.15);
      --shadow-glow-fail: 0 0 30px rgba(239, 68, 68, 0.15);
      --font: 'Inter', system-ui, -apple-system, sans-serif;
      --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Reset & Base ──────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: var(--font);
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }

    /* ── Animations ────────────────────────────────────────────────── */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .animate-in {
      animation: fadeInUp 0.5s ease-out forwards;
      opacity: 0;
    }

    /* ── Header ────────────────────────────────────────────────────── */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 0;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border-subtle);
      flex-wrap: wrap;
      gap: 1rem;
      animation: fadeIn 0.6s ease-out;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .brand-logo {
      width: 44px; height: 44px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -1px;
    }

    .brand-text h1 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .brand-text .brand-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 600;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .header-chip {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      background: var(--bg-card);
      padding: 0.35rem 0.75rem;
      border-radius: 99px;
      border: 1px solid var(--border-subtle);
    }

    /* ── Section Headers ───────────────────────────────────────────── */
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      margin-top: 2.5rem;
    }

    .section-header h2 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .section-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, var(--border-primary), transparent);
    }

    .section-num {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--accent-blue);
      background: var(--accent-blue-bg);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    /* ── Hero Status ───────────────────────────────────────────────── */
    .hero-status {
      background: ${isPipelinePassing
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.08) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)'};
      border: 1px solid ${isPipelinePassing ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      text-align: center;
      position: relative;
      overflow: hidden;
      box-shadow: ${isPipelinePassing ? 'var(--shadow-glow-pass)' : 'var(--shadow-glow-fail)'};
      animation: fadeInUp 0.5s ease-out;
    }

    .hero-status::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(ellipse at 50% 0%, ${isPipelinePassing ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'} 0%, transparent 70%);
      pointer-events: none;
    }

    .hero-icon {
      font-size: 3.5rem;
      margin-bottom: 0.5rem;
      display: inline-block;
    }

    .hero-title {
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: 0.02em;
      color: ${isPipelinePassing ? 'var(--accent-pass)' : 'var(--accent-fail)'};
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .hero-subtitle {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: 2.5rem;
      flex-wrap: wrap;
    }

    .hero-stat {
      text-align: center;
    }

    .hero-stat-val {
      font-size: 1.75rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .hero-stat-lbl {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* ── Stat Cards ────────────────────────────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      text-align: center;
      box-shadow: var(--shadow-card);
      transition: transform var(--transition), border-color var(--transition);
      animation: fadeInUp 0.5s ease-out backwards;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-primary);
    }

    .stat-card-icon {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .stat-card-val {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1.1;
    }

    .stat-card-lbl {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      font-weight: 600;
      margin-top: 0.25rem;
    }

    /* ── Suite Cards ───────────────────────────────────────────────── */
    .suites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .suite-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: var(--shadow-card);
      transition: transform var(--transition), border-color var(--transition);
      animation: fadeInUp 0.5s ease-out backwards;
    }

    .suite-card:hover {
      transform: translateY(-2px);
      border-color: var(--border-primary);
    }

    .suite-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .suite-icon { font-size: 1.25rem; }
    .suite-name { font-weight: 700; font-size: 0.95rem; flex: 1; }

    .suite-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .suite-stat { text-align: center; }
    .suite-stat-val { font-size: 1.25rem; font-weight: 700; display: block; }
    .suite-stat-lbl { font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em; }

    .suite-progress-wrap {
      height: 4px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 99px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .suite-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-pass), #34d399);
      border-radius: 99px;
      transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .suite-footer {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .suite-rate { font-weight: 600; color: var(--text-secondary); }
    .suite-dur { color: var(--text-muted); }

    /* ── Visualization ─────────────────────────────────────────────── */
    .viz-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      align-items: start;
    }

    @media (max-width: 768px) {
      .viz-grid { grid-template-columns: 1fr; }
    }

    .viz-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
    }

    .viz-card h3 {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 1rem;
    }

    .donut-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .donut-legend {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-label { color: var(--text-secondary); flex: 1; }
    .legend-val { font-weight: 700; color: var(--text-primary); }

    /* ── Badge ─────────────────────────────────────────────────────── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .badge-pass { background: var(--accent-pass-bg); color: var(--accent-pass); border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-fail { background: var(--accent-fail-bg); color: var(--accent-fail); border: 1px solid rgba(239, 68, 68, 0.3); }
    .badge-skip { background: var(--accent-skip-bg); color: var(--accent-skip); border: 1px solid rgba(245, 158, 11, 0.3); }

    .pass-clr { color: var(--accent-pass); }
    .fail-clr { color: var(--accent-fail); }
    .skip-clr { color: var(--accent-skip); }

    /* ── Controls ──────────────────────────────────────────────────── */
    .controls {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .search-input {
      flex: 1;
      min-width: 240px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      padding: 0.6rem 1rem;
      border-radius: var(--radius-sm);
      font-family: var(--font);
      font-size: 0.85rem;
      outline: none;
      transition: border-color var(--transition);
    }

    .search-input:focus {
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .search-input::placeholder { color: var(--text-muted); }

    .filter-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      padding: 0.6rem 1rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-family: var(--font);
      font-size: 0.8rem;
      font-weight: 600;
      transition: all var(--transition);
    }

    .filter-btn:hover { border-color: var(--accent-blue); color: var(--text-secondary); }
    .filter-btn.active { background: var(--accent-blue); color: #fff; border-color: var(--accent-blue); }

    /* ── Table ─────────────────────────────────────────────────────── */
    .table-wrap {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-card);
    }

    .table-inner { overflow-x: auto; }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.7rem 1rem;
      text-align: left;
      font-size: 0.85rem;
      border-bottom: 1px solid var(--border-subtle);
      white-space: nowrap;
    }

    th {
      background: rgba(11, 17, 32, 0.8);
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    tr { transition: background var(--transition); }
    tr:hover { background: var(--bg-card-hover); }

    .test-id {
      background: var(--bg-secondary);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--accent-blue);
    }

    .module-tag {
      background: rgba(139, 92, 246, 0.1);
      color: var(--accent-purple);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .dur-cell { color: var(--text-muted); font-variant-numeric: tabular-nums; }
    .error-cell { color: var(--accent-fail); font-size: 0.8rem; max-width: 300px; white-space: normal; word-break: break-word; }

    /* ── Quality Gates ─────────────────────────────────────────────── */
    .gates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .gate-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      text-align: center;
      box-shadow: var(--shadow-card);
      transition: transform var(--transition);
    }

    .gate-card:hover { transform: translateY(-2px); }

    .gate-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
    }

    .gate-pass { background: var(--accent-pass-bg); color: var(--accent-pass); }
    .gate-fail { background: var(--accent-fail-bg); color: var(--accent-fail); }
    .gate-na { background: rgba(100, 116, 139, 0.15); color: var(--text-muted); }

    .gate-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    /* ── CI/CD Info ─────────────────────────────────────────────────── */
    .info-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-card);
      overflow: hidden;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.7rem 1.25rem;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 0.85rem;
      transition: background var(--transition);
    }

    .info-item:hover { background: var(--bg-card-hover); }
    .info-label { color: var(--text-muted); font-weight: 500; }
    .info-val { font-weight: 600; color: var(--text-primary); text-align: right; }
    .info-val a { color: var(--accent-blue); text-decoration: none; }
    .info-val a:hover { text-decoration: underline; }
    .info-val code { background: var(--bg-secondary); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.8rem; color: var(--accent-blue); }

    /* ── Failure Diagnostics ────────────────────────────────────────── */
    .success-banner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--accent-pass-bg);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: var(--radius-md);
      padding: 1rem 1.25rem;
      color: var(--accent-pass);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .success-icon { font-size: 1.25rem; }

    .failure-detail {
      background: var(--bg-card);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-md);
      margin-bottom: 0.75rem;
      overflow: hidden;
    }

    .failure-summary {
      padding: 0.85rem 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      transition: background var(--transition);
      list-style: none;
    }

    .failure-summary::-webkit-details-marker { display: none; }
    .failure-summary::before { content: '▸'; color: var(--text-muted); transition: transform var(--transition); }
    details[open] .failure-summary::before { transform: rotate(90deg); }
    .failure-summary:hover { background: var(--bg-card-hover); }

    .failure-body { padding: 1rem 1.25rem; border-top: 1px solid var(--border-subtle); }

    .failure-row {
      display: flex;
      justify-content: space-between;
      padding: 0.4rem 0;
      font-size: 0.85rem;
      border-bottom: 1px dashed var(--border-subtle);
    }

    .failure-label { color: var(--text-muted); font-weight: 500; min-width: 120px; }

    .failure-stack {
      margin-top: 0.75rem;
    }

    .failure-stack pre {
      background: var(--bg-primary);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      color: var(--text-secondary);
      overflow-x: auto;
      margin-top: 0.5rem;
      line-height: 1.5;
    }

    /* ── Artifact Info ──────────────────────────────────────────────── */
    .artifact-card {
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
    }

    .artifact-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-subtle);
    }

    .artifact-item:last-child { border-bottom: none; }

    .artifact-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .artifact-name { font-weight: 600; font-size: 0.9rem; }
    .artifact-desc { font-size: 0.75rem; color: var(--text-muted); }

    /* ── Final Verdict ─────────────────────────────────────────────── */
    .verdict-banner {
      background: ${isPipelinePassing
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)'};
      border: 1px solid ${isPipelinePassing ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
      border-radius: var(--radius-xl);
      padding: 2rem;
      text-align: center;
      box-shadow: ${isPipelinePassing ? 'var(--shadow-glow-pass)' : 'var(--shadow-glow-fail)'};
    }

    .verdict-text {
      font-size: 1.5rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: ${isPipelinePassing ? 'var(--accent-pass)' : 'var(--accent-fail)'};
    }

    .verdict-detail {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    /* ── Footer ────────────────────────────────────────────────────── */
    .dashboard-footer {
      text-align: center;
      padding: 2rem 0 1rem;
      color: var(--text-muted);
      font-size: 0.8rem;
      border-top: 1px solid var(--border-subtle);
      margin-top: 3rem;
    }

    .dashboard-footer a {
      color: var(--accent-blue);
      text-decoration: none;
    }

    /* ── Responsive ────────────────────────────────────────────────── */
    @media (max-width: 640px) {
      .container { padding: 1rem; }
      .hero-title { font-size: 1.4rem; }
      .hero-stats { gap: 1.25rem; }
      .hero-stat-val { font-size: 1.3rem; }
      .stats-grid { grid-template-columns: repeat(3, 1fr); }
      .suites-grid { grid-template-columns: 1fr; }
      .gates-grid { grid-template-columns: repeat(2, 1fr); }
      .info-grid { grid-template-columns: 1fr; }
      .dashboard-header { flex-direction: column; align-items: flex-start; }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- ═══ HEADER ═══ -->
    <header class="dashboard-header">
      <div class="brand">
        <div class="brand-logo">KW</div>
        <div class="brand-text">
          <h1>KRISHNA WEBSITE</h1>
          <div class="brand-sub">Automated Test & Quality Dashboard</div>
        </div>
      </div>
      <div class="header-meta">
        <span class="header-chip">📅 ${esc(generatedAt.split('T')[0])}</span>
        <span class="header-chip">🔀 ${esc(branch)}</span>
        <span class="header-chip">🔖 ${esc(commitShort)}</span>
      </div>
    </header>

    <!-- ═══ SECTION 1: HERO STATUS ═══ -->
    <div class="hero-status">
      <div class="hero-icon">${isPipelinePassing ? '✓' : '✕'}</div>
      <div class="hero-title">${isPipelinePassing ? 'ALL TESTS PASSED' : 'TEST PIPELINE FAILED'}</div>
      <div class="hero-subtitle">Krishna Website Automated Quality Pipeline</div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-val" style="color:var(--text-primary)">${total}</div>
          <div class="hero-stat-lbl">Total Tests</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val pass-clr">${passed}</div>
          <div class="hero-stat-lbl">Passed</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val fail-clr">${failed}</div>
          <div class="hero-stat-lbl">Failed</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val skip-clr">${skipped}</div>
          <div class="hero-stat-lbl">Skipped</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val" style="color:var(--accent-blue)">${passRate}%</div>
          <div class="hero-stat-lbl">Pass Rate</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val" style="color:var(--accent-purple)">${durationFormatted}</div>
          <div class="hero-stat-lbl">Duration</div>
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 2: OVERALL STATISTICS ═══ -->
    <div class="section-header">
      <span class="section-num">02</span>
      <h2>Overall Statistics</h2>
      <div class="section-line"></div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" style="animation-delay:0.05s">
        <span class="stat-card-icon">📊</span>
        <div class="stat-card-val" style="color:var(--text-primary)">${total}</div>
        <div class="stat-card-lbl">Total Tests</div>
      </div>
      <div class="stat-card" style="animation-delay:0.1s">
        <span class="stat-card-icon">✅</span>
        <div class="stat-card-val pass-clr">${passed}</div>
        <div class="stat-card-lbl">Passed</div>
      </div>
      <div class="stat-card" style="animation-delay:0.15s">
        <span class="stat-card-icon">❌</span>
        <div class="stat-card-val fail-clr">${failed}</div>
        <div class="stat-card-lbl">Failed</div>
      </div>
      <div class="stat-card" style="animation-delay:0.2s">
        <span class="stat-card-icon">⏭️</span>
        <div class="stat-card-val skip-clr">${skipped}</div>
        <div class="stat-card-lbl">Skipped</div>
      </div>
      <div class="stat-card" style="animation-delay:0.25s">
        <span class="stat-card-icon">📈</span>
        <div class="stat-card-val" style="color:var(--accent-blue)">${passRate}%</div>
        <div class="stat-card-lbl">Pass Rate</div>
      </div>
      <div class="stat-card" style="animation-delay:0.3s">
        <span class="stat-card-icon">⏱️</span>
        <div class="stat-card-val" style="color:var(--accent-purple)">${durationFormatted}</div>
        <div class="stat-card-lbl">Duration</div>
      </div>
    </div>

    <!-- ═══ SECTION 3: TEST SUITE CARDS ═══ -->
    <div class="section-header">
      <span class="section-num">03</span>
      <h2>Test Suite Breakdown</h2>
      <div class="section-line"></div>
    </div>

    <div class="suites-grid">
      ${generateSuiteCards()}
    </div>

    <!-- ═══ SECTION 4: VISUALIZATION ═══ -->
    <div class="section-header">
      <span class="section-num">04</span>
      <h2>Test Suite Visualization</h2>
      <div class="section-line"></div>
    </div>

    <div class="viz-grid">
      <div class="viz-card">
        <h3>Tests by Suite</h3>
        ${generateSuiteChart()}
      </div>
      <div class="viz-card">
        <h3>Pass/Fail Distribution</h3>
        <div class="donut-center">
          ${generateDonutChart()}
          <div class="donut-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background:var(--accent-pass)"></span>
              <span class="legend-label">Passed</span>
              <span class="legend-val pass-clr">${passed}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background:var(--accent-fail)"></span>
              <span class="legend-label">Failed</span>
              <span class="legend-val fail-clr">${failed}</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot" style="background:var(--accent-skip)"></span>
              <span class="legend-label">Skipped</span>
              <span class="legend-val skip-clr">${skipped}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 5: DETAILED TEST CASES ═══ -->
    <div class="section-header">
      <span class="section-num">05</span>
      <h2>Detailed Test Cases</h2>
      <div class="section-line"></div>
    </div>

    <div class="controls">
      <input type="text" id="searchInput" class="search-input" placeholder="Search by test ID, name, or module..." onkeyup="filterTable()">
      <button class="filter-btn active" onclick="setFilter('ALL', this)">All (${total})</button>
      <button class="filter-btn" onclick="setFilter('PASS', this)">Passed (${passed})</button>
      <button class="filter-btn" onclick="setFilter('FAIL', this)">Failed (${failed})</button>
      <button class="filter-btn" onclick="setFilter('SKIPPED', this)">Skipped (${skipped})</button>
    </div>

    <div class="table-wrap">
      <div class="table-inner">
        <table id="testsTable">
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Test Case</th>
              <th>Module</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Error Details</th>
            </tr>
          </thead>
          <tbody>
            ${generateTestRows()}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══ SECTION 6: QUALITY GATES ═══ -->
    <div class="section-header">
      <span class="section-num">06</span>
      <h2>Quality Gates</h2>
      <div class="section-line"></div>
    </div>

    <div class="gates-grid">
      ${generateQualityGates()}
    </div>

    <!-- ═══ SECTION 7: CI/CD INFORMATION ═══ -->
    <div class="section-header">
      <span class="section-num">07</span>
      <h2>CI/CD Information</h2>
      <div class="section-line"></div>
    </div>

    <div class="info-card">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Repository</span>
          <span class="info-val"><a href="https://github.com/Hevanth-8705/Krishna-website" target="_blank">Hevanth-8705/Krishna-website</a></span>
        </div>
        <div class="info-item">
          <span class="info-label">Branch</span>
          <span class="info-val"><code>${esc(branch)}</code></span>
        </div>
        <div class="info-item">
          <span class="info-label">Commit SHA</span>
          <span class="info-val"><code>${esc(commitSha)}</code></span>
        </div>
        <div class="info-item">
          <span class="info-label">Workflow</span>
          <span class="info-val">${esc(workflowName)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Run ID</span>
          <span class="info-val">${esc(runId)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Execution Date</span>
          <span class="info-val">${esc(generatedAt)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Node.js Version</span>
          <span class="info-val">${esc(meta.nodeVersion || process.version)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Operating System</span>
          <span class="info-val">${esc(meta.environment || process.platform)}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Test Framework</span>
          <span class="info-val">Krishna QA Validation Suite</span>
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 8: FAILURE DIAGNOSTICS ═══ -->
    <div class="section-header">
      <span class="section-num">08</span>
      <h2>Failure Diagnostics</h2>
      <div class="section-line"></div>
    </div>

    ${generateFailureDiagnostics()}

    <!-- ═══ SECTION 9: ARTIFACT INFORMATION ═══ -->
    <div class="section-header">
      <span class="section-num">09</span>
      <h2>Artifact Information</h2>
      <div class="section-line"></div>
    </div>

    <div class="artifact-card">
      <div class="artifact-item">
        <div class="artifact-icon" style="background:var(--accent-blue-bg); color:var(--accent-blue)">📄</div>
        <div>
          <div class="artifact-name">HTML Test Report Dashboard</div>
          <div class="artifact-desc">Interactive QA dashboard with search, filters, and visualizations</div>
        </div>
      </div>
      <div class="artifact-item">
        <div class="artifact-icon" style="background:rgba(139,92,246,0.12); color:var(--accent-purple)">📋</div>
        <div>
          <div class="artifact-name">Raw Test Results (JSON)</div>
          <div class="artifact-desc">Machine-readable test-results.json with full test metadata</div>
        </div>
      </div>
      <div class="artifact-item">
        <div class="artifact-icon" style="background:var(--accent-pass-bg); color:var(--accent-pass)">📸</div>
        <div>
          <div class="artifact-name">Screenshots & E2E Traces</div>
          <div class="artifact-desc">Available when E2E browser tests capture visual artifacts</div>
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 10: FINAL VERDICT ═══ -->
    <div class="section-header">
      <span class="section-num">10</span>
      <h2>Final Verdict</h2>
      <div class="section-line"></div>
    </div>

    <div class="verdict-banner">
      <div class="verdict-text">${isPipelinePassing ? '✓ ALL REQUIRED TESTS PASSED' : '✕ TEST PIPELINE FAILED'}</div>
      <div class="verdict-detail">${passed}/${total} tests passed — ${passRate}% pass rate — ${durationFormatted} total execution time</div>
    </div>

    <!-- ═══ FOOTER ═══ -->
    <footer class="dashboard-footer">
      <p>Krishna Website — Automated Test & Quality Dashboard &bull; ${new Date().getFullYear()}</p>
      <p>Generated from actual test execution results &bull; <a href="https://github.com/Hevanth-8705/Krishna-website" target="_blank">View Repository</a></p>
    </footer>

  </div>

  <script>
    /* ── Filter & Search ────────────────────────────────────────────── */
    let activeFilter = 'ALL';

    function setFilter(status, btn) {
      activeFilter = status;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterTable();
    }

    function filterTable() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const rows = document.querySelectorAll('#testsTable tbody tr');

      rows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        const rowSearch = row.getAttribute('data-search');
        const matchesStatus = (activeFilter === 'ALL' || rowStatus === activeFilter);
        const matchesQuery = !query || rowSearch.includes(query);
        row.style.display = (matchesStatus && matchesQuery) ? '' : 'none';
      });
    }

    /* ── Intersection Observer for Animations ───────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.stat-card, .suite-card, .gate-card').forEach(el => {
        observer.observe(el);
      });
    });
  </script>
</body>
</html>`;

// ── Write Output ────────────────────────────────────────────────────────
fs.writeFileSync(OUTPUT_FILE_1, htmlContent, 'utf8');
fs.writeFileSync(OUTPUT_FILE_2, htmlContent, 'utf8');

console.log('[QA] Professional HTML QA Dashboard generated successfully:');
console.log(`  -> ${path.resolve(OUTPUT_FILE_1)}`);
console.log(`  -> ${path.resolve(OUTPUT_FILE_2)}`);
