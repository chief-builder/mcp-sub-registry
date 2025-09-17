import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useServers } from '../services/api/hooks/useServers';
import { useAuthStore } from '../hooks/useAuthStore';
import { formatDate } from '../utils/date';
import type { ServerStatus } from '../services/api/models';

export function ServersPage() {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Actual search query sent to API
  const [status, setStatus] = useState<ServerStatus | ''>('');
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const { isAuthenticated } = useAuthStore();

  const { data: serversResponse, isLoading, error } = useServers({
    search: searchQuery || undefined,
    status: status || undefined,
    limit,
    offset
  });

  const servers = serversResponse?.servers || [];
  const totalCount = (serversResponse as any)?.pagination?.total || 0;
  

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search); // Set the actual search query
    setOffset(0); // Reset to first page when searching
  };

  // Also handle real-time search changes
  const handleStatusChange = (newStatus: ServerStatus | '') => {
    setStatus(newStatus);
    setOffset(0); // Reset to first page when filtering
  };

  const nextPage = () => {
    if (offset + limit < totalCount) {
      setOffset(offset + limit);
    }
  };

  const prevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">MCP Servers</h1>
        <div className="card">
          <div className="card-body">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                Failed to load servers. Please try again later.
              </p>
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

      {/* Search and Filters */}
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
                placeholder="Search by name, description, or vendor..."
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select 
                className="form-input"
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as ServerStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="experimental">Experimental</option>
                <option value="beta">Beta</option>
                <option value="stable">Stable</option>
                <option value="deprecated">Deprecated</option>
              </select>
            </div>
            <button type="submit" className="btn-secondary">
              Search
            </button>
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
                {searchQuery || status ? 'No servers found matching your criteria.' : 'No servers published yet.'}
              </p>
              {!searchQuery && !status && (
                <p className="text-gray-500 mt-2">
                  {isAuthenticated ? 'Click "Publish Server" to add the first one!' : 'Sign in to publish servers.'}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {servers.map((server: any) => (
                  <div key={server.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link 
                          to={`/servers/${server.id}`}
                          className="text-lg font-semibold text-brand-600 hover:text-brand-700"
                        >
                          {server.name}
                        </Link>
                        <p className="text-gray-600 mt-1">{server.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Version: {server.version}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            server.status === 'stable' ? 'bg-green-100 text-green-800' :
                            server.status === 'beta' ? 'bg-blue-100 text-blue-800' :
                            server.status === 'experimental' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {server.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <span className="text-xs">View details for dates</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalCount > limit && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} servers
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={prevPage}
                      disabled={offset === 0}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={nextPage}
                      disabled={offset + limit >= totalCount}
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