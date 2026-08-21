// scripts/generateMasterExcel.cjs
// ============================================================================
// KRISHNA AI / KRISHNA OS — MASTER EXCEL QA REPORT GENERATOR
// ============================================================================
// Reads reports/complete-qa-results.json and produces a professional,
// multi-sheet Excel workbook with styling, conditional formatting, charts, 
// auto-filters, and deployment readiness assessment.
// ============================================================================

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');
const JSON_INPUT = path.join(REPORTS_DIR, 'complete-qa-results.json');
const EXCEL_OUTPUT_PRIMARY = path.join(PROJECT_ROOT, 'KRISHNA_AI_COMPLETE_QA_REPORT.xlsx');
const EXCEL_OUTPUT_REPORTS = path.join(REPORTS_DIR, 'KRISHNA_AI_COMPLETE_QA_REPORT.xlsx');

// ============================================================================
// 1. VALIDATE INPUT
// ============================================================================
if (!fs.existsSync(JSON_INPUT)) {
  console.error('[EXCEL] FATAL: reports/complete-qa-results.json not found.');
  console.error('[EXCEL] Run "npm run qa:suite" first to execute the QA suite.');
  process.exit(1);
}

let rawData;
try {
  rawData = JSON.parse(fs.readFileSync(JSON_INPUT, 'utf8'));
} catch (err) {
  console.error('[EXCEL] FATAL: complete-qa-results.json is invalid JSON:', err.message);
  process.exit(1);
}

const meta = rawData.meta || {};
const summary = rawData.summary || {};
const results = rawData.results || [];
const loadTestMetrics = rawData.loadTestMetrics || [];
const vulnerabilityFindings = rawData.vulnerabilityFindings || [];
const performanceMetrics = rawData.performanceMetrics || [];

if (results.length === 0) {
  console.error('[EXCEL] FATAL: No test results found in complete-qa-results.json.');
  process.exit(1);
}

console.log(`[EXCEL] Loaded ${results.length} test results, ${loadTestMetrics.length} load metrics, ${vulnerabilityFindings.length} vulnerability findings.`);

// ============================================================================
// 2. STYLE DEFINITIONS
// ============================================================================
const COLORS = {
  navy:       'FF0D1B2A',
  darkBlue:   'FF1B2838',
  blue:       'FF0D47A1',
  lightBlue:  'FFE3F2FD',
  white:      'FFFFFFFF',
  black:      'FF000000',
  green:      'FF00C853',
  lightGreen: 'FFE8F5E9',
  red:        'FFD50000',
  lightRed:   'FFFFEBEE',
  amber:      'FFFFAB00',
  lightAmber: 'FFFFF8E1',
  orange:     'FFFF6D00',
  grey:       'FF9E9E9E',
  lightGrey:  'FFF5F5F5',
  borderLight:'FFE0E0E0',
  borderMed:  'FFBDBDBD',
  critical:   'FFB71C1C',
  high:       'FFE65100',
  moderate:   'FFF57F17',
  low:        'FF1B5E20',
  info:       'FF0D47A1',
};

function headerFill(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: argb || COLORS.navy } };
}

