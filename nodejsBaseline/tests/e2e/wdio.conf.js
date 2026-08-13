// wdio.conf.js - WebDriverIO configuration for Selenium end-to-end tests
exports.config = {
  runner: "local",
  specs: [
    "./specs/**/*.spec.js"
  ],
  maxInstances: 5,
  capabilities: [{
    maxInstances: 5,
    browserName: "chrome",
    "goog:chromeOptions": {
      args: ["--headless", "--disable-gpu", "--window-size=1920,1080"]
    }
  }],
  logLevel: "info",
  bail: 0,
  baseUrl: "http://localhost:3000",
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ["chromedriver"],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000
  },
  reporters: [
    ["spec"],
    ["junit", { outputDir: "./reports/junit" }],
    ["allure", { outputDir: "./reports/allure-results" }]
  ],
  // Hook to generate a simple JSON report after each run
  afterTest: function (test, context, { error, result, duration, passed, retries }) {
    const fs = require("fs");
    const reportPath = "./reports/report.json";
    const entry = {
      id: test.title,
      passed,
      duration,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    };
    let data = [];
    if (fs.existsSync(reportPath)) {
      data = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    }
    data.push(entry);
    fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));
  }
};
