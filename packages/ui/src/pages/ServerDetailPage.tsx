// React import removed - JSX transform handles it
import { useParams, Link } from 'react-router-dom';
import { useServer, useServerVersions } from '../services/api/hooks/useServers';
import { formatDateTime } from '../utils/date';
import type { MCPServer } from '../services/api/models';
import { OFFICIAL_META_KEY } from '../services/api/models';

// Only http(s) URLs are safe to render as a clickable link. Anything else
// (e.g. a stored javascript: URL) is returned as null so we render plain text.
function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

function statusClasses(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'deprecated': return 'bg-yellow-100 text-yellow-800';
    case 'deleted': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function ServerDetailPage() {
  const { serverName } = useParams<{ serverName: string }>();
  // The route param is URL-encoded (the name contains a slash).
  const name = serverName ? decodeURIComponent(serverName) : '';
  const { data: server, isLoading, error } = useServer(name);
  const { data: versionsResp } = useServerVersions(name);

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <Link to="/servers" className="btn-secondary">← Back to Servers</Link>
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
          <Link to="/servers" className="btn-secondary">← Back to Servers</Link>
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

  const official = server._meta?.[OFFICIAL_META_KEY];
  const status = official?.status ?? 'active';
  const versions = versionsResp?.servers ?? [];

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/servers" className="btn-secondary">← Back to Servers</Link>
        <h1 className="text-2xl font-bold text-gray-900">{server.title || server.name}</h1>
        <span className={`px-3 py-1 rounded-full text-sm ${statusClasses(status)}`}>{status}</span>
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
                  <dd className="text-sm text-gray-900 mt-1 font-mono">{server.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Version</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {server.version}
                    {official?.isLatest && <span className="ml-2 text-xs text-green-700">(latest)</span>}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {status}
                    {official?.statusMessage && <span className="text-gray-500"> — {official.statusMessage}</span>}
                  </dd>
                </div>
                {server.websiteUrl && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {safeHttpUrl(server.websiteUrl) ? (
                        <a href={safeHttpUrl(server.websiteUrl)!} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
                          {server.websiteUrl}
                        </a>
                      ) : (<span>{server.websiteUrl}</span>)}
                    </dd>
                  </div>
                )}
                {official?.publishedAt && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Published</dt>
                    <dd className="text-sm text-gray-900 mt-1">{formatDateTime(official.publishedAt)}</dd>
                  </div>
                )}
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

          {server.repository && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Repository</h2>
              </div>
              <div className="card-body">
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Source</dt>
                    <dd className="text-sm text-gray-900">{server.repository.source}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">URL</dt>
                    <dd className="text-sm text-gray-900">
                      {safeHttpUrl(server.repository.url) ? (
                        <a href={safeHttpUrl(server.repository.url)!} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
                          {server.repository.url}
                        </a>
                      ) : (<span>{server.repository.url}</span>)}
                    </dd>
                  </div>
                  {server.repository.subfolder && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Subfolder</dt>
                      <dd className="text-sm text-gray-900">{server.repository.subfolder}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {server.remotes && server.remotes.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Remotes</h2>
              </div>
              <div className="card-body space-y-3">
                {server.remotes.map((remote, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="font-medium text-sm">{remote.type}</div>
                    <div className="text-sm text-gray-600 break-all">
                      {safeHttpUrl(remote.url) ? (
                        <a href={safeHttpUrl(remote.url)!} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700">
                          {remote.url}
                        </a>
                      ) : (<span>{remote.url}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {server.packages && server.packages.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Packages</h2>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {server.packages.map((pkg, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="font-medium text-sm">{pkg.registryType}</div>
                      <div className="text-sm text-gray-600 break-all">{pkg.identifier}@{pkg.version}</div>
                      <div className="text-xs text-gray-400 mt-1">transport: {pkg.transport?.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {versions.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold">Versions</h2>
              </div>
              <div className="card-body">
                <ul className="space-y-1 text-sm">
                  {versions.map((v: MCPServer) => {
                    const m = v._meta?.[OFFICIAL_META_KEY];
                    return (
                      <li key={v.version} className="flex justify-between">
                        <span className="text-gray-900">{v.version}</span>
                        <span className="text-gray-500">
                          {m?.isLatest ? 'latest' : m?.status}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
