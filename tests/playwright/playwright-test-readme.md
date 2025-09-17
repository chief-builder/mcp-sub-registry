# Playwright Test for MCP Registry Server Publishing

This Playwright test script automates the complete flow of publishing a server to the MCP Registry.

## Prerequisites

1. Install Playwright:
```bash
npm install -D playwright
# or
npm install -D @playwright/test playwright
```

2. Install Playwright browsers (if not already installed):
```bash
npx playwright install chromium
```

## Running the Test

1. Make sure the MCP Registry is running:
```bash
# In the project root
npm run dev
```

2. Make sure you have a test user created with:
   - Email: `test@example.com`
   - Password: `password123`
   
   Or update the `TEST_USER` object in `playwright-publish-test.js` with your credentials.

3. Run the test:
```bash
node playwright-publish-test.js
```

## What the Test Does

The test automates the following steps:

1. **Login** - Logs into the application with test credentials
2. **Navigate to Servers** - Goes to the servers listing page
3. **Start Publish Flow** - Clicks the "Publish Server" button
4. **Fill Basic Info** - Server name, version, description, and status
5. **Fill Repository Info** - Git repository details (optional)
6. **Fill Package Info** - NPM package information (optional)
7. **Fill Remote Config** - HTTPS remote connection details (optional)
8. **Review** - Reviews all entered information
9. **Publish** - Publishes the server
10. **Verify** - Confirms successful publication

## Configuration

You can modify the test data in the `TEST_SERVER` object:

```javascript
const TEST_SERVER = {
  name: 'com.test.playwright-server',
  version: '1.0.0',
  description: 'Your description',
  // ... etc
};
```

## Options

- **Headless Mode**: Change `headless: false` to `headless: true` to run without UI
- **Speed**: Adjust `slowMo: 500` to make the test run faster or slower
- **Screenshots**: The test saves screenshots at key points

## Debugging

To debug the test interactively:

1. Uncomment the `await page.pause();` line near the end
2. Run the test
3. Use the Playwright Inspector to step through

## Expected Output

```
🚀 Starting MCP Registry Publish Server Test

📍 Step 1: Navigating to login page...
🔐 Step 2: Logging in...
✅ Successfully logged in!

📋 Step 3: Navigating to Servers page...
➕ Step 4: Starting server publish flow...

📝 Step 5: Filling Basic Info...
🔗 Step 6: Filling Repository Info...
📦 Step 7: Filling Package Info...
🌐 Step 8: Filling Remote Config...

👀 Step 9: Reviewing configuration...
📸 Screenshot saved: review-page.png

🚀 Step 10: Publishing server...
✅ Server published successfully!
📸 Screenshot saved: published-server.png

🎉 Test completed successfully!
```