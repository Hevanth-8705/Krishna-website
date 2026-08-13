// generate-specs.cjs - Generates WebDriverIO spec files from test-cases.yaml (CommonJS)
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const yamlPath = path.join(__dirname, 'test-cases.yaml');
const specsDir = path.join(__dirname, 'specs');

if (!fs.existsSync(specsDir)) {
  fs.mkdirSync(specsDir, { recursive: true });
}

const raw = fs.readFileSync(yamlPath, 'utf8');
const testCases = yaml.load(raw);

testCases.forEach((test, idx) => {
  const safeTitle = test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `${idx + 1}_${safeTitle}.spec.js`;
  const filePath = path.join(specsDir, fileName);
  const steps = (test.steps || []).map((s, i) => `    // Step ${i + 1}: ${s}`).join('\n');
  const content = `const assert = require('assert');
// TODO: Import required page objects, e.g., const HomePage = require('../pages/HomePage');

describe('${test.title}', () => {
  it('should ${test.expected}', async () => {
    ${steps}
    // Add actual actions/assertions here
    assert.ok(true);
  });
});`;
  fs.writeFileSync(filePath, content);
});
  const safeTitle = test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const fileName = `${idx + 1}_${safeTitle}.spec.js`;
  const filePath = path.join(specsDir, fileName);
  const steps = (test.steps || []).map((s, i) => `    // Step ${i + 1}: ${s}`).join('\n');
  const content = `const assert = require('assert');\n// TODO: Import required page objects, e.g., const HomePage = require('../pages/HomePage');\n\ndescribe('${test.title}', () => {\n  it('should ${test.expected}', async () => {\n    ${steps}\n    // Add actual actions/assertions here\n    assert.ok(true);\n  });\n});\n`;
  fs.writeFileSync(filePath, content);
});\n\nconsole.log('Generated', testCases.length, 'spec files in', specsDir);\n
