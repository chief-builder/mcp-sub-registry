import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '../..');

const pages = [
  {
    file: 'docs/index.html',
    requiredText: [
      '<title>MCP Sub-Registry</title>',
      'MCP Sub-Registry',
      'Open DeepSec Demo',
      'screenshots/02-dashboard.png',
      'screenshots/03-server-listing.png',
    ],
  },
  {
    file: 'docs/deepsec/index.html',
    requiredText: [
      '<title>DeepSec MCP Registry Demo</title>',
      'DeepSec MCP Registry Demo',
      'deepsec-server.json',
      '../screenshots/publish-step5-review.png',
      'io.deepsec/security-scanner',
    ],
  },
];

function fail(message) {
  console.error(`docs:check failed: ${message}`);
  process.exitCode = 1;
}

function assertExists(relativePath) {
  const absolutePath = resolve(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    fail(`missing ${relativePath}`);
  }
}

function findLocalReferences(html) {
  const refs = [];
  const attrPattern = /\b(?:href|src)="([^"]+)"/g;
  let match;

  while ((match = attrPattern.exec(html))) {
    const value = match[1];
    if (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('#') ||
      value.startsWith('mailto:')
    ) {
      continue;
    }
    refs.push(value);
  }

  return refs;
}

for (const page of pages) {
  assertExists(page.file);

  const pagePath = resolve(repoRoot, page.file);
  const html = readFileSync(pagePath, 'utf8');

  for (const text of page.requiredText) {
    if (!html.includes(text)) {
      fail(`${page.file} is missing required text: ${text}`);
    }
  }

  if (html.includes('github.com/company/mcp-sub-registry')) {
    fail(`${page.file} still references the placeholder company repository`);
  }

  for (const ref of findLocalReferences(html)) {
    const target = resolve(dirname(pagePath), ref);
    if (!existsSync(target)) {
      fail(`${page.file} references missing local asset or page: ${ref}`);
    }
  }
}

const payloadPath = resolve(repoRoot, 'docs/deepsec/deepsec-server.json');
assertExists('docs/deepsec/deepsec-server.json');

const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
const payloadChecks = [
  payload.name === 'io.deepsec/security-scanner',
  payload.version === '1.4.2',
  Array.isArray(payload.packages) && payload.packages[0]?.registryType === 'npm',
  Array.isArray(payload.remotes) && payload.remotes[0]?.type === 'streamable-http',
  payload._meta?.['com.example.approvalRequired'] === true,
];

if (payloadChecks.some((passed) => !passed)) {
  fail('docs/deepsec/deepsec-server.json does not match the expected DeepSec demo payload');
}

if (!process.exitCode) {
  console.log('docs:check passed');
}
