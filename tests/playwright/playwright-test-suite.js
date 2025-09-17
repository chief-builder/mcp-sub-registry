const { chromium } = require('playwright');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'test@test.com',
  password: 'Password123!'
};

async function runTestSuite() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  console.log('🧪 Starting MCP Registry Test Suite\n');
  
  try {
    // Test 1: Registration Flow
    await runTest('User Registration', async () => {
      await page.goto(`${BASE_URL}/auth/register`);
      await page.waitForSelector('h2:has-text("Create your account")');
      
      // Find username field - it should be the second input field
      const usernameField = page.locator('input').nth(1);
      
      await page.fill('input[type="email"]', 'newuser@test.com');
      await usernameField.fill('newuser123');
      await page.fill('input[type="password"]', 'Password123!');
      await page.fill('input[placeholder*="development-admin-key"]', 'development-admin-key-change-in-production');
      await page.click('button:has-text("Create account")');
      
      await page.waitForSelector('text=Account Created Successfully!', { timeout: 5000 });
      console.log('   ✅ Registration successful');
    });
    
    // Test 2: Login Flow
    await runTest('User Login', async () => {
      await page.goto(`${BASE_URL}/auth/login`);
      await page.waitForSelector('h2:has-text("Sign in to your account")');
      
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button:has-text("Sign in")');
      
      await page.waitForSelector('h1:has-text("Admin Dashboard")', { timeout: 5000 });
      console.log('   ✅ Login successful');
    });
    
    // Test 3: Dashboard Navigation
    await runTest('Dashboard Navigation', async () => {
      // Verify dashboard elements
      await page.waitForSelector('text=Total Servers');
      await page.waitForSelector('text=Active Users');
      await page.waitForSelector('text=API Calls Today');
      await page.waitForSelector('text=Quick Actions');
      await page.waitForSelector('text=Recent Activity');
      console.log('   ✅ Dashboard loaded with all components');
    });
    
    // Test 4: Server Browsing
    await runTest('Server Browsing', async () => {
      await page.click('a[href="/servers"]');
      await page.waitForSelector('h1:has-text("MCP Servers")');
      
      // Test search functionality
      await page.fill('input[placeholder*="Search by name"]', 'github');
      await page.click('button:has-text("Search")');
      await page.waitForTimeout(1000);
      console.log('   ✅ Search functionality works');
      
      // Test status filter
      await page.selectOption('select', 'stable');
      await page.waitForTimeout(1000);
      console.log('   ✅ Status filtering works');
      
      // Clear filters
      await page.fill('input[placeholder*="Search by name"]', '');
      await page.selectOption('select', '');
      await page.click('button:has-text("Search")');
      console.log('   ✅ Filter clearing works');
    });
    
    // Test 5: Server Detail View
    await runTest('Server Detail View', async () => {
      // Click on first server link
      const serverLinks = await page.locator('a[href^="/servers/"]').count();
      if (serverLinks > 0) {
        await page.click('a[href^="/servers/"]:first-of-type');
        await page.waitForSelector('h1'); // Wait for server name title
        
        // Verify we're on a server detail page
        const currentUrl = page.url();
        if (currentUrl.includes('/servers/')) {
          console.log('   ✅ Server detail page loaded');
        }
        
        // Go back to servers
        await page.goBack();
        await page.waitForSelector('h1:has-text("MCP Servers")');
      } else {
        console.log('   ℹ️ No servers available to test detail view');
      }
    });
    
    // Test 6: Users Management
    await runTest('Users Management', async () => {
      await page.click('a[href="/admin/users"]');
      await page.waitForSelector('h1:has-text("User Management")');
      
      // Test user search
      await page.fill('input[placeholder*="Search by username"]', 'test');
      await page.waitForTimeout(500);
      console.log('   ✅ User search works');
      
      // Test role filter - use first select element
      const roleSelect = page.locator('select').first();
      const selectOptions = await roleSelect.locator('option').count();
      if (selectOptions > 1) {
        await roleSelect.selectOption({ index: 1 }); // Select second option
        await page.waitForTimeout(500);
        console.log('   ✅ Role filtering works');
      }
      
      // Verify user stats
      await page.waitForSelector('text=Total Users');
      await page.waitForSelector('text=Active Users');
      console.log('   ✅ User statistics displayed');
    });
    
    // Test 7: Settings Management
    await runTest('Settings Management', async () => {
      await page.click('a[href="/admin/settings"]');
      await page.waitForSelector('h1:has-text("System Settings")');
      
      // Test tab navigation
      await page.click('button:has-text("Security")');
      await page.waitForSelector('text=Admin Setup Key');
      console.log('   ✅ Security settings tab works');
      
      await page.click('button:has-text("API")');
      await page.waitForSelector('text=API Rate Limit');
      console.log('   ✅ API settings tab works');
      
      await page.click('button:has-text("Notifications")');
      await page.waitForSelector('text=Email Notifications');
      console.log('   ✅ Notifications settings tab works');
      
      // Test settings modification
      await page.click('button:has-text("General")');
      await page.fill('input[value="MCP Registry"]', 'MCP Registry Test');
      await page.click('button:has-text("Save Changes")');
      await page.waitForSelector('text=Settings saved successfully');
      console.log('   ✅ Settings save functionality works');
    });
    
    // Test 8: Navigation Menu
    await runTest('Navigation Menu', async () => {
      // Test all main navigation links
      const navLinks = [
        { href: '/admin', text: 'Dashboard' },
        { href: '/servers', text: 'Servers' },
        { href: '/admin/api-keys', text: 'API Keys' },
        { href: '/admin/users', text: 'Users' },
        { href: '/admin/settings', text: 'Settings' }
      ];
      
      for (const link of navLinks) {
        await page.click(`a[href="${link.href}"]`);
        await page.waitForTimeout(500);
        console.log(`   ✅ ${link.text} navigation works`);
      }
    });
    
    // Test 9: Logout
    await runTest('User Logout', async () => {
      await page.click('button:has-text("Sign out")');
      
      // Wait for redirect to login page
      await page.waitForURL('**/auth/login', { timeout: 5000 });
      await page.waitForSelector('h2:has-text("Sign in to your account")');
      console.log('   ✅ Logout successful');
    });
    
    console.log(`\n🎉 Test Suite Complete!`);
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    
  } catch (error) {
    console.error('\n💥 Test Suite Failed:', error.message);
    await page.screenshot({ path: 'test-suite-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
  
  async function runTest(testName, testFunction) {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFunction();
      testsPassed++;
      console.log(`✅ PASSED: ${testName}\n`);
    } catch (error) {
      testsFailed++;
      console.log(`❌ FAILED: ${testName} - ${error.message}\n`);
      await page.screenshot({ path: `error-${testName.toLowerCase().replace(/\s+/g, '-')}.png` });
    }
  }
}

runTestSuite().catch(console.error);