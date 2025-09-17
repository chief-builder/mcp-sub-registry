const { chromium } = require('playwright');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'test@test.com',
  password: 'Password123!'
};

async function runSearchTests() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 400
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔍 Starting Search & Filter Tests\n');
  
  try {
    // Login first
    console.log('🔐 Logging in...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('h1:has-text("Admin Dashboard")');
    
    // Navigate to servers
    await page.click('a[href="/servers"]');
    await page.waitForSelector('h1:has-text("MCP Servers")');
    
    // Test 1: Search by server name
    console.log('\n📝 Test 1: Search by server name');
    await page.fill('input[placeholder*="Search by name"]', 'github');
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(1000);
    
    const githubResults = await page.locator('text=github').count();
    console.log(`   Found ${githubResults} results for "github"`);
    
    // Test 2: Search by description
    console.log('\n📝 Test 2: Search by description keywords');
    await page.fill('input[placeholder*="Search by name"]', 'confluence');
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(1000);
    
    const confluenceResults = await page.locator('text=Confluence').count();
    console.log(`   Found ${confluenceResults} results for "confluence"`);
    
    // Test 3: Filter by status - Stable
    console.log('\n📝 Test 3: Filter by Stable status');
    await page.fill('input[placeholder*="Search by name"]', '');
    await page.selectOption('select', 'stable');
    await page.waitForTimeout(1000);
    
    const stableCount = await page.locator('.bg-green-100').count();
    console.log(`   Found ${stableCount} stable servers`);
    
    // Test 4: Filter by status - Beta
    console.log('\n📝 Test 4: Filter by Beta status');
    await page.selectOption('select', 'beta');
    await page.waitForTimeout(1000);
    
    const betaCount = await page.locator('.bg-blue-100').count();
    console.log(`   Found ${betaCount} beta servers`);
    
    // Test 5: Filter by status - Experimental
    console.log('\n📝 Test 5: Filter by Experimental status');
    await page.selectOption('select', 'experimental');
    await page.waitForTimeout(1000);
    
    const experimentalCount = await page.locator('.bg-yellow-100').count();
    console.log(`   Found ${experimentalCount} experimental servers`);
    
    // Test 6: Combined search and filter
    console.log('\n📝 Test 6: Combined search and filter');
    await page.fill('input[placeholder*="Search by name"]', 'mcp');
    await page.selectOption('select', 'stable');
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(1000);
    
    const combinedResults = await page.locator('a[href^="/servers/"]').count();
    console.log(`   Found ${combinedResults} results for "mcp" + stable status`);
    
    // Test 7: Clear all filters
    console.log('\n📝 Test 7: Clear all filters');
    await page.fill('input[placeholder*="Search by name"]', '');
    await page.selectOption('select', '');
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(1000);
    
    const allResults = await page.locator('a[href^="/servers/"]').count();
    console.log(`   Total servers after clearing filters: ${allResults}`);
    
    // Test 8: Empty search results
    console.log('\n📝 Test 8: Search with no results');
    await page.fill('input[placeholder*="Search by name"]', 'nonexistentserver123');
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(1000);
    
    const noResultsText = await page.locator('text=No servers found matching your criteria').count();
    if (noResultsText > 0) {
      console.log('   ✅ "No results" message displayed correctly');
    }
    
    
    // Take final screenshot
    await page.screenshot({ path: 'search-tests-final.png', fullPage: true });
    console.log('\n📸 Final screenshot saved: search-tests-final.png');
    
    console.log('\n🎉 All search tests completed!');
    
  } catch (error) {
    console.error('\n❌ Search tests failed:', error.message);
    await page.screenshot({ path: 'search-tests-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

runSearchTests().catch(console.error);