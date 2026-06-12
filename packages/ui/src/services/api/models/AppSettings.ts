/* MCP Registry admin settings (key/value config) */

export type AppSettings = {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
    apiRateLimit: number;
    apiTimeout: number;
    maxPageSize: number;
    defaultPageSize: number;
    corsEnabled: boolean;
    emailNotifications: boolean;
    adminNotificationEmail: string;
    notifyOnServerPublish: boolean;
    notifyOnUserRegistration: boolean;
    notifyOnApiKeyCreation: boolean;
    autoApproveServers: boolean;
    requireServerReview: boolean;
    maxServerNameLength: number;
    maxDescriptionLength: number;
    allowedServerStatuses: string[];
};

export type SettingsResponse = {
    settings: AppSettings;
};
