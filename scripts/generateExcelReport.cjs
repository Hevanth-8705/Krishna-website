// scripts/generateExcelReport.js
// Reads reports/test-results.json and generates reports/Krishna-Test-Report.xlsx
// Uses exceljs. All values are dynamically computed from actual test results.
// NEVER generates fake or hardcoded pass/fail data.

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports');
const INPUT_FILE = path.join(REPORTS_DIR, 'test-results.json');
const OUTPUT_FILE = path.join(REPORTS_DIR, 'Krishna-Test-Report.xlsx');

// ============================================================
// VALIDATION
// ============================================================

if (!fs.existsSync(INPUT_FILE)) {
  console.error('[QA] FATAL: reports/test-results.json does not exist.');
  console.error('[QA] Run "npm run qa:test" first to generate test results.');
  process.exit(1);
}

let data;
try {
  const raw = fs.readFileSync(INPUT_FILE, 'utf8');
  data = JSON.parse(raw);
} catch (err) {
  console.error('[QA] FATAL: reports/test-results.json is not valid JSON.');
  console.error(err.message);
  process.exit(1);
}

if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
  console.error('[QA] FATAL: test-results.json contains no test results.');
  console.error('[QA] Run "npm run qa:test" first to execute tests.');
  process.exit(1);
}

const meta = data.meta || {};
const summary = data.summary || {};
const results = data.results;

console.log(`[QA] Loaded ${results.length} test results from test-results.json`);

// ============================================================
// STYLE CONSTANTS
// ============================================================

const COLORS = {
  headerBg: 'FF1A1A2E',     // Deep navy
  headerFont: 'FFFFFFFF',   // White
  passBg: 'FF00E676',       // Green
  failBg: 'FFFF1744',       // Red
  skipBg: 'FFFFAB00',       // Amber
  blockBg: 'FFFF6D00',      // Orange
  notRunBg: 'FF9E9E9E',     // Grey
  titleBg: 'FF0D47A1',      // Blue
  titleFont: 'FFFFFFFF',
  altRowBg: 'FFF5F5F5',     // Light grey
  borderColor: 'FFE0E0E0',
  readyBg: 'FF00C853',      // Bright green
  notReadyBg: 'FFD50000',   // Bright red
  summaryValueBg: 'FFE3F2FD', // Light blue
};

function applyHeaderStyle(row) {
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.font = { bold: true, color: { argb: COLORS.headerFont }, size: 11, name: 'Segoe UI' };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: COLORS.borderColor } },
      bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
      left: { style: 'thin', color: { argb: COLORS.borderColor } },
      right: { style: 'thin', color: { argb: COLORS.borderColor } },
    };
  });
  row.height = 30;
}

function applyDataStyle(row, idx) {
  row.eachCell((cell) => {
    cell.font = { size: 10, name: 'Segoe UI' };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: COLORS.borderColor } },
      bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
      left: { style: 'thin', color: { argb: COLORS.borderColor } },
      right: { style: 'thin', color: { argb: COLORS.borderColor } },
    };
    if (idx % 2 === 0) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.altRowBg } };
    }
  });
}

function applyStatusColor(cell, status) {
  const s = (status || '').toUpperCase();
  let bg = null;
  if (s === 'PASS') bg = COLORS.passBg;
  else if (s === 'FAIL') bg = COLORS.failBg;
  else if (s === 'SKIPPED') bg = COLORS.skipBg;
  else if (s === 'BLOCKED') bg = COLORS.blockBg;
  else if (s === 'NOT RUN') bg = COLORS.notRunBg;
  if (bg) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Segoe UI' };
  }
}

