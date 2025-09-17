// React import removed - JSX transform handles it
import { Link } from 'react-router-dom';
import { 
  ServerIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: ServerIcon,
    title: 'Server Discovery',
    description: 'Browse and discover MCP servers across your enterprise with advanced search and filtering.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Enterprise Security',
    description: 'Role-based access control with API keys and comprehensive audit logging.',
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics & Monitoring',
    description: 'Real-time metrics, health checks, and usage analytics for operational visibility.',
  },
  {
    icon: LightBulbIcon,
    title: 'Easy Integration',
    description: 'Simple publishing workflow with rich metadata and version management.',
  },
];

const quickStats = [
  { label: 'Total Servers', value: '24', trend: '+12%' },
  { label: 'Active Users', value: '156', trend: '+8%' },
  { label: 'API Calls Today', value: '2.4K', trend: '+15%' },
  { label: 'Uptime', value: '99.9%', trend: '0%' },
];

export function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Enterprise MCP Registry
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Centralized discovery and governance for Model Context Protocol servers.
          Publish, discover, and manage integrations across your enterprise.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link to="/servers" className="btn-primary btn-lg">
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Browse Servers
          </Link>
          <Link to="/admin/servers/publish" className="btn-outline btn-lg">
            <RocketLaunchIcon className="h-5 w-5 mr-2" />
            Publish Server
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="card-body text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
              <div className="text-xs text-green-600 font-medium">
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features Grid */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Enterprise Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="card">
              <div className="card-body">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-brand-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    New server published: com.github.mcp-server
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <span className="status-stable">Stable</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Server updated: com.atlassian.confluence-mcp
                  </p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
              <span className="status-beta">Beta</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    New API key created for Data Analytics team
                  </p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                API Key
              </span>
            </div>
          </div>
        </div>
        <div className="card-footer">
          <Link to="/admin" className="text-sm text-brand-600 hover:text-brand-700">
            View all activity →
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Getting Started
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Browse Servers</h4>
              <p className="text-sm text-gray-600">
                Discover available MCP servers in your organization
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Get API Key</h4>
              <p className="text-sm text-gray-600">
                Request an API key from your administrator for publishing
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Publish Server</h4>
              <p className="text-sm text-gray-600">
                Register your MCP server for others to discover
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}