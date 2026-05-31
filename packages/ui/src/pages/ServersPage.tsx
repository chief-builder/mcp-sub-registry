import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServers } from '../services/api/hooks/useServers';
import { useAuthStore } from '../hooks/useAuthStore';
import type { MCPServer } from '../services/api/models';
import { OFFICIAL_META_KEY } from '../services/api/models';

function officialStatus(server: MCPServer): string {
  return server._meta?.[OFFICIAL_META_KEY]?.status ?? 'active';
}

function statusClasses(status: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'deprecated': return 'bg-yellow-100 text-yellow-800';
    case 'deleted': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function ServersPage() {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Actual query sent to API
  const [limit] = useState(20);
  // Cursor pagination: `cursor` is the page we're on; `stack` holds prior cursors.
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [stack, setStack] = useState<Array<string | undefined>>([]);
  const { isAuthenticated } = useAuthStore();

  const { data: serversResponse, isLoading, error } = useServers({
    search: searchQuery || undefined,
    limit,
    cursor,
  });

  const servers = serversResponse?.servers || [];
  const totalCount = serversResponse?.metadata?.count || 0;
  const nextCursor = serversResponse?.metadata?.nextCursor;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setCursor(undefined);
    setStack([]);
  };

  const nextPage = () => {
    if (nextCursor) {
      setStack([...stack, cursor]);
      setCursor(nextCursor);
    }
  };

  const prevPage = () => {
    if (stack.length > 0) {
      const prev = stack[stack.length - 1];
      setStack(stack.slice(0, -1));
      setCursor(prev);
    }
  };

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">MCP Servers</h1>
        <div className="card">
          <div className="card-body">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">Failed to load servers. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">MCP Servers</h1>
        {isAuthenticated && (
          <Link to="/servers/publish" className="btn-primary">
            Publish Server
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="form-label">Search servers</label>
              <input
                type="text"
                className="form-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by server name..."
              />
            </div>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
        </div>
      </div>

      {/* Server List */}
      <div className="card">
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading servers...</p>
            </div>
          ) : servers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchQuery ? 'No servers found matching your criteria.' : 'No servers published yet.'}
              </p>
              {!searchQuery && (
                <p className="text-gray-500 mt-2">
                  {isAuthenticated ? 'Click "Publish Server" to add the first one!' : 'Sign in to publish servers.'}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {servers.map((server: MCPServer) => {
                  const status = officialStatus(server);
                  return (
                    <div key={`${server.name}@${server.version}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link
                            to={`/servers/${encodeURIComponent(server.name)}`}
                            className="text-lg font-semibold text-brand-600 hover:text-brand-700"
                          >
                            {server.title || server.name}
                          </Link>
                          {server.title && (
                            <p className="text-xs text-gray-400 font-mono">{server.name}</p>
                          )}
                          <p className="text-gray-600 mt-1">{server.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Version: {server.version}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${statusClasses(status)}`}>
                              {status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cursor pagination */}
              {(nextCursor || stack.length > 0) && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{totalCount} servers total</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={stack.length === 0}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={nextPage}
                      disabled={!nextCursor}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
