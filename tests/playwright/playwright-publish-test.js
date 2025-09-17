const { chromium } = require('playwright');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'test@test.com',
  password: 'Password123!'
};

const TEST_SERVER = {
  // Basic Info
  name: 'com.test.playwright-server',
  version: '1.0.0',
  description: 'An automated test server created by Playwright to demonstrate the MCP Registry publish functionality',
  status: 'experimental',
  
  // Repository
  repoType: 'git',
  repoUrl: 'https://github.com/test/playwright-mcp-server',
  branch: 'main',
  tag: 'v1.0.0',
  
  // Package
  registry: 'npm',
  identifier: '@test/playwright-mcp-server',
  packageVersion: '1.0.0',
  
  // Remote
  transport: 'https',
  remoteUrl: 'https://api.test.com/mcp/playwright'
};

async function runPublishTest() {
  const browser = await chromium.launch({ 
    headless: false,  // Set to true for headless mode
    slowMo: 500       // Slow down by 500ms for visibility
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting MCP Registry Publish Server Test');
    
    // Step 1: Navigate to login page
    console.log('\n📍 Step 1: Navigating to login page...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.waitForSelector('h2:has-text("Sign in to your account")');
    
    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Sign in")');
    
    // Wait for dashboard to load
    await page.waitForSelector('h1:has-text("Admin Dashboard")', { timeout: 5000 });
    console.log('✅ Successfully logged in!');
    
    // Step 3: Navigate to Servers page
    console.log('\n📋 Step 3: Navigating to Servers page...');
    await page.click('a[href="/servers"]');
    await page.waitForSelector('h1:has-text("MCP Servers")');
    
    // Step 4: Click Publish Server button
    console.log('➕ Step 4: Starting server publish flow...');
    
    // Use the specific Publish Server button in the main content area (not sidebar)
    console.log('🔍 Looking for Publish Server button in main content...');
    const publishButton = await page.locator('main a.btn-primary:has-text("Publish Server")').first();
    
    if (await publishButton.count() === 0) {
      console.log('❌ Main Publish Server button not found. Taking debug screenshot...');
      await page.screenshot({ path: 'servers-page-debug.png', fullPage: true });
      throw new Error('Publish Server button not found in main content area');
    }
    
    console.log('✅ Found main Publish Server button, clicking...');
    await publishButton.click();
    await page.waitForSelector('h1:has-text("Publish MCP Server")');
    
    // Step 5: Fill Basic Info (Step 1/5)
    console.log('\n📝 Step 5: Filling Basic Info...');
    await page.fill('input[placeholder*="com.company.mcp-server"]', TEST_SERVER.name);
    await page.fill('input[placeholder="1.0.0"]', TEST_SERVER.version);
    await page.fill('textarea[placeholder*="brief description"]', TEST_SERVER.description);
    await page.selectOption('select', TEST_SERVER.status);
    
    // Wait a moment for form validation
    await page.waitForTimeout(1000);
    
    // Click Next - use force to bypass any overlays
    console.log('🔄 Clicking Next button (Step 1→2)...');
    await page.click('button:has-text("Next")', { force: true });
    
    // Step 6: Fill Repository Info (Step 2/5)
    console.log('🔗 Step 6: Filling Repository Info...');
    await page.check('input[type="checkbox"]:near(:text("Include Repository Information"))');
    await page.selectOption('select', TEST_SERVER.repoType);
    await page.fill('input[placeholder*="github.com"]', TEST_SERVER.repoUrl);
    await page.fill('input[placeholder="main"]', TEST_SERVER.branch);
    await page.fill('input[placeholder="v1.0.0"]', TEST_SERVER.tag);
    
    // Wait a moment for form validation
    await page.waitForTimeout(1000);
    
    // Click Next - use force to bypass any overlays
    console.log('🔄 Clicking Next button (Step 1→2)...');
    await page.click('button:has-text("Next")', { force: true });
    
    // Step 7: Fill Packages Info (Step 3/5)
    console.log('📦 Step 7: Filling Package Info...');
    await page.check('input[type="checkbox"]:near(:text("Include Package Information"))');
    await page.click('button:has-text("Add Package")');
    
    // Fill package details
    await page.selectOption('.border.border-gray-200.rounded-lg select', TEST_SERVER.registry);
    await page.fill('input[placeholder*="@company/mcp-server"]', TEST_SERVER.identifier);
    await page.fill('.border.border-gray-200.rounded-lg input[placeholder="1.0.0"]', TEST_SERVER.packageVersion);
    
    // Wait a moment for form validation
    await page.waitForTimeout(1000);
    
    // Click Next - use force to bypass any overlays
    console.log('🔄 Clicking Next button (Step 1→2)...');
    await page.click('button:has-text("Next")', { force: true });
    
    // Step 8: Fill Remote Config (Step 4/5)
    console.log('🌐 Step 8: Filling Remote Config...');
    await page.check('input[type="checkbox"]:near(:text("Include Remote Configuration"))');
    await page.selectOption('select:near(:text("Transport Protocol"))', TEST_SERVER.transport);
    await page.fill('input[placeholder*="https://api.company.com"]', TEST_SERVER.remoteUrl);
    
    // Wait a moment for form validation
    await page.waitForTimeout(1000);
    
    // Click Next - use force to bypass any overlays
    console.log('🔄 Clicking Next button (Step 1→2)...');
    await page.click('button:has-text("Next")', { force: true });
    
    // Step 9: Review and Publish (Step 5/5)
    console.log('\n👀 Step 9: Reviewing configuration...');
    await page.waitForSelector('h3:has-text("Review Your Server Configuration")');
    
    // Verify all information is displayed correctly
    await page.waitForSelector(`text=${TEST_SERVER.name}`);
    await page.waitForSelector(`text=${TEST_SERVER.version}`);
    await page.waitForSelector(`text=${TEST_SERVER.status}`);
    
    // Take screenshot of review page
    await page.screenshot({ path: 'review-page.png', fullPage: true });
    console.log('📸 Screenshot saved: review-page.png');
    
    // Click Publish Server
    console.log('\n🚀 Step 10: Publishing server...');
    await page.click('button:has-text("Publish Server")');
    
    // Wait for redirect to server detail page
    await page.waitForURL(/\/servers\/[a-zA-Z0-9]+/, { timeout: 10000 });
    console.log('✅ Server published successfully!');
    
    // Verify we're on the server detail page
    await page.waitForSelector(`h1:has-text("${TEST_SERVER.name}")`);
    
    // Take screenshot of published server
    await page.screenshot({ path: 'published-server.png', fullPage: true });
    console.log('📸 Screenshot saved: published-server.png');
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    // Take error screenshot
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved: error-screenshot.png');
    throw error;
  } finally {
    // Optional: Keep browser open for inspection
    // await page.pause();
    
    // Close browser
    await browser.close();
  }
}

// Run the test
runPublishTest().catch(console.error);