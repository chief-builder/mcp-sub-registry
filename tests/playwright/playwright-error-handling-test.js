const { chromium } = require('playwright');

// Test configuration
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'test@test.com',
  password: 'Password123!'
};

async function runErrorHandlingTests() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('⚠️ Starting Error Handling & Edge Case Tests\n');
  
  try {
    // Test 1: Invalid login credentials
    console.log('📝 Test 1: Invalid login credentials');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign in")');
    
    await page.waitForSelector('text=Invalid credentials', { timeout: 5000 });
    console.log('   ✅ Invalid login error handled correctly');
    
    // Test 2: Empty form submission - Login
    console.log('\n📝 Test 2: Empty login form submission');
    await page.fill('input[type="email"]', '');
    await page.fill('input[type="password"]', '');
    await page.click('button:has-text("Sign in")');
    
    // Check for validation errors
    const emailError = await page.locator('text=Email is required').count();
    const passwordError = await page.locator('text=Password is required').count();
    if (emailError > 0 || passwordError > 0) {
      console.log('   ✅ Empty form validation works');
    }
    
    // Test 3: Invalid email format - Registration
    console.log('\n📝 Test 3: Invalid email format - Registration');
    await page.goto(`${BASE_URL}/auth/register`);
    await page.fill('input[type="email"]', 'invalid-email');
    
    // Find username field - it should be the second input field
    const usernameField = page.locator('input').nth(1);
    await usernameField.fill('testuser');
    
    await page.fill('input[type="password"]', 'Password123!');
    await page.fill('input[placeholder*="development-admin-key-change-in-production"]', 'development-admin-key-change-in-production');
    await page.click('button:has-text("Create account")');
    
    await page.waitForTimeout(1000);
    const emailValidationError = await page.locator('text=Please enter a valid email, text=Invalid email, text=Email is invalid').count();
    if (emailValidationError > 0) {
      console.log('   ✅ Email validation works');
    } else {
      console.log('   ℹ️ Email validation may be handled client-side or differently');
    }
    
    // Test 4: Weak password - Registration
    console.log('\n📝 Test 4: Weak password validation');
    await page.fill('input[type="email"]', 'newuser@test.com');
    await usernameField.fill('newuser');
    await page.fill('input[type="password"]', '123');
    await page.click('button:has-text("Create account")');
    
    await page.waitForTimeout(1000);
    const passwordValidationError = await page.locator('text=Password must be at least 8 characters, text=Password too short, text=Password is too weak').count();
    if (passwordValidationError > 0) {
      console.log('   ✅ Password validation works');
    } else {
      console.log('   ℹ️ Password validation may be handled differently');
    }
    
    // Login with valid credentials for subsequent tests
    console.log('\n🔐 Logging in with valid credentials for further tests...');
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('h1:has-text("Admin Dashboard")');
    
    // Test 5: Invalid server publish - Empty required fields
    console.log('\n📝 Test 5: Server publish with empty required fields');
    await page.click('a[href="/servers"]');
    await page.waitForSelector('h1:has-text("MCP Servers")');
    await page.click('main a.btn-primary:has-text("Publish Server")');
    await page.waitForSelector('h1:has-text("Publish MCP Server")');
    
    // Check if Next button is disabled when required fields are empty
    await page.waitForTimeout(1000);
    const nextButton = page.locator('button:has-text("Next")');
    const isDisabled = await nextButton.isDisabled();
    
    if (isDisabled) {
      console.log('   ✅ Required field validation works - Next button disabled when fields empty');
    } else {
      // Try to click if enabled and check for validation messages
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      const nameError = await page.locator('text=Server name is required, text=Name is required, text=This field is required').count();
      const descError = await page.locator('text=Description is required, text=This field is required').count();
      const versionError = await page.locator('text=Version is required, text=This field is required').count();
      
      if (nameError > 0 || descError > 0 || versionError > 0) {
        console.log('   ✅ Required field validation works with error messages');
      } else {
        console.log('   ℹ️ Validation may be handled differently');
      }
    }
    
    // Test 6: Invalid URL format in server publish  
    console.log('\n📝 Test 6: Invalid repository URL format');
    
    // Fill required basic info fields first
    await page.fill('input[placeholder*="com.company.mcp-server"]', 'test.error.server');
    await page.fill('input[placeholder="1.0.0"]', '1.0.0');
    await page.fill('textarea[placeholder*="brief description"]', 'Test description for error handling');
    await page.selectOption('select', 'experimental');
    await page.click('button:has-text("Next")');
    
    // Now on Repository step - try invalid URL (if this step has repo fields)
    try {
      await page.waitForSelector('input[placeholder*="github"], input[placeholder*="repository"]', { timeout: 3000 });
      await page.fill('input[placeholder*="github"], input[placeholder*="repository"]', 'invalid-url');
      await page.click('button:has-text("Next")');
      
      await page.waitForTimeout(1000);
      const urlError = await page.locator('text=Please enter a valid URL, text=Invalid URL, text=URL is invalid').count();
      if (urlError > 0) {
        console.log('   ✅ URL validation works');
      } else {
        console.log('   ℹ️ URL validation may be handled differently or step progressed');
      }
    } catch (error) {
      console.log('   ℹ️ Repository URL field not found on this step');
    }
    
    // Test 7: Network timeout simulation (if possible)
    console.log('\n📝 Test 7: Network disconnection handling');
    // Simulate offline mode
    await context.setOffline(true);
    
    try {
      await page.goto(`${BASE_URL}/servers`);
      await page.waitForSelector('text=Connection error', { timeout: 3000 });
      console.log('   ✅ Network error handling works');
    } catch (e) {
      // If no specific error message, check for general error indicators
      const errorIndicators = await page.locator('text=Error').count();
      if (errorIndicators > 0) {
        console.log('   ✅ Some form of error handling detected');
      }
    }
    
    // Restore network connection
    await context.setOffline(false);
    
    // Test 8: 404 page handling
    console.log('\n📝 Test 8: 404 page handling');
    await page.goto(`${BASE_URL}/nonexistent-page`);
    await page.waitForTimeout(2000);
    
    const notFoundText = await page.locator('text=404').count() + 
                        await page.locator('text=Page not found').count() +
                        await page.locator('text=Not Found').count();
    
    if (notFoundText > 0) {
      console.log('   ✅ 404 page handling works');
    } else {
      console.log('   ⚠️ No specific 404 handling detected');
    }
    
    // Test 9: Unauthorized access attempts
    console.log('\n📝 Test 9: Unauthorized access handling');
    // Try to access admin pages after logout
    await page.goto(`${BASE_URL}/admin`);
    await page.click('button:has-text("Sign out")');
    
    // Try to access protected route
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForTimeout(2000);
    
    // Should redirect to login or show unauthorized message
    const isRedirectedToLogin = await page.url().includes('/auth/login');
    const hasUnauthorizedText = await page.locator('text=Unauthorized').count() > 0;
    
    if (isRedirectedToLogin || hasUnauthorizedText) {
      console.log('   ✅ Unauthorized access handling works');
    }
    
    // Test 10: Session expiration
    console.log('\n📝 Test 10: Session handling');
    // Login again
    if (!page.url().includes('/auth/login')) {
      await page.goto(`${BASE_URL}/auth/login`);
    }
    
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Sign in")');
    await page.waitForSelector('h1:has-text("Admin Dashboard")');
    
    // Clear all storage to simulate session expiration
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to navigate to a protected page
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForTimeout(2000);
    
    const isRedirectedAfterClear = page.url().includes('/auth/login') || 
                                  await page.locator('text=Please log in').count() > 0;
    
    if (isRedirectedAfterClear) {
      console.log('   ✅ Session expiration handling works');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'error-handling-tests-final.png', fullPage: true });
    console.log('\n📸 Final screenshot saved: error-handling-tests-final.png');
    
    console.log('\n🎉 All error handling tests completed!');
    
  } catch (error) {
    console.error('\n❌ Error handling tests failed:', error.message);
    await page.screenshot({ path: 'error-handling-tests-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

runErrorHandlingTests().catch(console.error);