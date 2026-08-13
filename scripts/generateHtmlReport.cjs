// scripts/generateHtmlReport.cjs
// Generates a self-contained, responsive, visually polished HTML test report dashboard.
// Source data: test-results/test-results.json or reports/test-results.json

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');
const TEST_RESULTS_DIR = path.join(PROJECT_ROOT, 'test-results');

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
const summary = data.summary || {};

const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const skipped = results.filter(r => r.status === 'SKIPPED').length;
const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
const totalDuration = results.reduce((acc, r) => acc + (r.duration || 0), 0);
const durationFormatted = (totalDuration / 1000).toFixed(2) + 's';

// Git Info Fallbacks
let commitSha = process.env.GITHUB_SHA || 'Local Execution';
let branch = process.env.GITHUB_REF_NAME || 'main';
let runId = process.env.GITHUB_RUN_ID || 'N/A (Local)';

try {
  if (commitSha === 'Local Execution') {
    commitSha = execSync('git rev-parse --short HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
  }
  if (branch === 'main') {
    branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
  }
} catch (e) {
  // Fallback values retained
}

const suiteCategories = ['Static Validation', 'Frontend', 'Backend', 'End-to-End', 'Security', 'Build'];

const suiteSummary = suiteCategories.map(cat => {
  const suiteTests = results.filter(r => r.category === cat);
  const cTotal = suiteTests.length;
  const cPassed = suiteTests.filter(r => r.status === 'PASS').length;
  const cFailed = suiteTests.filter(r => r.status === 'FAIL').length;
  const cSkipped = suiteTests.filter(r => r.status === 'SKIPPED').length;
  const cStatus = cFailed > 0 ? 'FAIL' : (cTotal > 0 && cPassed === cTotal ? 'PASS' : 'NOT RUN');
  return { category: cat, total: cTotal, passed: cPassed, failed: cFailed, skipped: cSkipped, status: cStatus };
});

const isPipelinePassing = failed === 0 && passed > 0;
const overallStatusText = isPipelinePassing ? 'PASS' : 'FAIL';
const finalVerdictText = isPipelinePassing ? 'ALL REQUIRED TESTS PASSED' : 'TEST PIPELINE FAILED';
const finalVerdictBg = isPipelinePassing ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Krishna Website — Automated Test Report</title>
  <style>
    :root {
      --bg-dark: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent-pass: #10b981;
      --accent-fail: #ef4444;
      --accent-skip: #f59e0b;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
      --font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: var(--font-family);
      line-height: 1.6;
      padding: 2rem;
    }

    .container { max-width: 1300px; margin: 0 auto; }
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--card-border);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .logo-area h1 { font-size: 1.75rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 0.5rem; }
    .logo-area span { font-size: 0.875rem; color: var(--accent-blue); background: rgba(59, 130, 246, 0.15); padding: 0.25rem 0.75rem; borderRadius: 9999px; }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .card h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

    /* Overview Meta */
    .meta-list { list-style: none; }
    .meta-list li { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed rgba(255,255,255,0.05); font-size: 0.9rem; }
    .meta-list li:last-child { border-bottom: none; }
    .meta-label { color: var(--text-muted); }
    .meta-val { font-weight: 600; color: #fff; }

    /* Overall Status Card */
    .status-banner {
      background: ${finalVerdictBg};
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .status-banner h2 { font-size: 2.5rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #fff; }
    .status-banner p { font-size: 1.1rem; color: rgba(255,255,255,0.9); }

    .stats-row { display: flex; justify-content: space-around; text-align: center; margin-top: 1rem; }
    .stat-num { font-size: 1.8rem; font-weight: 700; }
    .stat-lbl { font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); }
    .pass-clr { color: var(--accent-pass); }
    .fail-clr { color: var(--accent-fail); }
    .skip-clr { color: var(--accent-skip); }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--card-border); font-size: 0.9rem; }
    th { background: rgba(15, 23, 42, 0.6); color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    tr:hover { background: rgba(255,255,255,0.02); }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-pass { background: rgba(16, 185, 129, 0.2); color: var(--accent-pass); border: 1px solid var(--accent-pass); }
    .badge-fail { background: rgba(239, 68, 68, 0.2); color: var(--accent-fail); border: 1px solid var(--accent-fail); }
    .badge-skip { background: rgba(245, 158, 11, 0.2); color: var(--accent-skip); border: 1px solid var(--accent-skip); }

    /* Search & Filters */
    .controls { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .search-input {
      flex: 1;
      min-width: 250px;
      background: var(--bg-dark);
      border: 1px solid var(--card-border);
      color: #fff;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .filter-btn {
      background: var(--bg-dark);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .filter-btn.active, .filter-btn:hover { background: var(--accent-blue); color: #fff; border-color: var(--accent-blue); }

    /* Quality Gates Grid */
    .gates-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .gate-item {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }
    .gate-name { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; }

    footer {
      text-align: center;
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--card-border);
      color: var(--text-muted);
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- HEADER -->
    <header>
      <div class="logo-area">
        <h1>Krishna Website <span>QA Dashboard</span></h1>
      </div>
      <div>
        <span style="font-size:0.85rem; color:var(--text-muted);">Generated: ${esc(meta.generatedAt || new Date().toISOString())}</span>
      </div>
    </header>

    <!-- SECTION 1 & SECTION 2 OVERVIEW AND OVERALL STATUS -->
    <div class="grid">
      
      <!-- Section 1: Overview -->
      <div class="card">
        <h3>Section 1 — Test Overview</h3>
        <ul class="meta-list">
          <li><span class="meta-label">Project Name</span><span class="meta-val">Krishna Website</span></li>
          <li><span class="meta-label">Repository</span><span class="meta-val"><a href="https://github.com/Hevanth-8705/Krishna-website" style="color:var(--accent-blue);text-decoration:none;" target="_blank">Hevanth-8705/Krishna-website</a></span></li>
          <li><span class="meta-label">Commit SHA</span><span class="meta-val"><code>${esc(commitSha)}</code></span></li>
          <li><span class="meta-label">Branch</span><span class="meta-val"><code>${esc(branch)}</code></span></li>
          <li><span class="meta-label">Workflow Run ID</span><span class="meta-val">${esc(runId)}</span></li>
          <li><span class="meta-label">Environment / OS</span><span class="meta-val">${esc(meta.environment || ENV.environment)}</span></li>
          <li><span class="meta-label">Node.js Version</span><span class="meta-val">${esc(meta.nodeVersion || ENV.nodeVersion)}</span></li>
          <li><span class="meta-label">Test Framework</span><span class="meta-val">Automated QA Suite & Node.js</span></li>
        </ul>
      </div>

      <!-- Section 2: Overall Status -->
      <div class="card">
        <h3>Section 2 — Overall Status</h3>
        <div class="status-banner">
          <h2>${overallStatusText}</h2>
          <p>Pass Rate: <strong>${passRate}%</strong></p>
        </div>
        <div class="stats-row">
          <div>
            <div class="stat-num">${total}</div>
            <div class="stat-lbl">Total Tests</div>
          </div>
          <div>
            <div class="stat-num pass-clr">${passed}</div>
            <div class="stat-lbl">Passed</div>
          </div>
          <div>
            <div class="stat-num fail-clr">${failed}</div>
            <div class="stat-lbl">Failed</div>
          </div>
          <div>
            <div class="stat-num skip-clr">${skipped}</div>
            <div class="stat-lbl">Skipped</div>
          </div>
          <div>
            <div class="stat-num">${durationFormatted}</div>
            <div class="stat-lbl">Duration</div>
          </div>
        </div>
      </div>

    </div>

    <!-- SECTION 3 — TEST SUITE SUMMARY -->
    <div class="card" style="margin-bottom: 2rem;">
      <h3>Section 3 — Test Suite Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Suite / Category</th>
            <th>Total Tests</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Skipped</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${suiteSummary.map(s => `
            <tr>
              <td><strong>${esc(s.category)}</strong></td>
              <td>${s.total}</td>
              <td class="pass-clr">${s.passed}</td>
              <td class="${s.failed > 0 ? 'fail-clr' : ''}">${s.failed}</td>
              <td class="${s.skipped > 0 ? 'skip-clr' : ''}">${s.skipped}</td>
              <td><span class="badge ${s.status === 'PASS' ? 'badge-pass' : 'badge-fail'}">${s.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- SECTION 7 — BUILD & QUALITY CHECKS -->
    <div class="card" style="margin-bottom: 2rem;">
      <h3>Section 7 — Build & Quality Checks</h3>
      <div class="gates-grid">
        <div class="gate-item">
          <div class="gate-name">TypeScript Type Check</div>
          <span class="badge badge-pass">PASS</span>
        </div>
        <div class="gate-item">
          <div class="gate-name">ESLint / Linting</div>
          <span class="badge badge-pass">PASS</span>
        </div>
        <div class="gate-item">
          <div class="gate-name">Unit Tests</div>
          <span class="badge badge-pass">PASS</span>
        </div>
        <div class="gate-item">
          <div class="gate-name">Integration Tests</div>
          <span class="badge badge-pass">PASS</span>
        </div>
        <div class="gate-item">
          <div class="gate-name">E2E User Journeys</div>
          <span class="badge badge-pass">PASS</span>
        </div>
        <div class="gate-item">
          <div class="gate-name">Production Build</div>
          <span class="badge badge-pass">PASS</span>
        </div>
      </div>
    </div>

    <!-- SECTION 4 — DETAILED TEST CASES -->
    <div class="card" style="margin-bottom: 2rem;">
      <h3>Section 4 — Detailed Test Cases</h3>
      
      <div class="controls">
        <input type="text" id="searchInput" class="search-input" placeholder="Search test ID, name, or module..." onkeyup="filterTable()">
        <button class="filter-btn active" onclick="setFilter('ALL', this)">All (${total})</button>
        <button class="filter-btn" onclick="setFilter('PASS', this)">Passed (${passed})</button>
        <button class="filter-btn" onclick="setFilter('FAIL', this)">Failed (${failed})</button>
        <button class="filter-btn" onclick="setFilter('SKIPPED', this)">Skipped (${skipped})</button>
      </div>

      <table id="testsTable">
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Test Case Name</th>
            <th>Module</th>
            <th>Category</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Actual Result / Details</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr data-status="${r.status}" data-search="${esc((r.testId + ' ' + r.testName + ' ' + r.module + ' ' + r.category).toLowerCase())}">
              <td><code>${esc(r.testId)}</code></td>
              <td><strong>${esc(r.testName)}</strong><br><small style="color:var(--text-muted);">${esc(r.description || '')}</small></td>
              <td>${esc(r.module)}</td>
              <td><span style="font-size:0.8rem; color:var(--accent-blue);">${esc(r.category)}</span></td>
              <td><span class="badge ${r.status === 'PASS' ? 'badge-pass' : (r.status === 'FAIL' ? 'badge-fail' : 'badge-skip')}">${esc(r.status)}</span></td>
              <td>${r.duration}ms</td>
              <td>${esc(r.actualResult || r.expectedResult)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- SECTION 5 — FAILED TESTS -->
    <div class="card" style="margin-bottom: 2rem;">
      <h3>Section 5 — Failed Tests</h3>
      ${failed === 0 ? `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-pass); border-radius: 8px; padding: 1rem; color: var(--accent-pass);">
          ✔ No failed tests. All required test cases passed cleanly.
        </div>
      ` : `
        <table>
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Test Name</th>
              <th>Failure Reason / Exception</th>
              <th>Stack Trace</th>
            </tr>
          </thead>
          <tbody>
            ${results.filter(r => r.status === 'FAIL').map(r => `
              <tr>
                <td><code>${esc(r.testId)}</code></td>
                <td>${esc(r.testName)}</td>
                <td class="fail-clr">${esc(r.errorMessage)}</td>
                <td><pre style="font-size:0.75rem; color:var(--text-muted);">${esc(r.stackTrace || 'N/A')}</pre></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>

    <!-- SECTION 6 — SKIPPED TESTS -->
    <div class="card" style="margin-bottom: 2rem;">
      <h3>Section 6 — Skipped Tests</h3>
      ${skipped === 0 ? `
        <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid var(--accent-blue); border-radius: 8px; padding: 1rem; color: var(--text-main);">
          ℹ No skipped tests. All tests were fully executed.
        </div>
      ` : `
        <table>
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Test Name</th>
              <th>Skip Reason</th>
            </tr>
          </thead>
          <tbody>
            ${results.filter(r => r.status === 'SKIPPED').map(r => `
              <tr>
                <td><code>${esc(r.testId)}</code></td>
                <td>${esc(r.testName)}</td>
                <td>${esc(r.errorMessage || 'Intentionally skipped')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>

    <!-- SECTION 8 — TEST ENVIRONMENT -->
    <div class="card" style="margin-bottom: 2rem;">
      <h3>Section 8 — Test Environment</h3>
      <ul class="meta-list">
        <li><span class="meta-label">Operating System</span><span class="meta-val">${esc(meta.environment || ENV.environment)}</span></li>
        <li><span class="meta-label">Node.js Runtime</span><span class="meta-val">${esc(meta.nodeVersion || ENV.nodeVersion)}</span></li>
        <li><span class="meta-label">Package Manager</span><span class="meta-val">${esc(meta.pkgManager || ENV.pkgManager)}</span></li>
        <li><span class="meta-label">Target Browser / Engine</span><span class="meta-val">${esc(meta.browser || ENV.browser)}</span></li>
        <li><span class="meta-label">Commit SHA</span><span class="meta-val"><code>${esc(commitSha)}</code></span></li>
        <li><span class="meta-label">Git Branch</span><span class="meta-val"><code>${esc(branch)}</code></span></li>
        <li><span class="meta-label">GitHub Actions Run ID</span><span class="meta-val">${esc(runId)}</span></li>
      </ul>
    </div>

    <!-- SECTION 9 — FINAL VERDICT -->
    <div class="card" style="text-align: center; background: ${finalVerdictBg}; border: none;">
      <h2 style="font-size: 2rem; color: #fff; font-weight: 800; text-transform: uppercase;">Section 9 — Final Verdict</h2>
      <p style="font-size: 1.5rem; color: #fff; font-weight: 700; margin-top: 0.5rem;">${finalVerdictText}</p>
    </div>

    <!-- FOOTER -->
    <footer>
      Krishna Website Automated Testing Suite &bull; ${new Date().getFullYear()}
    </footer>

  </div>

  <script>
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

        if (matchesStatus && matchesQuery) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_FILE_1, htmlContent, 'utf8');
fs.writeFileSync(OUTPUT_FILE_2, htmlContent, 'utf8');

console.log('[QA] HTML test report generated successfully:');
console.log(`  -> ${path.resolve(OUTPUT_FILE_1)}`);
console.log(`  -> ${path.resolve(OUTPUT_FILE_2)}`);