// Standard test columns used across category sheets
const TEST_COLUMNS = [
  { header: 'Test ID', key: 'testId', width: 14 },
  { header: 'Category', key: 'category', width: 16 },
  { header: 'Module', key: 'module', width: 18 },
  { header: 'Test Name', key: 'testName', width: 32 },
  { header: 'Description', key: 'description', width: 40 },
  { header: 'Expected Result', key: 'expectedResult', width: 28 },
  { header: 'Actual Result', key: 'actualResult', width: 28 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Start Time', key: 'startTime', width: 22 },
  { header: 'End Time', key: 'endTime', width: 22 },
  { header: 'Duration (ms)', key: 'duration', width: 14 },
  { header: 'Environment', key: 'environment', width: 14 },
  { header: 'Browser', key: 'browser', width: 14 },
  { header: 'Device', key: 'device', width: 18 },
  { header: 'Error Message', key: 'errorMessage', width: 36 },
  { header: 'Screenshot', key: 'screenshot', width: 18 },
  { header: 'Trace / Log', key: 'trace', width: 24 },
];

function addTestSheet(workbook, sheetName, testData) {
  const ws = workbook.addWorksheet(sheetName);
  ws.columns = TEST_COLUMNS;

  // Header row
  const headerRow = ws.getRow(1);
  TEST_COLUMNS.forEach((col, idx) => {
    headerRow.getCell(idx + 1).value = col.header;
  });
  applyHeaderStyle(headerRow);

  if (testData.length === 0) {
    const emptyRow = ws.addRow({ testId: `No ${sheetName.toLowerCase()} tests` });
    ws.mergeCells(2, 1, 2, TEST_COLUMNS.length);
    emptyRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    emptyRow.getCell(1).font = { italic: true, size: 11, name: 'Segoe UI', color: { argb: 'FF757575' } };
    return ws;
  }

  testData.forEach((test, idx) => {
    const row = ws.addRow({
      testId: test.testId,
      category: test.category,
      module: test.module,
      testName: test.testName,
      description: test.description || '',
      expectedResult: test.expectedResult || '',
      actualResult: test.actualResult || '',
      status: test.status,
      startTime: test.startTime,
      endTime: test.endTime,
      duration: test.duration,
      environment: test.environment,
      browser: test.browser,
      device: test.device,
      errorMessage: test.errorMessage || '',
      screenshot: test.screenshot || '',
      trace: test.trace || test.stackTrace || '',
    });
    applyDataStyle(row, idx);
    // Color the status cell
    const statusCell = row.getCell(8);
    applyStatusColor(statusCell, test.status);
  });

  // Auto-filter
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: testData.length + 1, column: TEST_COLUMNS.length } };
  // Freeze header
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  return ws;
}

// ============================================================
// BUILD WORKBOOK
// ============================================================

