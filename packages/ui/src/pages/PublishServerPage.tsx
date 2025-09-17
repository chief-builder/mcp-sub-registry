import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePublishServer } from '../services/api/hooks/useServers';
import type { PublishServerRequest, Repository, Package, RemoteConfig, ServerStatus } from '../services/api/models';

export function PublishServerPage() {
  const navigate = useNavigate();
  const publishServer = usePublishServer();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PublishServerRequest>({
    name: '',
    description: '',
    version: '',
    status: 'experimental' as ServerStatus,
    repository: undefined,
    packages: [],
    remote: undefined,
    metadata: {}
  });

  const [repository, setRepository] = useState<Repository>({
    type: 'git',
    url: '',
    branch: '',
    tag: '',
    commit: ''
  });

  const [packages, setPackages] = useState<Package[]>([]);
  const [remote, setRemote] = useState<RemoteConfig>({
    transport: 'stdio',
    url: '',
    host: '',
    port: undefined,
    path: ''
  });

  const [includeRepository, setIncludeRepository] = useState(false);
  const [includePackages, setIncludePackages] = useState(false);
  const [includeRemote, setIncludeRemote] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serverData: PublishServerRequest = {
        ...formData,
        repository: includeRepository ? repository : undefined,
        packages: includePackages ? packages : undefined,
        remote: includeRemote ? remote : undefined
      };
      
      const result = await publishServer.mutateAsync(serverData);
      navigate(`/servers/${result.id}`);
    } catch (error) {
      console.error('Failed to publish server:', error);
    }
  };

  const addPackage = () => {
    setPackages([...packages, {
      registry: 'npm',
      identifier: '',
      version: '',
      url: ''
    }]);
  };

  const removePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const updatePackage = (index: number, field: keyof Package, value: string) => {
    const updatedPackages = [...packages];
    if (field === 'registry') {
      updatedPackages[index][field] = value as Package['registry'];
    } else {
      (updatedPackages[index] as any)[field] = value;
    }
    setPackages(updatedPackages);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="form-label">Server Name *</label>
        <input 
          type="text" 
          className="form-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="com.company.mcp-server"
          pattern="^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$"
          required
        />
        <p className="form-help">
          Use reverse DNS format (e.g., com.company.mcp-server). Only lowercase letters, numbers, dots, and hyphens allowed.
        </p>
      </div>
      
      <div>
        <label className="form-label">Version *</label>
        <input 
          type="text" 
          className="form-input"
          value={formData.version}
          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          placeholder="1.0.0"
          pattern="^\d+\.\d+\.\d+(-[\w\d\-_]+)?(\+[\w\d\-_]+)?$"
          required
        />
        <p className="form-help">
          Semantic version format (e.g., 1.0.0, 1.0.0-beta, 1.0.0+build.1)
        </p>
      </div>
      
      <div>
        <label className="form-label">Description *</label>
        <textarea 
          className="form-input"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="A brief description of what this MCP server provides..."
          minLength={10}
          maxLength={500}
          required
        />
        <p className="form-help">
          {formData.description.length}/500 characters. Minimum 10 characters required.
        </p>
      </div>
      
      <div>
        <label className="form-label">Status *</label>
        <select 
          className="form-input"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as ServerStatus })}
          required
        >
          <option value="experimental">Experimental - Early development, may have breaking changes</option>
          <option value="beta">Beta - Feature complete, testing for stability</option>
          <option value="stable">Stable - Production ready and reliable</option>
          <option value="deprecated">Deprecated - No longer maintained</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center">
          <input 
            type="checkbox"
            checked={includeRepository}
            onChange={(e) => setIncludeRepository(e.target.checked)}
            className="mr-2"
          />
          <span className="form-label mb-0">Include Repository Information</span>
        </label>
        <p className="form-help">Link to your source code repository for transparency and contributions.</p>
      </div>
      
      {includeRepository && (
        <div className="pl-6 border-l-2 border-gray-200 space-y-4">
          <div>
            <label className="form-label">Repository Type</label>
            <select 
              className="form-input"
              value={repository.type}
              onChange={(e) => setRepository({ ...repository, type: e.target.value as Repository['type'] })}
            >
              <option value="git">Git</option>
              <option value="mercurial">Mercurial</option>
              <option value="svn">Subversion</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Repository URL *</label>
            <input 
              type="url" 
              className="form-input"
              value={repository.url}
              onChange={(e) => setRepository({ ...repository, url: e.target.value })}
              placeholder="https://github.com/company/mcp-server"
              required={includeRepository}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Branch</label>
              <input 
                type="text" 
                className="form-input"
                value={repository.branch || ''}
                onChange={(e) => setRepository({ ...repository, branch: e.target.value })}
                placeholder="main"
              />
            </div>
            
            <div>
              <label className="form-label">Tag</label>
              <input 
                type="text" 
                className="form-input"
                value={repository.tag || ''}
                onChange={(e) => setRepository({ ...repository, tag: e.target.value })}
                placeholder="v1.0.0"
              />
            </div>
            
            <div>
              <label className="form-label">Commit</label>
              <input 
                type="text" 
                className="form-input"
                value={repository.commit || ''}
                onChange={(e) => setRepository({ ...repository, commit: e.target.value })}
                placeholder="abc123..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center">
          <input 
            type="checkbox"
            checked={includePackages}
            onChange={(e) => setIncludePackages(e.target.checked)}
            className="mr-2"
          />
          <span className="form-label mb-0">Include Package Information</span>
        </label>
        <p className="form-help">Specify how users can install and run your MCP server.</p>
      </div>
      
      {includePackages && (
        <div className="pl-6 border-l-2 border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Packages</h3>
            <button 
              type="button"
              onClick={addPackage}
              className="btn-secondary"
            >
              Add Package
            </button>
          </div>
          
          {packages.map((pkg, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Package {index + 1}</h4>
                <button 
                  type="button"
                  onClick={() => removePackage(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Registry</label>
                  <select 
                    className="form-input"
                    value={pkg.registry}
                    onChange={(e) => updatePackage(index, 'registry', e.target.value)}
                  >
                    <option value="npm">NPM</option>
                    <option value="pypi">PyPI</option>
                    <option value="maven">Maven</option>
                    <option value="docker">Docker</option>
                    <option value="cargo">Cargo</option>
                    <option value="gem">RubyGems</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Package Identifier</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={pkg.identifier}
                    onChange={(e) => updatePackage(index, 'identifier', e.target.value)}
                    placeholder="@company/mcp-server"
                  />
                </div>
                
                <div>
                  <label className="form-label">Version</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={pkg.version}
                    onChange={(e) => updatePackage(index, 'version', e.target.value)}
                    placeholder="1.0.0"
                  />
                </div>
                
                <div>
                  <label className="form-label">Direct URL (optional)</label>
                  <input 
                    type="url" 
                    className="form-input"
                    value={pkg.url || ''}
                    onChange={(e) => updatePackage(index, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          ))}
          
          {packages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No packages added yet. Click "Add Package" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center">
          <input 
            type="checkbox"
            checked={includeRemote}
            onChange={(e) => setIncludeRemote(e.target.checked)}
            className="mr-2"
          />
          <span className="form-label mb-0">Include Remote Configuration</span>
        </label>
        <p className="form-help">Specify how clients can connect to your MCP server remotely.</p>
      </div>
      
      {includeRemote && (
        <div className="pl-6 border-l-2 border-gray-200 space-y-4">
          <div>
            <label className="form-label">Transport Protocol</label>
            <select 
              className="form-input"
              value={remote.transport}
              onChange={(e) => setRemote({ ...remote, transport: e.target.value as RemoteConfig['transport'] })}
            >
              <option value="stdio">Standard I/O</option>
              <option value="http">HTTP</option>
              <option value="https">HTTPS</option>
              <option value="tcp">TCP</option>
              <option value="websocket">WebSocket</option>
            </select>
          </div>
          
          {(remote.transport === 'http' || remote.transport === 'https' || remote.transport === 'websocket') && (
            <div>
              <label className="form-label">URL</label>
              <input 
                type="url" 
                className="form-input"
                value={remote.url || ''}
                onChange={(e) => setRemote({ ...remote, url: e.target.value })}
                placeholder="https://api.company.com/mcp"
              />
            </div>
          )}
          
          {remote.transport === 'tcp' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Host</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={remote.host || ''}
                  onChange={(e) => setRemote({ ...remote, host: e.target.value })}
                  placeholder="localhost"
                />
              </div>
              
              <div>
                <label className="form-label">Port</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={remote.port || ''}
                  onChange={(e) => setRemote({ ...remote, port: parseInt(e.target.value) || undefined })}
                  placeholder="8080"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="form-label">Path</label>
            <input 
              type="text" 
              className="form-input"
              value={remote.path || ''}
              onChange={(e) => setRemote({ ...remote, path: e.target.value })}
              placeholder="/mcp"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Review Your Server Configuration</h3>
        </div>
        <div className="card-body space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Basic Information</h4>
            <dl className="mt-2 text-sm">
              <div className="flex justify-between py-1">
                <dt className="text-gray-500">Name:</dt>
                <dd className="text-gray-900">{formData.name}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-gray-500">Version:</dt>
                <dd className="text-gray-900">{formData.version}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-gray-500">Status:</dt>
                <dd className="text-gray-900">{formData.status}</dd>
              </div>
            </dl>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Description:</p>
              <p className="text-sm text-gray-900">{formData.description}</p>
            </div>
          </div>
          
          {includeRepository && (
            <div>
              <h4 className="font-medium text-gray-900">Repository</h4>
              <dl className="mt-2 text-sm">
                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">Type:</dt>
                  <dd className="text-gray-900">{repository.type}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">URL:</dt>
                  <dd className="text-gray-900 break-all">{repository.url}</dd>
                </div>
                {repository.branch && (
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500">Branch:</dt>
                    <dd className="text-gray-900">{repository.branch}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
          
          {includePackages && packages.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900">Packages ({packages.length})</h4>
              <div className="mt-2 space-y-2">
                {packages.map((pkg, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-500">{pkg.registry}:</span>
                    <span className="text-gray-900 ml-1">{pkg.identifier}@{pkg.version}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {includeRemote && (
            <div>
              <h4 className="font-medium text-gray-900">Remote Configuration</h4>
              <dl className="mt-2 text-sm">
                <div className="flex justify-between py-1">
                  <dt className="text-gray-500">Transport:</dt>
                  <dd className="text-gray-900">{remote.transport}</dd>
                </div>
                {remote.url && (
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500">URL:</dt>
                    <dd className="text-gray-900 break-all">{remote.url}</dd>
                  </div>
                )}
                {remote.host && (
                  <div className="flex justify-between py-1">
                    <dt className="text-gray-500">Host:</dt>
                    <dd className="text-gray-900">{remote.host}:{remote.port}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Server name, version, and description' },
    { id: 2, name: 'Repository', description: 'Source code repository (optional)' },
    { id: 3, name: 'Packages', description: 'Installation packages (optional)' },
    { id: 4, name: 'Remote Config', description: 'Connection details (optional)' },
    { id: 5, name: 'Review', description: 'Review and publish' }
  ];

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.version && formData.description.length >= 10;
      case 2:
        return !includeRepository || repository.url;
      case 3:
        return !includePackages || packages.every(pkg => pkg.identifier && pkg.version);
      case 4:
        return !includeRemote || (
          (remote.transport === 'stdio') || 
          (remote.transport === 'tcp' && remote.host && remote.port) ||
          (['http', 'https', 'websocket'].includes(remote.transport) && remote.url)
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/servers" className="btn-secondary">
          ← Back to Servers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Publish MCP Server</h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-16">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                {/* Connector */}
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${
                      currentStep > step.id ? 'bg-brand-600' : 'bg-gray-200'
                    }`} />
                  </div>
                )}
                
                {/* Step */}
                <button
                  onClick={() => currentStep >= step.id && setCurrentStep(step.id)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep > step.id 
                      ? 'border-brand-600 bg-brand-600 text-white' 
                      : currentStep === step.id 
                      ? 'border-brand-600 bg-white text-brand-600' 
                      : 'border-gray-300 bg-white text-gray-500'
                  } focus:outline-none`}
                  disabled={currentStep < step.id}
                >
                  {currentStep > step.id ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </button>
                
                {/* Label */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center w-20">
                  <p className="text-xs font-medium text-gray-900 truncate">{step.name}</p>
                  <p className="text-xs text-gray-500 truncate">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          <div className="card-body">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderReview()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button 
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            className={`btn-secondary ${
              currentStep === 1 ? 'invisible' : ''
            }`}
          >
            Previous
          </button>
          
          <div className="space-x-3">
            {currentStep < 5 ? (
              <button 
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary"
                disabled={!isStepValid(currentStep)}
              >
                Next
              </button>
            ) : (
              <>
                <Link to="/servers" className="btn-secondary">
                  Cancel
                </Link>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={publishServer.isPending || !isStepValid(currentStep)}
                >
                  {publishServer.isPending ? 'Publishing...' : 'Publish Server'}
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      {/* Error Display */}
      {publishServer.error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            Failed to publish server: {publishServer.error instanceof Error ? publishServer.error.message : 'Unknown error'}
          </p>
        </div>
      )}
    </div>
  );
}