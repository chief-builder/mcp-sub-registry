# Playwright Test Suite Documentation

This directory contains a comprehensive Playwright test suite for the MCP Sub-Registry application. The tests are organized into specialized files, each focusing on different aspects of the application.

## Test Files Overview

### 1. Core Functionality Tests

#### `playwright-publish-test.js`
- **Purpose**: Tests the multi-step server publishing flow
- **Coverage**: Login → Dashboard → Servers → Publish form → Verification
- **Key Features**: 
  - Multi-step form navigation
  - Form validation
  - Successful server publication
  - Data verification

#### `playwright-test-suite.js`
- **Purpose**: Comprehensive test suite covering all major functionality
- **Coverage**: 9 test scenarios including:
  - User registration and login
  - Dashboard navigation
  - Server browsing and detail views
  - User management
  - Settings management
  - Navigation menu testing
  - Logout functionality

### 2. Specialized Feature Tests

#### `playwright-search-test.js`
- **Purpose**: Dedicated search and filter functionality tests
- **Coverage**: 9 search scenarios:
  - Search by server name
  - Search by description keywords
  - Filter by status (Stable, Beta, Experimental)
  - Combined search and filter
  - Clear filters
  - Empty search results handling
  - Pagination testing

#### `playwright-apikey-test.js`
- **Purpose**: API key management functionality
- **Coverage**: 11 test scenarios:
  - View API keys page
  - Create new API key
  - Copy API key to clipboard
  - Search API keys
  - Filter by status (active/disabled)
  - View API key details
  - Disable/enable API keys
  - Delete API keys
  - Filter management

### 3. Advanced Testing

#### `playwright-error-handling-test.js`
- **Purpose**: Error handling and edge case validation
- **Coverage**: 10 test scenarios:
  - Invalid login credentials
  - Empty form submissions
  - Email format validation
  - Password strength validation
  - Required field validation
  - URL format validation
  - Network disconnection handling
  - 404 page handling
  - Unauthorized access attempts
  - Session expiration handling

#### `playwright-settings-test.js`
- **Purpose**: System settings management
- **Coverage**: 14 test scenarios across 4 settings tabs:
  - **General Settings**: Name, description, URL modifications
  - **Security Settings**: Admin key, JWT, session timeout
  - **API Settings**: Rate limits, documentation toggle
  - **Notifications**: Email settings, SMTP configuration
  - Settings validation, reset, export/import (if available)

#### `playwright-user-management-test.js`
- **Purpose**: User administration functionality
- **Coverage**: 18 test scenarios:
  - User creation, editing, deletion
  - Role management (admin/user)
  - Account status (enable/disable)
  - Password reset functionality
  - User search and filtering
  - Bulk operations (if available)
  - Activity tracking (if available)

## Test Configuration

### Common Settings
```javascript
const BASE_URL = 'http://localhost:5173';
const TEST_USER = {
  email: 'test@test.com',
  password: 'Password123!'
};
```

### Browser Configuration
- **Mode**: Non-headless (visible browser) for debugging
- **Slow Motion**: 300-500ms delays for better visibility
- **Screenshots**: Automatic error screenshots and final results
- **Timeouts**: 5-second timeouts for critical elements

## Running the Tests

### Prerequisites
1. Start the MCP Registry application:
   ```bash
   cd packages/ui
   npm run dev
   ```

2. Ensure the backend API is running:
   ```bash
   cd packages/api
   npm run dev
   ```

3. Install Playwright:
   ```bash
   npm install playwright
   ```

### Individual Test Execution
```bash
# Run specific test suites
node playwright-publish-test.js
node playwright-test-suite.js
node playwright-search-test.js
node playwright-apikey-test.js
node playwright-error-handling-test.js
node playwright-settings-test.js
node playwright-user-management-test.js
```

### Batch Testing
Run multiple test files in sequence:
```bash
# Core functionality
node playwright-test-suite.js && node playwright-publish-test.js

# Feature-specific tests
node playwright-search-test.js && node playwright-apikey-test.js

# Advanced testing
node playwright-error-handling-test.js && node playwright-settings-test.js
```

## Test Output

### Console Output
- **Real-time progress**: Each test step is logged with emoji indicators
- **Results summary**: Pass/fail counts and completion status
- **Error details**: Specific error messages and stack traces

### Screenshots
- **Success screenshots**: `[test-name]-final.png`
- **Error screenshots**: `[test-name]-error.png`
- **Individual test failures**: `error-[test-name].png`

## Test Data Management

### User Accounts
- Tests use predefined test accounts
- New user creation is tested and cleaned up
- Password reset functionality is validated

### Server Data
- Tests use existing demo server data
- New server publications are tested
- Search functionality validates against known data

### API Keys
- API key creation and management is fully tested
- Keys are properly cleaned up after tests
- Permission levels are validated

## Best Practices

### Test Isolation
- Each test file is independent
- Tests clean up after themselves
- No cross-test dependencies

### Error Handling
- Comprehensive error screenshots
- Graceful failure handling
- Detailed error logging

### Maintenance
- Update test data as the application evolves
- Adjust selectors if UI changes
- Monitor for new features requiring test coverage

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 5173/5174 are available
2. **Authentication Failures**: Verify test user credentials exist
3. **Timing Issues**: Increase `slowMo` values if tests run too fast
4. **Element Not Found**: Check if UI selectors have changed

### Debug Mode
Enable additional debugging:
```javascript
const browser = await chromium.launch({ 
  headless: false,
  slowMo: 1000,      // Slower execution
  devtools: true     // Open DevTools
});
```

## Coverage Report

The complete test suite provides approximately **85+ test scenarios** covering:
- ✅ User Authentication (Registration, Login, Logout)
- ✅ Server Management (Browse, Search, Filter, Publish, Details)
- ✅ API Key Management (Create, View, Edit, Delete, Status)
- ✅ User Administration (CRUD operations, Roles, Status)
- ✅ System Settings (All tabs and configurations)
- ✅ Error Handling (Validation, Network, Authorization)
- ✅ Navigation and UI Components
- ✅ Form Validations and Edge Cases

This comprehensive suite ensures the MCP Sub-Registry application is thoroughly tested across all major functionality areas.