async function generateReport() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Krishna AI QA System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // --------------------------------------------------------
  // 1. EXECUTIVE SUMMARY
  // --------------------------------------------------------
  const wsSummary = workbook.addWorksheet('Executive Summary');

  // Title
  wsSummary.mergeCells('A1:D1');
  const titleCell = wsSummary.getCell('A1');
  titleCell.value = 'KRISHNA AI — TEST EXECUTION REPORT';
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
  titleCell.font = { bold: true, size: 18, color: { argb: COLORS.titleFont }, name: 'Segoe UI' };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsSummary.getRow(1).height = 45;

  // Subtitle
  wsSummary.mergeCells('A2:D2');
  const subtitleCell = wsSummary.getCell('A2');
  subtitleCell.value = `Generated: ${new Date().toISOString()}`;
  subtitleCell.font = { italic: true, size: 10, color: { argb: 'FF757575' }, name: 'Segoe UI' };
  subtitleCell.alignment = { horizontal: 'center' };

  // Dynamically calculated values
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIPPED').length;
  const blocked = results.filter(r => r.status === 'BLOCKED').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
  const failRate = total > 0 ? ((failed / total) * 100).toFixed(1) : '0.0';

  const durations = results.map(r => r.duration || 0);
  const totalDuration = durations.reduce((a, b) => a + b, 0);

  const summaryRows = [
    ['Total Tests', total],
    ['Passed', passed],
    ['Failed', failed],
    ['Skipped', skipped],
    ['Blocked', blocked],
    ['Pass Percentage', `${passRate}%`],
    ['Fail Percentage', `${failRate}%`],
    ['', ''],
    ['Execution Start', meta.executionStart || 'N/A'],
    ['Execution End', meta.executionEnd || 'N/A'],
    ['Total Execution Duration', `${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`],
    ['', ''],
    ['Environment', meta.environment || 'N/A'],
    ['Browser', meta.browser || 'N/A'],
    ['Device', meta.device || 'N/A'],
    ['Project', meta.projectName || 'Krishna AI'],
  ];

  wsSummary.columns = [
    { width: 8 },  // A: spacer
    { width: 30 }, // B: label
    { width: 40 }, // C: value
    { width: 8 },  // D: spacer
  ];

  let row = 4;
  summaryRows.forEach(([label, value]) => {
    const labelCell = wsSummary.getCell(`B${row}`);
    const valueCell = wsSummary.getCell(`C${row}`);
    labelCell.value = label;
    valueCell.value = value;
    if (label) {
      labelCell.font = { bold: true, size: 12, name: 'Segoe UI' };
      labelCell.alignment = { vertical: 'middle' };
      valueCell.font = { size: 12, name: 'Segoe UI' };
      valueCell.alignment = { horizontal: 'center', vertical: 'middle' };
      valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.summaryValueBg } };
      valueCell.border = {
        top: { style: 'thin', color: { argb: COLORS.borderColor } },
        bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
        left: { style: 'thin', color: { argb: COLORS.borderColor } },
        right: { style: 'thin', color: { argb: COLORS.borderColor } },
      };
      // Highlight pass/fail
      if (label === 'Passed') {
        valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.passBg } };
        valueCell.font = { bold: true, size: 12, name: 'Segoe UI', color: { argb: 'FFFFFFFF' } };
      } else if (label === 'Failed' && failed > 0) {
        valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.failBg } };
        valueCell.font = { bold: true, size: 12, name: 'Segoe UI', color: { argb: 'FFFFFFFF' } };
      }
    }
    row++;
  });

  // Category breakdown table
  row += 2;
  wsSummary.getCell(`B${row}`).value = 'Category Breakdown';
  wsSummary.getCell(`B${row}`).font = { bold: true, size: 14, name: 'Segoe UI', underline: true };
  row++;

  const categories = [...new Set(results.map(r => r.category))];
  const catHeader = wsSummary.getRow(row);
  catHeader.getCell(2).value = 'Category';
  catHeader.getCell(3).value = 'Total';
  catHeader.getCell(4).value = 'Passed';
  catHeader.getCell(5).value = 'Failed';
  catHeader.getCell(6).value = 'Pass Rate';
  [2, 3, 4, 5, 6].forEach(col => {
    const c = catHeader.getCell(col);
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    c.font = { bold: true, color: { argb: COLORS.headerFont }, size: 10, name: 'Segoe UI' };
    c.alignment = { horizontal: 'center' };
  });
  row++;

  categories.forEach((cat) => {
    const catTests = results.filter(r => r.category === cat);
    const catPassed = catTests.filter(r => r.status === 'PASS').length;
    const catFailed = catTests.filter(r => r.status === 'FAIL').length;
    const catRate = catTests.length > 0 ? ((catPassed / catTests.length) * 100).toFixed(1) : '0.0';
    const r = wsSummary.getRow(row);
    r.getCell(2).value = cat;
    r.getCell(3).value = catTests.length;
    r.getCell(4).value = catPassed;
    r.getCell(5).value = catFailed;
    r.getCell(6).value = `${catRate}%`;
    [2, 3, 4, 5, 6].forEach(col => {
      r.getCell(col).font = { size: 10, name: 'Segoe UI' };
      r.getCell(col).alignment = { horizontal: 'center' };
      r.getCell(col).border = {
        top: { style: 'thin', color: { argb: COLORS.borderColor } },
        bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
        left: { style: 'thin', color: { argb: COLORS.borderColor } },
        right: { style: 'thin', color: { argb: COLORS.borderColor } },
      };
    });
    row++;
  });

  // --------------------------------------------------------
  // 2. ALL TEST CASES
  // --------------------------------------------------------
  addTestSheet(workbook, 'All Test Cases', results);

  // --------------------------------------------------------
  // 3–12. CATEGORY SHEETS
  // --------------------------------------------------------
  const categorySheets = [
    { name: 'Functional Testing', filter: 'Functional' },
    { name: 'UI UX Testing', filter: 'UI UX' },
    { name: 'Unit Testing', filter: 'Unit' },
    { name: 'API Testing', filter: 'API' },
    { name: 'Integration Testing', filter: 'Integration' },
    { name: 'Selenium E2E', filter: 'Selenium E2E' },
    { name: 'Appium', filter: 'Appium' },
    { name: 'Security', filter: 'Security' },
    { name: 'Performance', filter: 'Performance' },
    { name: 'Regression', filter: 'Regression' },
  ];

  categorySheets.forEach(({ name, filter }) => {
    const filtered = results.filter(r => r.category === filter);
    addTestSheet(workbook, name, filtered);
  });

  // --------------------------------------------------------
  // 13. FAILED TESTS
  // --------------------------------------------------------
  const failedTests = results.filter(r => r.status === 'FAIL');
  const wsFailed = workbook.addWorksheet('Failed Tests');
  const failedColumns = [
    { header: 'Test ID', key: 'testId', width: 14 },
    { header: 'Module', key: 'module', width: 18 },
    { header: 'Test Name', key: 'testName', width: 32 },
    { header: 'Expected Result', key: 'expectedResult', width: 28 },
    { header: 'Actual Result', key: 'actualResult', width: 28 },
    { header: 'Error', key: 'errorMessage', width: 40 },
    { header: 'Stack Trace', key: 'stackTrace', width: 50 },
    { header: 'Screenshot', key: 'screenshot', width: 18 },
    { header: 'Duration (ms)', key: 'duration', width: 14 },
  ];
  wsFailed.columns = failedColumns;

  const failedHeaderRow = wsFailed.getRow(1);
  failedColumns.forEach((col, idx) => {
    failedHeaderRow.getCell(idx + 1).value = col.header;
  });
  applyHeaderStyle(failedHeaderRow);

  if (failedTests.length === 0) {
    const noFailRow = wsFailed.addRow({ testId: 'No failed tests' });
    wsFailed.mergeCells(2, 1, 2, failedColumns.length);
    noFailRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    noFailRow.getCell(1).font = { italic: true, size: 12, name: 'Segoe UI', color: { argb: 'FF4CAF50' } };
  } else {
    failedTests.forEach((test, idx) => {
      const row = wsFailed.addRow({
        testId: test.testId,
        module: test.module,
        testName: test.testName,
        expectedResult: test.expectedResult || '',
        actualResult: test.actualResult || '',
        errorMessage: test.errorMessage || '',
        stackTrace: test.stackTrace || '',
        screenshot: test.screenshot || '',
        duration: test.duration,
      });
      applyDataStyle(row, idx);
      // Highlight entire row with light red
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEBEE' } };
      });
    });
  }
  wsFailed.views = [{ state: 'frozen', ySplit: 1 }];

  // --------------------------------------------------------
  // 14. BLOCKED TESTS
  // --------------------------------------------------------
  const blockedTests = results.filter(r => r.status === 'BLOCKED');
  const wsBlocked = workbook.addWorksheet('Blocked Tests');
  wsBlocked.columns = TEST_COLUMNS;
  const blockedHeaderRow = wsBlocked.getRow(1);
  TEST_COLUMNS.forEach((col, idx) => {
    blockedHeaderRow.getCell(idx + 1).value = col.header;
  });
  applyHeaderStyle(blockedHeaderRow);

  if (blockedTests.length === 0) {
    const noBlockRow = wsBlocked.addRow({ testId: 'No blocked tests' });
    wsBlocked.mergeCells(2, 1, 2, TEST_COLUMNS.length);
    noBlockRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    noBlockRow.getCell(1).font = { italic: true, size: 12, name: 'Segoe UI', color: { argb: 'FF4CAF50' } };
  } else {
    blockedTests.forEach((test, idx) => {
      const row = wsBlocked.addRow({
        testId: test.testId,
        category: test.category,
        module: test.module,
        testName: test.testName,
        description: test.description || '',
        expectedResult: test.expectedResult || '',
        actualResult: test.actualResult || '',
        status: test.status,
        startTime: test.startTime,
        endTime: test.endTime,
        duration: test.duration,
        environment: test.environment,
        browser: test.browser,
        device: test.device,
        errorMessage: test.errorMessage || '',
        screenshot: test.screenshot || '',
        trace: test.stackTrace || '',
      });
      applyDataStyle(row, idx);
    });
  }
  wsBlocked.views = [{ state: 'frozen', ySplit: 1 }];

  // --------------------------------------------------------
  // 15. DEPLOYMENT READINESS
  // --------------------------------------------------------
  const wsReady = workbook.addWorksheet('Deployment Readiness');

  // Title
  wsReady.mergeCells('A1:C1');
  const readyTitle = wsReady.getCell('A1');
  readyTitle.value = 'DEPLOYMENT READINESS ASSESSMENT';
  readyTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.titleBg } };
  readyTitle.font = { bold: true, size: 16, color: { argb: COLORS.titleFont }, name: 'Segoe UI' };
  readyTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsReady.getRow(1).height = 40;

  wsReady.columns = [
    { width: 30 }, // A: Quality Gate
    { width: 20 }, // B: Status
    { width: 40 }, // C: Details
  ];

  // Quality gate assessment — all calculated dynamically
  function getGateStatus(category) {
    const catTests = results.filter(r => r.category === category);
    if (catTests.length === 0) return 'NOT RUN';
    const catFailed = catTests.filter(r => r.status === 'FAIL').length;
    const catBlocked = catTests.filter(r => r.status === 'BLOCKED').length;
    if (catBlocked > 0) return 'BLOCKED';
    if (catFailed > 0) return 'FAIL';
    return 'PASS';
  }

  const qualityGates = [
    { gate: 'Build Configuration', category: 'Regression', mandatory: true },
    { gate: 'Lint / TypeScript', category: 'Unit', mandatory: true },
    { gate: 'Unit Tests', category: 'Unit', mandatory: true },
    { gate: 'API Tests', category: 'API', mandatory: true },
    { gate: 'Functional Tests', category: 'Functional', mandatory: true },
    { gate: 'Selenium E2E', category: 'Selenium E2E', mandatory: true },
    { gate: 'Security', category: 'Security', mandatory: true },
    { gate: 'Performance', category: 'Performance', mandatory: false },
    { gate: 'Integration', category: 'Integration', mandatory: true },
    { gate: 'Appium Mobile', category: 'Appium', mandatory: false },
  ];

  // Header
  const gateHeaderRow = wsReady.getRow(3);
  gateHeaderRow.getCell(1).value = 'Quality Gate';
  gateHeaderRow.getCell(2).value = 'Status';
  gateHeaderRow.getCell(3).value = 'Details';
  applyHeaderStyle(gateHeaderRow);

  let allMandatoryPass = true;
  qualityGates.forEach((gate, idx) => {
    const status = getGateStatus(gate.category);
    const catTests = results.filter(r => r.category === gate.category);
    const catPassed = catTests.filter(r => r.status === 'PASS').length;

    if (gate.mandatory && status !== 'PASS') {
      allMandatoryPass = false;
    }

    const gateRow = wsReady.getRow(4 + idx);
    gateRow.getCell(1).value = gate.gate + (gate.mandatory ? ' *' : '');
    gateRow.getCell(1).font = { bold: gate.mandatory, size: 11, name: 'Segoe UI' };
    gateRow.getCell(2).value = status;
    applyStatusColor(gateRow.getCell(2), status);
    gateRow.getCell(2).alignment = { horizontal: 'center' };
    gateRow.getCell(3).value = catTests.length > 0
      ? `${catPassed}/${catTests.length} passed`
      : 'No tests executed';
    gateRow.getCell(3).font = { size: 10, name: 'Segoe UI' };

    [1, 2, 3].forEach(col => {
      gateRow.getCell(col).border = {
        top: { style: 'thin', color: { argb: COLORS.borderColor } },
        bottom: { style: 'thin', color: { argb: COLORS.borderColor } },
        left: { style: 'thin', color: { argb: COLORS.borderColor } },
        right: { style: 'thin', color: { argb: COLORS.borderColor } },
      };
    });
  });

  // Final verdict
  const verdictRow = 4 + qualityGates.length + 2;
  wsReady.mergeCells(`A${verdictRow}:C${verdictRow}`);
  const verdictCell = wsReady.getCell(`A${verdictRow}`);
  verdictCell.value = allMandatoryPass ? '✅ READY FOR DEPLOYMENT' : '❌ NOT READY FOR DEPLOYMENT';
  verdictCell.fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: allMandatoryPass ? COLORS.readyBg : COLORS.notReadyBg },
  };
  verdictCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' }, name: 'Segoe UI' };
  verdictCell.alignment = { horizontal: 'center', vertical: 'middle' };
  wsReady.getRow(verdictRow).height = 45;

  // Note about mandatory gates
  const noteRow = verdictRow + 2;
  wsReady.getCell(`A${noteRow}`).value = '* = Mandatory quality gate';
  wsReady.getCell(`A${noteRow}`).font = { italic: true, size: 9, color: { argb: 'FF757575' }, name: 'Segoe UI' };

  // --------------------------------------------------------
  // WRITE FILE
  // --------------------------------------------------------
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  await workbook.xlsx.writeFile(OUTPUT_FILE);

  // --------------------------------------------------------
  // VERIFICATION
  // --------------------------------------------------------
  if (!fs.existsSync(OUTPUT_FILE)) {
    console.error('[QA] FATAL: Excel file was not created.');
    process.exit(1);
  }

  const stat = fs.statSync(OUTPUT_FILE);
  if (stat.size === 0) {
    console.error('[QA] FATAL: Excel file is empty (0 bytes).');
    process.exit(1);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('[QA] Excel generation PASS');
  console.log(`[QA] File: ${path.resolve(OUTPUT_FILE)}`);
  console.log(`[QA] Size: ${stat.size} bytes`);
  console.log(`[QA] Worksheets: 15`);
  console.log(`[QA] Total test rows: ${results.length}`);
  console.log(`[QA] Pass Rate: ${passRate}%`);
  console.log('='.repeat(60));
}

generateReport().catch(err => {
  console.error('[QA] FATAL: Excel generation failed.');
  console.error(err);
  process.exit(1);
});
