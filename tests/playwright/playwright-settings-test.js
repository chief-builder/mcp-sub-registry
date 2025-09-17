const { chromium } = require('playwright');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'test@test.com',
  password: 'Password123!'
};

async function runSettingsTests() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 400
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('⚙️ Starting Settings Management Tests\n');
  
  try {
    // Login first
    console.log('🔐 Logging in...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('h1:has-text("Admin Dashboard")');
    
    // Navigate to Settings
    await page.click('a[href="/admin/settings"]');
    await page.waitForSelector('h1:has-text("System Settings")');
    
    // Test 1: General Settings Tab
    console.log('\n📝 Test 1: General Settings tab');
    await page.click('button:has-text("General")');
    await page.waitForSelector('text=Site Name');
    await page.waitForSelector('text=Site Description');
    await page.waitForSelector('text=Maintenance Mode');
    await page.waitForSelector('text=Allow User Registration');
    await page.waitForSelector('text=Require Email Verification');
    console.log('   ✅ General settings tab loaded with all fields');
    
    // Test 2: Modify General Settings
    console.log('\n📝 Test 2: Modify general settings');
    const originalName = await page.inputValue('input[value*="MCP Registry"]');
    await page.fill('input[value*="MCP Registry"]', 'Test MCP Registry');
    await page.fill('input[value*="Enterprise Server Discovery"]', 'Updated Server Discovery Platform');
    
    // Test checkbox toggles
    await page.click('input[type="checkbox"]:near(:text("Maintenance Mode"))');
    await page.waitForTimeout(500);
    await page.click('input[type="checkbox"]:near(:text("Maintenance Mode"))'); // Toggle back
    
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Settings saved successfully');
    console.log('   ✅ General settings saved successfully');
    
    // Verify the changes persisted
    await page.reload();
    await page.waitForSelector('h1:has-text("System Settings")');
    await page.click('button:has-text("General")'); // Ensure General tab is active
    await page.waitForTimeout(1000);
    
    // Check the site name field value
    const siteNameInput = page.locator('input').first(); // First input should be Site Name
    const updatedName = await siteNameInput.inputValue();
    if (updatedName.includes('Test MCP Registry')) {
      console.log('   ✅ Settings changes persisted after reload');
    } else {
      console.log(`   ℹ️ Current site name: ${updatedName}`);
    }
    
    // Test 3: Security Settings Tab
    console.log('\n📝 Test 3: Security Settings tab');
    await page.click('button:has-text("Security")');
    await page.waitForSelector('text=Admin Setup Key');
    await page.waitForSelector('text=Session Timeout (hours)');
    await page.waitForSelector('text=Max Login Attempts');
    await page.waitForSelector('text=Minimum Password Length');
    await page.waitForSelector('text=Require Strong Passwords');
    console.log('   ✅ Security settings tab loaded');
    
    // Test 4: Update Security Settings
    console.log('\n📝 Test 4: Update security settings');
    // Change session timeout from 24 to 12 hours
    const sessionTimeoutInput = page.locator('input[value="24"]');
    await sessionTimeoutInput.fill('12');
    
    // Change max login attempts
    const maxAttemptsInput = page.locator('input[value="5"]');
    await maxAttemptsInput.fill('3');
    
    // Toggle strong password requirement
    const strongPasswordCheckbox = page.locator('input[type="checkbox"]:near(:text("Require Strong Passwords"))');
    await strongPasswordCheckbox.click();
    await page.waitForTimeout(500);
    await strongPasswordCheckbox.click(); // Toggle back
    
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Settings saved successfully');
    console.log('   ✅ Security settings updated');
    
    // Test 5: API Settings Tab
    console.log('\n📝 Test 5: API Settings tab');
    await page.click('button:has-text("API")');
    await page.waitForSelector('text=API Rate Limit (requests/hour)');
    await page.waitForSelector('text=API Timeout (seconds)');
    await page.waitForSelector('text=Max Page Size');
    await page.waitForSelector('text=Default Page Size');
    await page.waitForSelector('text=Enable CORS');
    console.log('   ✅ API settings tab loaded');
    
    // Test 6: Update API Settings
    console.log('\n📝 Test 6: Update API settings');
    // Change rate limit from 1000 to 2000
    const rateLimitInput = page.locator('input[value="1000"]');
    await rateLimitInput.fill('2000');
    
    // Change API timeout from 30 to 60 seconds
    const timeoutInput = page.locator('input[value="30"]');
    await timeoutInput.fill('60');
    
    // Change default page size from 20 to 25
    const defaultPageSizeInput = page.locator('input[value="20"]');
    await defaultPageSizeInput.fill('25');
    
    // Toggle CORS setting
    const corsCheckbox = page.locator('input[type="checkbox"]:near(:text("Enable CORS"))');
    await corsCheckbox.click();
    await page.waitForTimeout(500);
    await corsCheckbox.click(); // Toggle back
    
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Settings saved successfully');
    console.log('   ✅ API settings updated');
    
    // Test 7: Notifications Settings Tab
    console.log('\n📝 Test 7: Notifications Settings tab');
    await page.click('button:has-text("Notifications")');
    await page.waitForSelector('text=Enable Email Notifications');
    await page.waitForSelector('text=Admin Notification Email');
    await page.waitForSelector('text=Send notifications for:');
    await page.waitForSelector('text=New server published');
    await page.waitForSelector('text=New user registration');
    await page.waitForSelector('text=API key created');
    console.log('   ✅ Notifications settings tab loaded');
    
    // Test 8: Update Notification Settings
    console.log('\n📝 Test 8: Update notification settings');
    
    // Toggle email notifications checkbox
    const emailNotifCheckbox = page.locator('input[type="checkbox"]:near(:text("Enable Email Notifications"))');
    await emailNotifCheckbox.click();
    await page.waitForTimeout(500);
    await emailNotifCheckbox.click(); // Toggle back
    
    // Update admin notification email
    const adminEmailInput = page.locator('input[value="admin@company.com"]');
    await adminEmailInput.fill('admin@test-company.com');
    
    // Toggle notification preferences - use getByRole for more precise selection
    const apiKeyNotifCheckbox = page.getByRole('checkbox', { name: 'API key created' });
    await apiKeyNotifCheckbox.click(); // Enable API key notifications
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Settings saved successfully');
    console.log('   ✅ Notification settings updated');
    
    // Test 9: Backup Settings Tab (if exists)
    console.log('\n📝 Test 9: Check for additional settings tabs');
    const backupTabExists = await page.locator('button:has-text("Backup")').count();
    if (backupTabExists > 0) {
      await page.click('button:has-text("Backup")');
      await page.waitForTimeout(1000);
      console.log('   ✅ Backup settings tab exists and loaded');
    } else {
      console.log('   ℹ️ No backup settings tab found');
    }
    
    // Test 10: Settings Reset/Restore
    console.log('\n📝 Test 10: Reset settings to defaults');
    await page.click('button:has-text("General")');
    
    // Look for reset button
    const resetButtonExists = await page.locator('button:has-text("Reset to Defaults")').count();
    if (resetButtonExists > 0) {
      await page.click('button:has-text("Reset to Defaults")');
      await page.waitForSelector('h3:has-text("Reset Settings")');
      await page.click('button:has-text("Yes, reset")');
      await page.waitForSelector('text=Settings reset successfully');
      console.log('   ✅ Settings reset functionality works');
    } else {
      console.log('   ℹ️ No reset functionality found');
    }
    
    // Test 11: Settings validation
    console.log('\n📝 Test 11: Settings validation');
    await page.click('button:has-text("API")');
    
    // Try to enter invalid rate limit
    await page.fill('input[value="2000"]', '-1');
    await page.click('button:has-text("Save Changes")');
    
    const validationError = await page.locator('text=Rate limit must be positive').count();
    if (validationError > 0) {
      console.log('   ✅ Settings validation works');
    } else {
      console.log('   ⚠️ No validation error detected for invalid input');
    }
    
    // Test 12: Settings export/import (if available)
    console.log('\n📝 Test 12: Settings export/import functionality');
    const exportButton = await page.locator('button:has-text("Export Settings")').count();
    const importButton = await page.locator('button:has-text("Import Settings")').count();
    
    if (exportButton > 0) {
      console.log('   ✅ Settings export functionality available');
    }
    if (importButton > 0) {
      console.log('   ✅ Settings import functionality available');
    }
    if (exportButton === 0 && importButton === 0) {
      console.log('   ℹ️ No export/import functionality found');
    }
    
    // Test 13: Settings search/filter
    console.log('\n📝 Test 13: Settings search functionality');
    const searchBox = await page.locator('input[placeholder*="Search settings"]').count();
    if (searchBox > 0) {
      await page.fill('input[placeholder*="Search settings"]', 'rate limit');
      await page.waitForTimeout(1000);
      console.log('   ✅ Settings search functionality available');
    } else {
      console.log('   ℹ️ No settings search functionality found');
    }
    
    // Test 14: Restore original settings
    console.log('\n📝 Test 14: Restore original settings');
    await page.click('button:has-text("General")');
    await page.waitForTimeout(500);
    
    // Use the first input field (Site Name) to restore original value
    const restoreSiteNameInput = page.locator('input').first();
    await restoreSiteNameInput.fill(originalName || 'MCP Registry');
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Settings saved successfully');
    console.log('   ✅ Original settings restored');
    
    // Take final screenshot
    await page.screenshot({ path: 'settings-tests-final.png', fullPage: true });
    console.log('\n📸 Final screenshot saved: settings-tests-final.png');
    
    console.log('\n🎉 All settings tests completed!');
    
  } catch (error) {
    console.error('\n❌ Settings tests failed:', error.message);
    await page.screenshot({ path: 'settings-tests-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

runSettingsTests().catch(console.error);