// generate-specs.js - Dynamically creates spec files from test-cases.yaml
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
// Placeholder page import – replace with actual POM as needed
// const HomePage = require('../pages/HomePage');

describe('${test.title}', () => {
  it('should ${test.expected}', async () => {
    // TODO: navigate/open appropriate page
    ${steps}
    // Add real assertions here
    assert.ok(true);
  });
});
`;
  fs.writeFileSync(filePath, content);
});

console.log('Generated', testCases.length, 'spec files in', specsDir);
