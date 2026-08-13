// appium.conf.js - Appium configuration for Android end‑to‑end tests
exports.config = {
  runner: "local",
  specs: ["./appium/**/*.spec.js"],
  maxInstances: 1,
  capabilities: [{
    platformName: "Android",
    "appium:deviceName": "Android Emulator",
    "appium:platformVersion": "13.0",
    "appium:automationName": "UiAutomator2",
    "appium:app": path.join(process.cwd(), "android", "app-debug.apk"), // adjust path to your APK
    "appium:autoGrantPermissions": true
  }],
  logLevel: "error",
  bail: 0,
  baseUrl: "http://localhost:3000",
  waitforTimeout: 20000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ["appium"],
  framework: "mocha",
  mochaOpts: { ui: "bdd", timeout: 60000 },
  reporters: [
    ["json", { outputDir: "./nodejsBaseline/tests/e2e/reports", fileName: "appium-results.json" }],
    ["allure", { outputDir: "./nodejsBaseline/tests/e2e/appium-allure-results" }]
  ]
};
