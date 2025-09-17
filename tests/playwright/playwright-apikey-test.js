const { chromium } = require('playwright');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'test@test.com',
  password: 'Password123!'
};

async function runApiKeyTests() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 400
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔑 Starting API Key Management Tests\n');
  
  try {
    // Login first
    console.log('🔐 Logging in...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('h1:has-text("Admin Dashboard")');
    
    // Navigate to API Keys
    await page.click('a[href="/admin/api-keys"]');
    await page.waitForSelector('h1:has-text("API Keys")');
    
    // Test 1: View API Keys page
    console.log('\n📝 Test 1: View API Keys page');
    await page.waitForSelector('text=Your API Keys');
    await page.waitForSelector('text=Create New Key');
    await page.waitForSelector('text=No API keys created yet.');
    console.log('   ✅ API Keys page loaded with all components');
    
    // Test 2: Create new API key
    console.log('\n📝 Test 2: Create new API key');
    await page.click('button:has-text("Create New Key")');
    await page.waitForSelector('h2:has-text("Create New API Key")');
    
    // Fill in API key details
    await page.fill('input[placeholder="My Integration Key"]', 'Test API Key');
    await page.fill('textarea[placeholder*="Brief description"]', 'Testing API key functionality');
    await page.click('button:has-text("Create Key")');
    
    // Wait for success message and key display
    await page.waitForSelector('text=API Key Created Successfully!');
    console.log('   ✅ API key created successfully');
    
    // Test 3: Copy API key
    console.log('\n📝 Test 3: Copy API key to clipboard');
    const copyButton = page.locator('button:has-text("Copy")').first();
    await copyButton.click();
    console.log('   ✅ API key copy button clicked');
    
    // Acknowledge saving the key
    await page.click('button:has-text("I\'ve saved this key safely")');
    console.log('   ✅ Key acknowledgment completed');
    
    // Test 4: Verify API key appears in list
    console.log('\n📝 Test 4: Verify API key in list');
    await page.waitForSelector('text=Test API Key');
    const keyCard = await page.locator('text=Test API Key').count();
    if (keyCard > 0) {
      console.log('   ✅ API key appears in the list');
    }
    
    // Test 5: Verify key information display
    console.log('\n📝 Test 5: Verify key information');
    await page.waitForSelector('text=Testing API key functionality');
    await page.waitForSelector('text=Created:');
    await page.waitForSelector('text=Last Used: Never');
    console.log('   ✅ API key information displayed correctly');
    
    // Test 6: Delete API key
    console.log('\n📝 Test 6: Delete API key');
    await page.click('button:has-text("Delete"):first-of-type');
    
    // Handle the confirmation dialog
    page.on('dialog', async dialog => {
      console.log('   Confirmation dialog:', dialog.message());
      await dialog.accept();
    });
    
    // Wait a moment for the deletion to process
    await page.waitForTimeout(2000);
    console.log('   ✅ API key deletion initiated');
    
    // Test 7: Verify empty state returns
    console.log('\n📝 Test 7: Verify return to empty state');
    const emptyStateText = await page.locator('text=No API keys created yet.').count();
    if (emptyStateText > 0) {
      console.log('   ✅ Empty state displayed after deletion');
    } else {
      console.log('   ⚠️ Checking if key still exists...');
      const remainingKeys = await page.locator('text=Test API Key').count();
      console.log(`   Found ${remainingKeys} remaining keys`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'apikey-tests-final.png', fullPage: true });
    console.log('\n📸 Final screenshot saved: apikey-tests-final.png');
    
    console.log('\n🎉 All API key tests completed!');
    
  } catch (error) {
    console.error('\n❌ API key tests failed:', error.message);
    await page.screenshot({ path: 'apikey-tests-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

runApiKeyTests().catch(console.error);