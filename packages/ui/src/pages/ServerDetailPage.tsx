// React import removed - JSX transform handles it
import { useParams, Link } from 'react-router-dom';
import { useServer } from '../services/api/hooks/useServers';
import { formatDateTime } from '../utils/date';

export function ServerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: server, isLoading, error } = useServer(id!);
  

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <Link to="/servers" className="btn-secondary">
            ← Back to Servers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-center py-8 text-gray-600">Loading server details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !server) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <Link to="/servers" className="btn-secondary">
            ← Back to Servers
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Server Not Found</h1>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                Failed to load server details. The server may not exist or you may not have permission to view it.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/servers" className="btn-secondary">
          ← Back to Servers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{server.name}</h1>
        <span className={`px-3 py-1 rounded-full text-sm ${
          server.status === 'stable' ? 'bg-green-100 text-green-800' :
          server.status === 'beta' ? 'bg-blue-100 text-blue-800' :
          server.status === 'experimental' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {server.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Server Information</h2>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900 mt-1">{server.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="text-sm text-gray-900 mt-1">{server.version}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900 mt-1">{server.status}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">Description</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-700">{server.description}</p>
            </div>
          </div>

          {(server as any).repository && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Repository</h2>
              </div>
              <div className="card-body">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="text-sm text-gray-900">{(server as any).repository.type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">URL</dt>
                    <dd className="text-sm text-gray-900">
                      <a href={(server as any).repository.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
                        {(server as any).repository.url}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {(server as any).metadata && Object.keys((server as any).metadata).length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Metadata</h2>
              </div>
              <div className="card-body">
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                  {JSON.stringify((server as any).metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timestamps section removed - dates not available from API */}

          {(server as any).packages && (server as any).packages.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Packages</h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {(server as any).packages.map((pkg: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="font-medium text-sm">{pkg.registry}</div>
                      <div className="text-sm text-gray-600">{pkg.identifier}@{pkg.version}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}