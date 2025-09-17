// React import removed - JSX transform handles it
import { Link } from 'react-router-dom';
import { 
  ServerIcon, 
  KeyIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useServers } from '../services/api/hooks/useServers';

export function AdminPage() {
  // Fetch servers to get counts
  const { data: serversData } = useServers({ limit: 1 }); // Just to get total count
  const totalServers = (serversData as any)?.total_count || 0;

  // Mock data for now - these would come from API endpoints
  const stats = {
    totalServers,
    activeUsers: 156,
    apiCalls: '2.4K',
    uptime: '99.9%'
  };

  const recentActivity = [
    { id: 1, type: 'server_published', message: 'New server published: com.test-company.uncompromising-operator', time: '2 hours ago' },
    { id: 2, type: 'user_registered', message: 'New user registered: testuser', time: '3 hours ago' },
    { id: 3, type: 'api_key_created', message: 'API key created by user: admin', time: '5 hours ago' },
  ];

  const quickActions = [
    { title: 'Publish Server', description: 'Add a new MCP server to the registry', link: '/servers/publish', icon: ServerIcon },
    { title: 'Manage Users', description: 'View and manage user accounts', link: '/admin/users', icon: UserGroupIcon },
    { title: 'API Keys', description: 'Manage API keys and access tokens', link: '/admin/api-keys', icon: KeyIcon },
    { title: 'View Analytics', description: 'Detailed usage statistics', link: '/admin/analytics', icon: ChartBarIcon },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Servers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalServers}</p>
                <p className="text-sm text-green-600 mt-1">+12% from last month</p>
              </div>
              <ServerIcon className="h-12 w-12 text-brand-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeUsers}</p>
                <p className="text-sm text-green-600 mt-1">+8% from last week</p>
              </div>
              <UserGroupIcon className="h-12 w-12 text-brand-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Calls Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.apiCalls}</p>
                <p className="text-sm text-green-600 mt-1">+15% from yesterday</p>
              </div>
              <ArrowTrendingUpIcon className="h-12 w-12 text-brand-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.uptime}</p>
                <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
              </div>
              <ClockIcon className="h-12 w-12 text-brand-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  to={action.link}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <action.icon className="h-6 w-6 text-brand-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      activity.type === 'server_published' ? 'bg-green-500' :
                      activity.type === 'user_registered' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link to="/admin/activity" className="text-sm text-brand-600 hover:text-brand-700">
                View all activity →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="text-lg font-semibold">System Health</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600">API Response Time</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">45ms</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Database Load</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">23%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Error Rate</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">0.02%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}