function solidFill(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

const FONT = {
  headerWhite: { bold: true, size: 11, color: { argb: COLORS.white }, name: 'Segoe UI' },
  headerWhiteLg: { bold: true, size: 14, color: { argb: COLORS.white }, name: 'Segoe UI' },
  titleWhite: { bold: true, size: 18, color: { argb: COLORS.white }, name: 'Segoe UI' },
  subtitleGrey: { italic: true, size: 10, color: { argb: COLORS.grey }, name: 'Segoe UI' },
  body: { size: 10, name: 'Segoe UI' },
  bodyBold: { bold: true, size: 10, name: 'Segoe UI' },
  label: { bold: true, size: 12, name: 'Segoe UI' },
  value: { size: 12, name: 'Segoe UI' },
  statusWhite: { bold: true, size: 10, color: { argb: COLORS.white }, name: 'Segoe UI' },
  verdict: { bold: true, size: 16, color: { argb: COLORS.white }, name: 'Segoe UI' },
  note: { italic: true, size: 9, color: { argb: COLORS.grey }, name: 'Segoe UI' },
  sectionTitle: { bold: true, size: 14, name: 'Segoe UI', underline: true },
};

const BORDER_THIN = {
  top: { style: 'thin', color: { argb: COLORS.borderLight } },
  bottom: { style: 'thin', color: { argb: COLORS.borderLight } },
  left: { style: 'thin', color: { argb: COLORS.borderLight } },
  right: { style: 'thin', color: { argb: COLORS.borderLight } },
};

const ALIGN_CENTER = { horizontal: 'center', vertical: 'middle', wrapText: true };
const ALIGN_LEFT = { vertical: 'middle', wrapText: true };

function styleHeaderRow(row, fillColor) {
  row.eachCell((cell) => {
    cell.fill = headerFill(fillColor);
    cell.font = FONT.headerWhite;
    cell.alignment = ALIGN_CENTER;
    cell.border = BORDER_THIN;
  });
  row.height = 32;
}

function styleDataRow(row, idx) {
  row.eachCell((cell) => {
    cell.font = FONT.body;
    cell.alignment = ALIGN_LEFT;
    cell.border = BORDER_THIN;
    if (idx % 2 === 0) {
      cell.fill = solidFill(COLORS.lightGrey);
    }
  });
}

function colorStatusCell(cell, status) {
  const s = (status || '').toUpperCase();
  const map = {
    'PASS': COLORS.green,
    'FAIL': COLORS.red,
    'SKIPPED': COLORS.amber,
    'BLOCKED': COLORS.orange,
    'NOT_APPLICABLE': COLORS.grey,
    'NOT APPLICABLE': COLORS.grey,
    'N/A': COLORS.grey,
    'IDENTIFIED': COLORS.amber,
  };
  const bg = map[s];
  if (bg) {
    cell.fill = solidFill(bg);
    cell.font = FONT.statusWhite;
    cell.alignment = ALIGN_CENTER;
  }
}

function colorSeverityCell(cell, severity) {
  const s = (severity || '').toLowerCase();
  const map = {
    'critical': COLORS.critical,
    'high': COLORS.high,
    'moderate': COLORS.moderate,
    'medium': COLORS.moderate,
    'low': COLORS.low,
    'info': COLORS.info,
  };
  const bg = map[s];
  if (bg) {
    cell.fill = solidFill(bg);
    cell.font = FONT.statusWhite;
    cell.alignment = ALIGN_CENTER;
  }
}

function colorPriorityCell(cell, priority) {
  const s = (priority || '').toLowerCase();
  const map = {
    'critical': COLORS.critical,
    'high': COLORS.red,
    'medium': COLORS.amber,
    'low': COLORS.green,
  };
  const bg = map[s];
  if (bg) {
    cell.fill = solidFill(bg);
    cell.font = FONT.statusWhite;
    cell.alignment = ALIGN_CENTER;
  }
}

// ============================================================================
// 3. COMPUTED METRICS
// ============================================================================
const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const naCount = results.filter(r => r.status === 'NOT_APPLICABLE' || r.status === 'N/A').length;
const skipped = results.filter(r => r.status === 'SKIPPED').length;
const blocked = results.filter(r => r.status === 'BLOCKED').length;
const passRate = total > 0 ? ((passed / (total - naCount)) * 100).toFixed(1) : '0.0';
const failRate = total > 0 ? ((failed / (total - naCount)) * 100).toFixed(1) : '0.0';
const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

// Categorize
const testTypes = [...new Set(results.map(r => r.testType))].filter(Boolean);
const modules = [...new Set(results.map(r => r.module))].filter(Boolean);

console.log(`[EXCEL] Total: ${total} | Pass: ${passed} | Fail: ${failed} | N/A: ${naCount} | Rate: ${passRate}%`);

// ============================================================================
// 4. BUILD THE WORKBOOK
// ============================================================================
async function generateExcelReport() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Krishna AI / Krishna OS QA Automation';
  wb.created = new Date();
  wb.modified = new Date();
  wb.lastPrinted = new Date();

  // ========================================================================
  // SHEET 1: EXECUTIVE SUMMARY
  // ========================================================================
  console.log('[EXCEL] Building Sheet 1: Executive Summary...');
  const ws1 = wb.addWorksheet('Executive Summary', {
    properties: { tabColor: { argb: COLORS.blue } },
  });

  ws1.columns = [
    { width: 5 },   // A spacer
    { width: 35 },  // B label
    { width: 30 },  // C value
    { width: 20 },  // D extra
    { width: 20 },  // E extra
    { width: 5 },   // F spacer
  ];

  // Title row
  ws1.mergeCells('A1:F1');
  const t1 = ws1.getCell('A1');
  t1.value = '🏗️  KRISHNA AI / KRISHNA OS — COMPLETE QA REPORT';
  t1.fill = headerFill(COLORS.navy);
  t1.font = FONT.titleWhite;
  t1.alignment = ALIGN_CENTER;
  ws1.getRow(1).height = 50;

  // Subtitle
  ws1.mergeCells('A2:F2');
  const sub = ws1.getCell('A2');
  sub.value = `Real-Time QA Execution Report — Generated: ${new Date().toISOString()}`;
  sub.fill = solidFill(COLORS.darkBlue);
  sub.font = FONT.subtitleGrey;
  sub.alignment = ALIGN_CENTER;
  ws1.getRow(2).height = 25;

  // Summary metrics
  const summaryData = [
    ['📊  Test Execution Summary', '', '', ''],
    ['Total Test Cases Executed', total, '', ''],
    ['✅ Passed', passed, 'Pass Rate', `${passRate}%`],
    ['❌ Failed', failed, 'Fail Rate', `${failRate}%`],
    ['⏭️ Skipped', skipped, '', ''],
    ['🚫 Blocked', blocked, '', ''],
    ['⬜ Not Applicable', naCount, '', ''],
    ['', '', '', ''],
    ['⏱️  Execution Metrics', '', '', ''],
    ['Total Duration', `${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`, '', ''],
    ['Execution Date', meta.generatedAt || new Date().toISOString(), '', ''],
    ['Node Version', meta.nodeVersion || process.version, '', ''],
    ['Operating System', meta.os || process.platform, '', ''],
    ['Host Machine', meta.host || require('os').hostname(), '', ''],
    ['', '', '', ''],
    ['🔧  Environment', '', '', ''],
    ['Base URL', meta.baseUrl || 'http://127.0.0.1:3000', '', ''],
    ['Tester', 'Krishna OS Principal QA Lead & SDET Architect', '', ''],
    ['Build Version', '1.0.0', '', ''],
  ];

  let row = 4;
  summaryData.forEach(([label, value, label2, value2]) => {
    const bCell = ws1.getCell(`B${row}`);
    const cCell = ws1.getCell(`C${row}`);
    const dCell = ws1.getCell(`D${row}`);
    const eCell = ws1.getCell(`E${row}`);

    bCell.value = label;
    cCell.value = value;
    dCell.value = label2;
    eCell.value = value2;

    if (label && (label.startsWith('📊') || label.startsWith('⏱️') || label.startsWith('🔧'))) {
      bCell.font = FONT.sectionTitle;
      ws1.mergeCells(`B${row}:E${row}`);
    } else if (label) {
      bCell.font = FONT.label;
      cCell.font = FONT.value;
      cCell.alignment = ALIGN_CENTER;
      cCell.border = BORDER_THIN;
      cCell.fill = solidFill(COLORS.lightBlue);

      if (dCell.value) {
        dCell.font = FONT.label;
        eCell.font = FONT.value;
        eCell.alignment = ALIGN_CENTER;
        eCell.border = BORDER_THIN;
        eCell.fill = solidFill(COLORS.lightBlue);
      }

      // Color pass/fail values
      if (label.includes('Passed')) {
        cCell.fill = solidFill(COLORS.green);
        cCell.font = FONT.statusWhite;
      } else if (label.includes('Failed') && failed > 0) {
        cCell.fill = solidFill(COLORS.red);
        cCell.font = FONT.statusWhite;
      }
    }
    row++;
  });

  // Category breakdown
  row += 2;
  ws1.getCell(`B${row}`).value = '📋  Category Breakdown';
  ws1.getCell(`B${row}`).font = FONT.sectionTitle;
  ws1.mergeCells(`B${row}:E${row}`);
  row++;

  const catHeaderRow = ws1.getRow(row);
  ['', 'Category', 'Total', 'Passed', 'Failed', 'Pass Rate'].forEach((h, i) => {
    catHeaderRow.getCell(i + 1).value = h;
  });
  styleHeaderRow(catHeaderRow, COLORS.darkBlue);
  row++;

  testTypes.forEach((type) => {
    const catTests = results.filter(r => r.testType === type);
    const catPass = catTests.filter(r => r.status === 'PASS').length;
    const catFail = catTests.filter(r => r.status === 'FAIL').length;
    const catNA = catTests.filter(r => r.status === 'NOT_APPLICABLE' || r.status === 'N/A').length;
    const catExec = catTests.length - catNA;
    const catRate = catExec > 0 ? ((catPass / catExec) * 100).toFixed(1) : 'N/A';

    const r = ws1.getRow(row);
    r.getCell(2).value = type;
    r.getCell(3).value = catTests.length;
    r.getCell(4).value = catPass;
    r.getCell(5).value = catFail;
    r.getCell(6).value = catRate !== 'N/A' ? `${catRate}%` : 'N/A';

    [2, 3, 4, 5, 6].forEach(col => {
      r.getCell(col).font = FONT.body;
      r.getCell(col).alignment = ALIGN_CENTER;
      r.getCell(col).border = BORDER_THIN;
    });

    if (catFail > 0) {
      r.getCell(5).fill = solidFill(COLORS.lightRed);
      r.getCell(5).font = { ...FONT.bodyBold, color: { argb: COLORS.red } };
    }
    row++;
  });

  // Release status
  row += 2;
  ws1.mergeCells(`B${row}:E${row}`);
  const releaseCell = ws1.getCell(`B${row}`);
  const isReleaseReady = failed === 0;
  releaseCell.value = isReleaseReady ? '✅  RELEASE READY' : '❌  RELEASE BLOCKED — Critical Defects Found';
  releaseCell.fill = solidFill(isReleaseReady ? COLORS.green : COLORS.red);
  releaseCell.font = FONT.verdict;
  releaseCell.alignment = ALIGN_CENTER;
  ws1.getRow(row).height = 45;

  ws1.views = [{ state: 'frozen', ySplit: 2 }];

  // ========================================================================
  // SHEET 2: ALL TEST CASES
  // ========================================================================
  console.log('[EXCEL] Building Sheet 2: All Test Cases...');
  const allCols = [
    { header: 'Test ID', key: 'testId', width: 14 },
    { header: 'Module', key: 'module', width: 18 },
    { header: 'Test Type', key: 'testType', width: 14 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Description', key: 'testDescription', width: 40 },
    { header: 'Preconditions', key: 'preconditions', width: 24 },
    { header: 'Test Steps', key: 'testSteps', width: 36 },
    { header: 'Expected Result', key: 'expectedResult', width: 30 },
    { header: 'Actual Result', key: 'actualResult', width: 30 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Execution Date', key: 'executionDate', width: 16 },
    { header: 'Time', key: 'executionTime', width: 14 },
    { header: 'Duration (ms)', key: 'duration', width: 14 },
    { header: 'Environment', key: 'environment', width: 20 },
    { header: 'Browser', key: 'browser', width: 18 },
    { header: 'Device', key: 'device', width: 18 },
    { header: 'OS', key: 'os', width: 18 },
    { header: 'API Endpoint', key: 'apiEndpoint', width: 28 },
    { header: 'HTTP Status', key: 'httpStatus', width: 12 },
    { header: 'Error', key: 'error', width: 30 },
    { header: 'Evidence', key: 'evidence', width: 36 },
    { header: 'Tester', key: 'tester', width: 30 },
    { header: 'Build', key: 'buildVersion', width: 10 },
  ];

  function addFullTestSheet(sheetName, data, tabColor) {
    const ws = wb.addWorksheet(sheetName, {
      properties: { tabColor: { argb: tabColor || COLORS.blue } },
    });
    ws.columns = allCols;

    // Header
    const hRow = ws.getRow(1);
    allCols.forEach((col, i) => { hRow.getCell(i + 1).value = col.header; });
    styleHeaderRow(hRow, COLORS.navy);

    if (data.length === 0) {
      const emptyRow = ws.addRow({ testId: `No ${sheetName.toLowerCase()} found` });
      ws.mergeCells(2, 1, 2, allCols.length);
      emptyRow.getCell(1).alignment = ALIGN_CENTER;
      emptyRow.getCell(1).font = { ...FONT.body, italic: true, color: { argb: COLORS.grey } };
      return ws;
    }

    data.forEach((t, idx) => {
      const r = ws.addRow({
        testId: t.testId,
        module: t.module,
        testType: t.testType,
        priority: t.priority,
        testDescription: t.testDescription,
        preconditions: t.preconditions,
        testSteps: t.testSteps,
        expectedResult: t.expectedResult,
        actualResult: t.actualResult,
        status: t.status,
        executionDate: t.executionDate,
        executionTime: t.executionTime,
        duration: t.duration,
        environment: t.environment,
        browser: t.browser,
        device: t.device,
        os: t.os,
        apiEndpoint: t.apiEndpoint,
        httpStatus: t.httpStatus,
        error: t.error,
        evidence: typeof t.evidence === 'object' ? JSON.stringify(t.evidence) : String(t.evidence || ''),
        tester: t.tester,
        buildVersion: t.buildVersion,
      });
      styleDataRow(r, idx);
      colorStatusCell(r.getCell(10), t.status);      // Status column
      colorPriorityCell(r.getCell(4), t.priority);   // Priority column
    });

    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: data.length + 1, column: allCols.length } };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    return ws;
  }

  addFullTestSheet('All Test Cases', results, COLORS.blue);

  // ========================================================================
  // SHEETS 3-12: CATEGORY SHEETS
  // ========================================================================
  const categorySheets = [
    { name: 'Unit Tests', prefix: 'UNIT', type: 'Unit', color: COLORS.green },
    { name: 'API Tests', prefix: 'API', type: 'API', color: COLORS.blue },
    { name: 'Security Tests', prefix: 'SEC', type: 'Security', color: COLORS.red },
    { name: 'Performance Tests', prefix: 'PERF', type: 'Performance', color: COLORS.amber },
    { name: 'UI-UX Tests', prefix: 'WEB', type: 'Web UI', color: COLORS.info },
    { name: 'Voice Tests', prefix: 'VOICE', type: 'Voice', color: COLORS.green },
    { name: 'AI Tests', prefix: 'AI', type: 'AI', color: COLORS.navy },
    { name: 'Database Tests', prefix: 'DB', type: 'Database', color: COLORS.darkBlue },
    { name: 'Integration Tests', prefix: 'INT', type: 'Integration', color: COLORS.moderate },
    { name: 'Regression Tests', prefix: 'REG', type: 'Regression', color: COLORS.orange },
  ];

  categorySheets.forEach(({ name, prefix, type, color }) => {
    const data = results.filter(r =>
      r.testId.startsWith(prefix + '-') ||
      r.testType === type ||
      (r.testType && r.testType.includes(type))
    );
    console.log(`[EXCEL] Building Sheet: ${name} (${data.length} tests)...`);
    addFullTestSheet(name, data, color);
  });

  // ========================================================================
  // SHEET 13: FAILED TESTS (DEFECT LOG)
  // ========================================================================
  console.log('[EXCEL] Building Sheet: Failed Tests (Defect Log)...');
  const failedTests = results.filter(r => r.status === 'FAIL');

  const wsFail = wb.addWorksheet('Failed Tests - Defect Log', {
    properties: { tabColor: { argb: COLORS.red } },
  });

  const failCols = [
    { header: 'Test ID', key: 'testId', width: 14 },
    { header: 'Module', key: 'module', width: 18 },
    { header: 'Test Type', key: 'testType', width: 14 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Description', key: 'testDescription', width: 40 },
    { header: 'Expected Result', key: 'expectedResult', width: 30 },
    { header: 'Actual Result', key: 'actualResult', width: 30 },
    { header: 'API Endpoint', key: 'apiEndpoint', width: 28 },
    { header: 'HTTP Status', key: 'httpStatus', width: 12 },
    { header: 'Error', key: 'error', width: 36 },
    { header: 'Evidence', key: 'evidence', width: 40 },
    { header: 'Duration (ms)', key: 'duration', width: 14 },
    { header: 'Root Cause', key: 'rootCause', width: 30 },
    { header: 'Fix Status', key: 'fixStatus', width: 14 },
  ];

  wsFail.columns = failCols;
  const failHRow = wsFail.getRow(1);
  failCols.forEach((c, i) => { failHRow.getCell(i + 1).value = c.header; });
  styleHeaderRow(failHRow, COLORS.red);

  if (failedTests.length === 0) {
    const noFail = wsFail.addRow({ testId: '✅ No failed tests — All tests passed!' });
    wsFail.mergeCells(2, 1, 2, failCols.length);
    noFail.getCell(1).alignment = ALIGN_CENTER;
    noFail.getCell(1).font = { ...FONT.value, italic: true, color: { argb: '004CAF50' } };
  } else {
    failedTests.forEach((t, idx) => {
      const r = wsFail.addRow({
        testId: t.testId,
        module: t.module,
        testType: t.testType,
        priority: t.priority,
        testDescription: t.testDescription,
        expectedResult: t.expectedResult,
        actualResult: t.actualResult,
        apiEndpoint: t.apiEndpoint,
        httpStatus: t.httpStatus,
        error: t.error,
        evidence: typeof t.evidence === 'object' ? JSON.stringify(t.evidence) : String(t.evidence || ''),
        duration: t.duration,
        rootCause: 'To be investigated',
        fixStatus: 'OPEN',
      });
      // Light red bg for entire row
      r.eachCell(cell => {
        cell.fill = solidFill(COLORS.lightRed);
        cell.font = FONT.body;
        cell.border = BORDER_THIN;
        cell.alignment = ALIGN_LEFT;
      });
      colorPriorityCell(r.getCell(4), t.priority);
    });
  }
  wsFail.autoFilter = { from: { row: 1, column: 1 }, to: { row: failedTests.length + 1, column: failCols.length } };
  wsFail.views = [{ state: 'frozen', ySplit: 1 }];

  // ========================================================================
  // SHEET 14: LOAD TEST METRICS
  // ========================================================================
  console.log('[EXCEL] Building Sheet: Load Test Metrics...');
  const wsLoad = wb.addWorksheet('Load Test Metrics', {
    properties: { tabColor: { argb: COLORS.amber } },
  });

  const loadCols = [
    { header: 'Test ID', key: 'testId', width: 14 },
    { header: 'Endpoint', key: 'endpoint', width: 30 },
    { header: 'Virtual Users', key: 'virtualUsers', width: 14 },
    { header: 'Duration', key: 'duration', width: 12 },
    { header: 'Total Requests', key: 'requests', width: 14 },
    { header: 'Successful', key: 'successfulRequests', width: 14 },
    { header: 'Failed', key: 'failedRequests', width: 12 },
    { header: 'RPS', key: 'rps', width: 12 },
    { header: 'Avg Response (ms)', key: 'averageResponse', width: 18 },
    { header: 'P50 (ms)', key: 'p50', width: 10 },
    { header: 'P95 (ms)', key: 'p95', width: 10 },
    { header: 'P99 (ms)', key: 'p99', width: 10 },
    { header: 'Max (ms)', key: 'maxResponse', width: 10 },
    { header: 'Error Rate', key: 'errorRate', width: 12 },
    { header: 'CPU', key: 'cpu', width: 12 },
    { header: 'Memory', key: 'memory', width: 12 },
  ];

  wsLoad.columns = loadCols;
  const loadHRow = wsLoad.getRow(1);
  loadCols.forEach((c, i) => { loadHRow.getCell(i + 1).value = c.header; });
  styleHeaderRow(loadHRow, COLORS.darkBlue);

  loadTestMetrics.forEach((m, idx) => {
    const r = wsLoad.addRow(m);
    styleDataRow(r, idx);
    // Highlight failed requests > 0
    if (m.failedRequests > 0) {
      r.getCell(7).fill = solidFill(COLORS.lightRed);
      r.getCell(7).font = { ...FONT.bodyBold, color: { argb: COLORS.red } };
    }
  });

  wsLoad.autoFilter = { from: { row: 1, column: 1 }, to: { row: loadTestMetrics.length + 1, column: loadCols.length } };
  wsLoad.views = [{ state: 'frozen', ySplit: 1 }];

  // ========================================================================
  // SHEET 15: VULNERABILITY FINDINGS
  // ========================================================================
  console.log('[EXCEL] Building Sheet: Security Vulnerabilities...');
  const wsVuln = wb.addWorksheet('Security Vulnerabilities', {
    properties: { tabColor: { argb: COLORS.critical } },
  });

  const vulnCols = [
    { header: 'Finding ID', key: 'findingId', width: 14 },
    { header: 'Category', key: 'category', width: 30 },
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Affected Component', key: 'affectedComponent', width: 28 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Evidence', key: 'evidence', width: 30 },
    { header: 'Impact', key: 'impact', width: 36 },
    { header: 'Remediation', key: 'remediation', width: 30 },
    { header: 'Status', key: 'status', width: 14 },
  ];

  wsVuln.columns = vulnCols;
  const vulnHRow = wsVuln.getRow(1);
  vulnCols.forEach((c, i) => { vulnHRow.getCell(i + 1).value = c.header; });
  styleHeaderRow(vulnHRow, COLORS.critical);

  if (vulnerabilityFindings.length === 0) {
    const noVuln = wsVuln.addRow({ findingId: '✅ No vulnerabilities found' });
    wsVuln.mergeCells(2, 1, 2, vulnCols.length);
    noVuln.getCell(1).alignment = ALIGN_CENTER;
    noVuln.getCell(1).font = { ...FONT.value, italic: true, color: { argb: '004CAF50' } };
  } else {
    vulnerabilityFindings.forEach((v, idx) => {
      const r = wsVuln.addRow(v);
      styleDataRow(r, idx);
      colorSeverityCell(r.getCell(3), v.severity);
      colorStatusCell(r.getCell(9), v.status);
    });
  }

  wsVuln.autoFilter = { from: { row: 1, column: 1 }, to: { row: vulnerabilityFindings.length + 1, column: vulnCols.length } };
  wsVuln.views = [{ state: 'frozen', ySplit: 1 }];

  // ========================================================================
  // SHEET 16: DEPLOYMENT READINESS
  // ========================================================================
  console.log('[EXCEL] Building Sheet: Deployment Readiness...');
  const wsReady = wb.addWorksheet('Deployment Readiness', {
    properties: { tabColor: { argb: isReleaseReady ? COLORS.green : COLORS.red } },
  });

  wsReady.columns = [
    { width: 5 },
    { width: 30 },
    { width: 16 },
    { width: 20 },
    { width: 40 },
    { width: 5 },
  ];

  // Title
  wsReady.mergeCells('A1:F1');
  const rdyTitle = wsReady.getCell('A1');
  rdyTitle.value = '🚀  DEPLOYMENT READINESS ASSESSMENT';
  rdyTitle.fill = headerFill(COLORS.navy);
  rdyTitle.font = FONT.titleWhite;
  rdyTitle.alignment = ALIGN_CENTER;
  wsReady.getRow(1).height = 50;

  // Quality gates
  const gates = [
    { gate: 'Unit Tests', prefix: 'UNIT', mandatory: true },
    { gate: 'API Tests', prefix: 'API', mandatory: true },
    { gate: 'Security Tests', prefix: 'SEC', mandatory: true },
    { gate: 'Performance Tests', prefix: 'PERF', mandatory: false },
    { gate: 'UI/UX Tests', prefix: 'WEB', mandatory: true },
    { gate: 'Voice Tests', prefix: 'VOICE', mandatory: false },
    { gate: 'AI Tests', prefix: 'AI', mandatory: false },
    { gate: 'Database Tests', prefix: 'DB', mandatory: true },
    { gate: 'Integration Tests', prefix: 'INT', mandatory: true },
    { gate: 'Regression Tests', prefix: 'REG', mandatory: true },
    { gate: 'Load Tests', prefix: 'LOAD', mandatory: false },
    { gate: 'Vulnerability Scan', prefix: 'VULN', mandatory: true },
  ];

  const gateHdrRow = wsReady.getRow(3);
  ['', 'Quality Gate', 'Status', 'Results', 'Details'].forEach((h, i) => {
    gateHdrRow.getCell(i + 1).value = h;
  });
  styleHeaderRow(gateHdrRow, COLORS.darkBlue);

  let allMandatoryPass = true;
  gates.forEach((g, idx) => {
    const gateTests = results.filter(r => r.testId.startsWith(g.prefix + '-'));
    const gPass = gateTests.filter(r => r.status === 'PASS').length;
    const gFail = gateTests.filter(r => r.status === 'FAIL').length;
    const gNA = gateTests.filter(r => r.status === 'NOT_APPLICABLE' || r.status === 'N/A').length;
    const gExec = gateTests.length - gNA;

    let status;
    if (gateTests.length === 0) status = 'NOT RUN';
    else if (gFail > 0) status = 'FAIL';
    else status = 'PASS';

    if (g.mandatory && status !== 'PASS') allMandatoryPass = false;

    const r = wsReady.getRow(4 + idx);
    r.getCell(2).value = g.gate + (g.mandatory ? ' *' : '');
    r.getCell(2).font = g.mandatory ? FONT.bodyBold : FONT.body;
    r.getCell(3).value = status;
    colorStatusCell(r.getCell(3), status);
    r.getCell(4).value = gExec > 0 ? `${gPass}/${gExec} passed` : 'No tests';
    r.getCell(4).font = FONT.body;
    r.getCell(4).alignment = ALIGN_CENTER;
    r.getCell(5).value = gFail > 0
      ? `${gFail} failure(s): ${gateTests.filter(r2 => r2.status === 'FAIL').map(r2 => r2.testId).join(', ')}`
      : gExec > 0 ? 'All tests passed' : 'No tests executed for this category';
    r.getCell(5).font = FONT.body;

    [2, 3, 4, 5].forEach(col => {
      r.getCell(col).border = BORDER_THIN;
    });
  });

  // Verdict
  const verdictR = 4 + gates.length + 2;
  wsReady.mergeCells(`B${verdictR}:E${verdictR}`);
  const vCell = wsReady.getCell(`B${verdictR}`);
  vCell.value = allMandatoryPass
    ? '✅  ALL MANDATORY QUALITY GATES PASSED — READY FOR DEPLOYMENT'
    : '❌  MANDATORY QUALITY GATES FAILED — DEPLOYMENT BLOCKED';
  vCell.fill = solidFill(allMandatoryPass ? COLORS.green : COLORS.red);
  vCell.font = FONT.verdict;
  vCell.alignment = ALIGN_CENTER;
  wsReady.getRow(verdictR).height = 50;

  const noteR = verdictR + 2;
  wsReady.getCell(`B${noteR}`).value = '* = Mandatory quality gate for production deployment';
  wsReady.getCell(`B${noteR}`).font = FONT.note;

  // ========================================================================
  // SHEET 17: MODULE BREAKDOWN
  // ========================================================================
  console.log('[EXCEL] Building Sheet: Module Breakdown...');
  const wsMod = wb.addWorksheet('Module Breakdown', {
    properties: { tabColor: { argb: COLORS.info } },
  });

  const modCols = [
    { header: 'Module', key: 'module', width: 24 },
    { header: 'Total', key: 'total', width: 10 },
    { header: 'Passed', key: 'passed', width: 10 },
    { header: 'Failed', key: 'failed', width: 10 },
    { header: 'N/A', key: 'na', width: 10 },
    { header: 'Pass Rate', key: 'passRate', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
  ];

  wsMod.columns = modCols;
  const modHRow = wsMod.getRow(1);
  modCols.forEach((c, i) => { modHRow.getCell(i + 1).value = c.header; });
  styleHeaderRow(modHRow, COLORS.navy);

  modules.forEach((mod, idx) => {
    const modTests = results.filter(r => r.module === mod);
    const mPass = modTests.filter(r => r.status === 'PASS').length;
    const mFail = modTests.filter(r => r.status === 'FAIL').length;
    const mNA = modTests.filter(r => r.status === 'NOT_APPLICABLE' || r.status === 'N/A').length;
    const mExec = modTests.length - mNA;
    const mRate = mExec > 0 ? ((mPass / mExec) * 100).toFixed(1) : 'N/A';
    const mStatus = mFail > 0 ? 'FAIL' : mExec > 0 ? 'PASS' : 'N/A';

    const r = wsMod.addRow({
      module: mod,
      total: modTests.length,
      passed: mPass,
      failed: mFail,
      na: mNA,
      passRate: mRate !== 'N/A' ? `${mRate}%` : 'N/A',
      status: mStatus,
    });
    styleDataRow(r, idx);
    colorStatusCell(r.getCell(7), mStatus);
    if (mFail > 0) {
      r.getCell(4).fill = solidFill(COLORS.lightRed);
      r.getCell(4).font = { ...FONT.bodyBold, color: { argb: COLORS.red } };
    }
  });

  wsMod.autoFilter = { from: { row: 1, column: 1 }, to: { row: modules.length + 1, column: modCols.length } };
  wsMod.views = [{ state: 'frozen', ySplit: 1 }];

  // ========================================================================
  // WRITE FILE
  // ========================================================================
  console.log('[EXCEL] Writing Excel workbook...');
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  await wb.xlsx.writeFile(EXCEL_OUTPUT_PRIMARY);
  console.log(`[EXCEL] ✓ Written: ${EXCEL_OUTPUT_PRIMARY}`);

  // Copy to reports/ as well
  fs.copyFileSync(EXCEL_OUTPUT_PRIMARY, EXCEL_OUTPUT_REPORTS);
  console.log(`[EXCEL] ✓ Copied to: ${EXCEL_OUTPUT_REPORTS}`);

  // Verify
  const stat1 = fs.statSync(EXCEL_OUTPUT_PRIMARY);
  if (stat1.size === 0) {
    console.error('[EXCEL] FATAL: Generated file is 0 bytes!');
    process.exit(1);
  }

  console.log('');
  console.log('='.repeat(65));
  console.log('  KRISHNA AI — EXCEL QA REPORT GENERATION COMPLETE');
  console.log('='.repeat(65));
  console.log(`  File:          ${path.resolve(EXCEL_OUTPUT_PRIMARY)}`);
  console.log(`  Size:          ${(stat1.size / 1024).toFixed(1)} KB`);
  console.log(`  Worksheets:    17`);
  console.log(`  Total Tests:   ${total}`);
  console.log(`  Passed:        ${passed}`);
  console.log(`  Failed:        ${failed}`);
  console.log(`  Pass Rate:     ${passRate}%`);
  console.log(`  Release:       ${isReleaseReady ? 'READY' : 'BLOCKED'}`);
  console.log('='.repeat(65));
  console.log('');
}

generateExcelReport().catch(err => {
  console.error('[EXCEL] FATAL: Excel generation failed.');
  console.error(err);
  process.exit(1);
});
