// React import removed - JSX transform handles it
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  ServerIcon,
  KeyIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/hooks/useAuthStore';

const publicNavigation = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Servers', href: '/servers', icon: ServerIcon },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Publish Server', href: '/admin/servers/publish', icon: PlusCircleIcon },
  { name: 'API Keys', href: '/admin/api-keys', icon: KeyIcon },
  { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export function Sidebar() {
  const { isAuthenticated, user } = useAuthStore();

  const isAdmin = (user as any)?.roles?.includes('admin');
  const isPublisher = (user as any)?.roles?.includes('publisher') || isAdmin;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Public Navigation */}
        <div className="space-y-1">
          {publicNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                isActive ? 'nav-link-active' : 'nav-link-inactive'
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Admin Navigation */}
        {isAuthenticated && (isPublisher || isAdmin) && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Administration
            </h3>
            <div className="space-y-1">
              {adminNavigation
                .filter((item) => {
                  // Filter items based on user role
                  if (item.href.includes('/admin/users') && !isAdmin) return false;
                  if (item.href.includes('/admin/settings') && !isAdmin) return false;
                  return true;
                })
                .map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      isActive ? 'nav-link-active' : 'nav-link-inactive'
                    }
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </NavLink>
                ))}
            </div>
          </div>
        )}

        {/* Status indicator */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Registry Online</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            API v2025-07-09 • UI v1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
}