import React, { useState } from 'react';
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '../services/api/hooks/useApiKeys';

export function ApiKeysPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  
  const { data: apiKeys, isLoading, error } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createApiKey.mutateAsync({
        name: newKeyName,
        description: newKeyDescription
      });
      setCreatedKey(result.key);
      setNewKeyName('');
      setNewKeyDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      try {
        await deleteApiKey.mutateAsync(keyId);
      } catch (error) {
        console.error('Failed to delete API key:', error);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">API Keys</h1>
        <div className="card">
          <div className="card-body">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">
                Failed to load API keys. Please try again later.
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
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          Create New Key
        </button>
      </div>

      {/* Newly Created Key Display */}
      {createdKey && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="text-lg font-medium text-green-800 mb-2">API Key Created Successfully!</h3>
          <p className="text-green-700 mb-3">
            Please copy this key now. For security reasons, it won't be shown again.
          </p>
          <div className="flex items-center space-x-2">
            <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
              {createdKey}
            </code>
            <button 
              onClick={() => copyToClipboard(createdKey)}
              className="btn-secondary"
            >
              Copy
            </button>
          </div>
          <button 
            onClick={() => setCreatedKey(null)}
            className="mt-3 text-green-600 hover:text-green-700 text-sm"
          >
            I've saved this key safely
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Create New API Key</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="form-label">Key Name *</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="My Integration Key"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input"
                  rows={3}
                  value={newKeyDescription}
                  onChange={(e) => setNewKeyDescription(e.target.value)}
                  placeholder="Brief description of what this key will be used for..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={createApiKey.isPending}
                >
                  {createApiKey.isPending ? 'Creating...' : 'Create Key'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            {createApiKey.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">
                  Failed to create API key: {createApiKey.error instanceof Error ? createApiKey.error.message : 'Unknown error'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* API Keys List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Your API Keys</h2>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading API keys...</p>
            </div>
          ) : !apiKeys || (apiKeys as any).api_keys.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No API keys created yet.</p>
              <p className="text-gray-500 mt-2">Click "Create New Key" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(apiKeys as any).api_keys.map((key: any) => (
                <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{key.name}</h3>
                      {key.description && (
                        <p className="text-gray-600 mt-1">{key.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                        <span>Last Used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        disabled={deleteApiKey.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {deleteApiKey.error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            Failed to delete API key: {deleteApiKey.error instanceof Error ? deleteApiKey.error.message : 'Unknown error'}
          </p>
        </div>
      )}
    </div>
  );
}