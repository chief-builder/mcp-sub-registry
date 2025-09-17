// React import removed - JSX transform handles it
import { useState } from 'react';
import { 
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  ServerIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'MCP Registry',
    siteDescription: 'Enterprise Server Discovery',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    
    // Security Settings
    adminSetupKey: 'development-admin-key-change-in-production',
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    
    // API Settings
    apiRateLimit: 1000,
    apiTimeout: 30,
    maxPageSize: 100,
    defaultPageSize: 20,
    corsEnabled: true,
    
    // Notification Settings
    emailNotifications: true,
    adminNotificationEmail: 'admin@company.com',
    notifyOnServerPublish: true,
    notifyOnUserRegistration: true,
    notifyOnApiKeyCreation: false,
    
    // Server Settings
    autoApproveServers: false,
    requireServerReview: true,
    maxServerNameLength: 255,
    maxDescriptionLength: 1000,
    allowedServerStatuses: ['experimental', 'beta', 'stable', 'deprecated'],
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // API call would go here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'api', name: 'API', icon: ServerIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'servers', name: 'Servers', icon: DocumentTextIcon },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="form-label">Site Name</label>
        <input
          type="text"
          className="form-input"
          value={settings.siteName}
          onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
        />
        <p className="form-help">The name displayed throughout the application</p>
      </div>

      <div>
        <label className="form-label">Site Description</label>
        <input
          type="text"
          className="form-input"
          value={settings.siteDescription}
          onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
        />
        <p className="form-help">Brief description shown on the home page</p>
      </div>

      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
        </label>
        {settings.maintenanceMode && (
          <div className="ml-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
              When enabled, only administrators can access the site
            </p>
          </div>
        )}

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.allowRegistration}
            onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Allow User Registration</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.requireEmailVerification}
            onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Require Email Verification</span>
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="form-label">Admin Setup Key</label>
        <input
          type="password"
          className="form-input font-mono"
          value={settings.adminSetupKey}
          onChange={(e) => setSettings({ ...settings, adminSetupKey: e.target.value })}
        />
        <p className="form-help">Required for creating admin accounts</p>
      </div>

      <div>
        <label className="form-label">Session Timeout (hours)</label>
        <input
          type="number"
          className="form-input"
          value={settings.sessionTimeout}
          onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
          min="1"
          max="720"
        />
        <p className="form-help">How long users stay logged in</p>
      </div>

      <div>
        <label className="form-label">Max Login Attempts</label>
        <input
          type="number"
          className="form-input"
          value={settings.maxLoginAttempts}
          onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
          min="1"
          max="20"
        />
        <p className="form-help">Before temporary account lockout</p>
      </div>

      <div>
        <label className="form-label">Minimum Password Length</label>
        <input
          type="number"
          className="form-input"
          value={settings.passwordMinLength}
          onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
          min="6"
          max="32"
        />
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={settings.requireStrongPassword}
          onChange={(e) => setSettings({ ...settings, requireStrongPassword: e.target.checked })}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
        />
        <span className="text-sm font-medium text-gray-700">
          Require Strong Passwords (uppercase, lowercase, numbers, symbols)
        </span>
      </label>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="form-label">API Rate Limit (requests/hour)</label>
        <input
          type="number"
          className="form-input"
          value={settings.apiRateLimit}
          onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) })}
          min="10"
          max="10000"
        />
        <p className="form-help">Per API key or authenticated user</p>
      </div>

      <div>
        <label className="form-label">API Timeout (seconds)</label>
        <input
          type="number"
          className="form-input"
          value={settings.apiTimeout}
          onChange={(e) => setSettings({ ...settings, apiTimeout: parseInt(e.target.value) })}
          min="5"
          max="300"
        />
      </div>

      <div>
        <label className="form-label">Max Page Size</label>
        <input
          type="number"
          className="form-input"
          value={settings.maxPageSize}
          onChange={(e) => setSettings({ ...settings, maxPageSize: parseInt(e.target.value) })}
          min="10"
          max="1000"
        />
        <p className="form-help">Maximum items returned per API request</p>
      </div>

      <div>
        <label className="form-label">Default Page Size</label>
        <input
          type="number"
          className="form-input"
          value={settings.defaultPageSize}
          onChange={(e) => setSettings({ ...settings, defaultPageSize: parseInt(e.target.value) })}
          min="10"
          max={settings.maxPageSize}
        />
      </div>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={settings.corsEnabled}
          onChange={(e) => setSettings({ ...settings, corsEnabled: e.target.checked })}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
        />
        <span className="text-sm font-medium text-gray-700">Enable CORS</span>
      </label>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={settings.emailNotifications}
          onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
        />
        <span className="text-sm font-medium text-gray-700">Enable Email Notifications</span>
      </label>

      {settings.emailNotifications && (
        <>
          <div>
            <label className="form-label">Admin Notification Email</label>
            <input
              type="email"
              className="form-input"
              value={settings.adminNotificationEmail}
              onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
            />
            <p className="form-help">Where to send system notifications</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Send notifications for:</h3>
            
            <label className="flex items-center ml-4">
              <input
                type="checkbox"
                checked={settings.notifyOnServerPublish}
                onChange={(e) => setSettings({ ...settings, notifyOnServerPublish: e.target.checked })}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
              />
              <span className="text-sm text-gray-600">New server published</span>
            </label>

            <label className="flex items-center ml-4">
              <input
                type="checkbox"
                checked={settings.notifyOnUserRegistration}
                onChange={(e) => setSettings({ ...settings, notifyOnUserRegistration: e.target.checked })}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
              />
              <span className="text-sm text-gray-600">New user registration</span>
            </label>

            <label className="flex items-center ml-4">
              <input
                type="checkbox"
                checked={settings.notifyOnApiKeyCreation}
                onChange={(e) => setSettings({ ...settings, notifyOnApiKeyCreation: e.target.checked })}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
              />
              <span className="text-sm text-gray-600">API key created</span>
            </label>
          </div>
        </>
      )}
    </div>
  );

  const renderServerSettings = () => (
    <div className="space-y-6">
      <label className="flex items-center">
        <input
          type="checkbox"
          checked={settings.autoApproveServers}
          onChange={(e) => setSettings({ ...settings, autoApproveServers: e.target.checked })}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
        />
        <span className="text-sm font-medium text-gray-700">Auto-approve New Servers</span>
      </label>

      <label className="flex items-center">
        <input
          type="checkbox"
          checked={settings.requireServerReview}
          onChange={(e) => setSettings({ ...settings, requireServerReview: e.target.checked })}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
        />
        <span className="text-sm font-medium text-gray-700">Require Admin Review for Publishing</span>
      </label>

      <div>
        <label className="form-label">Max Server Name Length</label>
        <input
          type="number"
          className="form-input"
          value={settings.maxServerNameLength}
          onChange={(e) => setSettings({ ...settings, maxServerNameLength: parseInt(e.target.value) })}
          min="50"
          max="500"
        />
      </div>

      <div>
        <label className="form-label">Max Description Length</label>
        <input
          type="number"
          className="form-input"
          value={settings.maxDescriptionLength}
          onChange={(e) => setSettings({ ...settings, maxDescriptionLength: parseInt(e.target.value) })}
          min="100"
          max="5000"
        />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Allowed Server Statuses</h3>
        <div className="space-y-2">
          {['experimental', 'beta', 'stable', 'deprecated', 'archived'].map((status) => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.allowedServerStatuses.includes(status)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSettings({
                      ...settings,
                      allowedServerStatuses: [...settings.allowedServerStatuses, status]
                    });
                  } else {
                    setSettings({
                      ...settings,
                      allowedServerStatuses: settings.allowedServerStatuses.filter(s => s !== status)
                    });
                  }
                }}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 mr-2"
              />
              <span className="text-sm text-gray-600 capitalize">{status}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-50 border-brand-500 text-brand-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">
                {tabs.find(t => t.id === activeTab)?.name} Settings
              </h2>
            </div>
            <div className="card-body">
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'security' && renderSecuritySettings()}
              {activeTab === 'api' && renderApiSettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'servers' && renderServerSettings()}
            </div>
            <div className="card-footer bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  {saved && (
                    <p className="text-sm text-green-600 flex items-center">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Settings saved successfully
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button className="btn-secondary">Reset</button>
                  <button onClick={handleSave} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}