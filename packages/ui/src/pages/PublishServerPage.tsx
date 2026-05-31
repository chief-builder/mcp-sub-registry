import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePublishServer } from '../services/api/hooks/useServers';
import type { PublishServerRequest, Repository, Package, RemoteConfig } from '../services/api/models';

const SCHEMA_URL = 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json';

type BasicInfo = {
  name: string;
  title: string;
  description: string;
  version: string;
  websiteUrl: string;
};

export function PublishServerPage() {
  const navigate = useNavigate();
  const publishServer = usePublishServer();
  const [currentStep, setCurrentStep] = useState(1);

  const [basic, setBasic] = useState<BasicInfo>({
    name: '',
    title: '',
    description: '',
    version: '',
    websiteUrl: '',
  });

  const [repository, setRepository] = useState<Repository>({ url: '', source: 'github', subfolder: '' });
  const [packages, setPackages] = useState<Package[]>([]);
  const [remotes, setRemotes] = useState<RemoteConfig[]>([]);

  const [includeRepository, setIncludeRepository] = useState(false);
  const [includePackages, setIncludePackages] = useState(false);
  const [includeRemotes, setIncludeRemotes] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serverData: PublishServerRequest = {
        $schema: SCHEMA_URL,
        name: basic.name,
        description: basic.description,
        version: basic.version,
        ...(basic.title ? { title: basic.title } : {}),
        ...(basic.websiteUrl ? { websiteUrl: basic.websiteUrl } : {}),
        ...(includeRepository ? { repository: { ...repository, subfolder: repository.subfolder || undefined } } : {}),
        ...(includePackages && packages.length ? { packages } : {}),
        ...(includeRemotes && remotes.length ? { remotes } : {}),
      };

      const result = await publishServer.mutateAsync(serverData);
      navigate(`/servers/${encodeURIComponent(result.name)}`);
    } catch (error) {
      console.error('Failed to publish server:', error);
    }
  };

  // --- packages helpers ---
  const addPackage = () => {
    setPackages([...packages, {
      registryType: 'npm',
      registryBaseUrl: 'https://registry.npmjs.org',
      identifier: '',
      version: '',
      transport: { type: 'stdio' },
    }]);
  };
  const removePackage = (index: number) => setPackages(packages.filter((_, i) => i !== index));
  const updatePackage = (index: number, patch: Partial<Package>) => {
    setPackages(packages.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  // --- remotes helpers ---
  const addRemote = () => setRemotes([...remotes, { type: 'streamable-http', url: '' }]);
  const removeRemote = (index: number) => setRemotes(remotes.filter((_, i) => i !== index));
  const updateRemote = (index: number, patch: Partial<RemoteConfig>) => {
    setRemotes(remotes.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="form-label">Server Name *</label>
        <input
          type="text"
          className="form-input"
          value={basic.name}
          onChange={(e) => setBasic({ ...basic, name: e.target.value })}
          placeholder="io.github.your-org/your-server"
          pattern="^[a-zA-Z0-9.\-]+/[a-zA-Z0-9._\-]+$"
          required
        />
        <p className="form-help">
          Format: <code>&lt;reverse-dns-namespace&gt;/&lt;name&gt;</code> (e.g. <code>io.github.your-org/your-server</code>).
          You must own or be authorized for the namespace.
        </p>
      </div>

      <div>
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-input"
          value={basic.title}
          onChange={(e) => setBasic({ ...basic, title: e.target.value })}
          placeholder="Human-readable display name"
        />
      </div>

      <div>
        <label className="form-label">Version *</label>
        <input
          type="text"
          className="form-input"
          value={basic.version}
          onChange={(e) => setBasic({ ...basic, version: e.target.value })}
          placeholder="1.0.0"
          pattern="^\d+\.\d+\.\d+(-[\w\d\-.]+)?(\+[\w\d\-.]+)?$"
          required
        />
        <p className="form-help">Semantic version (e.g. 1.0.0, 1.0.0-beta).</p>
      </div>

      <div>
        <label className="form-label">Description *</label>
        <textarea
          className="form-input"
          rows={4}
          value={basic.description}
          onChange={(e) => setBasic({ ...basic, description: e.target.value })}
          placeholder="A brief description of what this MCP server provides..."
          maxLength={1000}
          required
        />
        <p className="form-help">{basic.description.length}/1000 characters.</p>
      </div>

      <div>
        <label className="form-label">Website URL</label>
        <input
          type="url"
          className="form-input"
          value={basic.websiteUrl}
          onChange={(e) => setBasic({ ...basic, websiteUrl: e.target.value })}
          placeholder="https://docs.example.com/your-server"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <label className="flex items-center">
        <input type="checkbox" checked={includeRepository} onChange={(e) => setIncludeRepository(e.target.checked)} className="mr-2" />
        <span className="form-label mb-0">Include Repository Information</span>
      </label>

      {includeRepository && (
        <div className="pl-6 border-l-2 border-gray-200 space-y-4">
          <div>
            <label className="form-label">Repository URL *</label>
            <input
              type="url"
              className="form-input"
              value={repository.url}
              onChange={(e) => setRepository({ ...repository, url: e.target.value })}
              placeholder="https://github.com/your-org/your-server"
              required={includeRepository}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Source</label>
              <input
                type="text"
                className="form-input"
                value={repository.source}
                onChange={(e) => setRepository({ ...repository, source: e.target.value })}
                placeholder="github"
              />
            </div>
            <div>
              <label className="form-label">Subfolder (monorepos)</label>
              <input
                type="text"
                className="form-input"
                value={repository.subfolder || ''}
                onChange={(e) => setRepository({ ...repository, subfolder: e.target.value })}
                placeholder="packages/server"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <label className="flex items-center">
        <input type="checkbox" checked={includePackages} onChange={(e) => setIncludePackages(e.target.checked)} className="mr-2" />
        <span className="form-label mb-0">Include Package Information</span>
      </label>

      {includePackages && (
        <div className="pl-6 border-l-2 border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Packages</h3>
            <button type="button" onClick={addPackage} className="btn-secondary">Add Package</button>
          </div>

          {packages.map((pkg, index) => {
            const needsBaseUrl = pkg.registryType !== 'oci' && pkg.registryType !== 'mcpb';
            const needsTransportUrl = pkg.transport.type !== 'stdio';
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Package {index + 1}</h4>
                  <button type="button" onClick={() => removePackage(index)} className="text-red-600 hover:text-red-800">Remove</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Registry Type</label>
                    <select
                      className="form-input"
                      value={pkg.registryType}
                      onChange={(e) => updatePackage(index, { registryType: e.target.value as Package['registryType'] })}
                    >
                      <option value="npm">npm</option>
                      <option value="nuget">NuGet</option>
                      <option value="pypi">PyPI</option>
                      <option value="oci">OCI</option>
                      <option value="mcpb">MCPB</option>
                    </select>
                  </div>
                  {needsBaseUrl && (
                    <div>
                      <label className="form-label">Registry Base URL</label>
                      <input
                        type="url"
                        className="form-input"
                        value={pkg.registryBaseUrl || ''}
                        onChange={(e) => updatePackage(index, { registryBaseUrl: e.target.value })}
                        placeholder="https://registry.npmjs.org"
                      />
                    </div>
                  )}
                  <div>
                    <label className="form-label">Package Identifier</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pkg.identifier}
                      onChange={(e) => updatePackage(index, { identifier: e.target.value })}
                      placeholder="@your-org/your-server"
                    />
                  </div>
                  <div>
                    <label className="form-label">Version</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pkg.version}
                      onChange={(e) => updatePackage(index, { version: e.target.value })}
                      placeholder="1.0.0"
                    />
                  </div>
                  <div>
                    <label className="form-label">Transport</label>
                    <select
                      className="form-input"
                      value={pkg.transport.type}
                      onChange={(e) => updatePackage(index, { transport: { ...pkg.transport, type: e.target.value as Package['transport']['type'] } })}
                    >
                      <option value="stdio">stdio</option>
                      <option value="streamable-http">streamable-http</option>
                      <option value="sse">sse</option>
                    </select>
                  </div>
                  {needsTransportUrl && (
                    <div>
                      <label className="form-label">Transport URL</label>
                      <input
                        type="url"
                        className="form-input"
                        value={pkg.transport.url || ''}
                        onChange={(e) => updatePackage(index, { transport: { ...pkg.transport, url: e.target.value } })}
                        placeholder="https://localhost/mcp"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {packages.length === 0 && (
            <div className="text-center py-8 text-gray-500">No packages added yet. Click "Add Package" to get started.</div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <label className="flex items-center">
        <input type="checkbox" checked={includeRemotes} onChange={(e) => setIncludeRemotes(e.target.checked)} className="mr-2" />
        <span className="form-label mb-0">Include Remote Endpoints</span>
      </label>
      <p className="form-help">A server must declare at least one package or one remote.</p>

      {includeRemotes && (
        <div className="pl-6 border-l-2 border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Remotes</h3>
            <button type="button" onClick={addRemote} className="btn-secondary">Add Remote</button>
          </div>

          {remotes.map((remote, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium">Remote {index + 1}</h4>
                <button type="button" onClick={() => removeRemote(index)} className="text-red-600 hover:text-red-800">Remove</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Type</label>
                  <select
                    className="form-input"
                    value={remote.type}
                    onChange={(e) => updateRemote(index, { type: e.target.value as RemoteConfig['type'] })}
                  >
                    <option value="streamable-http">streamable-http</option>
                    <option value="sse">sse</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={remote.url}
                    onChange={(e) => updateRemote(index, { url: e.target.value })}
                    placeholder="https://api.example.com/mcp"
                  />
                </div>
              </div>
            </div>
          ))}

          {remotes.length === 0 && (
            <div className="text-center py-8 text-gray-500">No remotes added yet. Click "Add Remote" to get started.</div>
          )}
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
              <div className="flex justify-between py-1"><dt className="text-gray-500">Name:</dt><dd className="text-gray-900">{basic.name}</dd></div>
              {basic.title && <div className="flex justify-between py-1"><dt className="text-gray-500">Title:</dt><dd className="text-gray-900">{basic.title}</dd></div>}
              <div className="flex justify-between py-1"><dt className="text-gray-500">Version:</dt><dd className="text-gray-900">{basic.version}</dd></div>
              {basic.websiteUrl && <div className="flex justify-between py-1"><dt className="text-gray-500">Website:</dt><dd className="text-gray-900 break-all">{basic.websiteUrl}</dd></div>}
            </dl>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Description:</p>
              <p className="text-sm text-gray-900">{basic.description}</p>
            </div>
          </div>

          {includeRepository && (
            <div>
              <h4 className="font-medium text-gray-900">Repository</h4>
              <dl className="mt-2 text-sm">
                <div className="flex justify-between py-1"><dt className="text-gray-500">Source:</dt><dd className="text-gray-900">{repository.source}</dd></div>
                <div className="flex justify-between py-1"><dt className="text-gray-500">URL:</dt><dd className="text-gray-900 break-all">{repository.url}</dd></div>
              </dl>
            </div>
          )}

          {includePackages && packages.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900">Packages ({packages.length})</h4>
              <div className="mt-2 space-y-2">
                {packages.map((pkg, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-500">{pkg.registryType}:</span>
                    <span className="text-gray-900 ml-1">{pkg.identifier}@{pkg.version} ({pkg.transport.type})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {includeRemotes && remotes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900">Remotes ({remotes.length})</h4>
              <div className="mt-2 space-y-2">
                {remotes.map((remote, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-500">{remote.type}:</span>
                    <span className="text-gray-900 ml-1 break-all">{remote.url}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const steps = [
    { id: 1, name: 'Basic Info', description: 'Name, version, description' },
    { id: 2, name: 'Repository', description: 'Source repository (optional)' },
    { id: 3, name: 'Packages', description: 'Install packages (optional)' },
    { id: 4, name: 'Remotes', description: 'Remote endpoints (optional)' },
    { id: 5, name: 'Review', description: 'Review and publish' },
  ];

  const hasPackageOrRemote = (includePackages && packages.length > 0) || (includeRemotes && remotes.length > 0);

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(basic.name && basic.version && basic.description.length >= 1);
      case 2:
        return !includeRepository || Boolean(repository.url);
      case 3:
        return !includePackages || packages.every(pkg =>
          pkg.identifier && pkg.version &&
          (pkg.registryType === 'oci' || pkg.registryType === 'mcpb' || Boolean(pkg.registryBaseUrl)) &&
          (pkg.transport.type === 'stdio' || Boolean(pkg.transport.url))
        );
      case 4:
        return (!includeRemotes || remotes.every(r => Boolean(r.url))) && hasPackageOrRemote;
      case 5:
        return hasPackageOrRemote;
      default:
        return false;
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <Link to="/servers" className="btn-secondary">← Back to Servers</Link>
        <h1 className="text-2xl font-bold text-gray-900">Publish MCP Server</h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-16">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${currentStep > step.id ? 'bg-brand-600' : 'bg-gray-200'}`} />
                  </div>
                )}
                <button
                  onClick={() => currentStep >= step.id && setCurrentStep(step.id)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    currentStep > step.id ? 'border-brand-600 bg-brand-600 text-white'
                      : currentStep === step.id ? 'border-brand-600 bg-white text-brand-600'
                      : 'border-gray-300 bg-white text-gray-500'
                  } focus:outline-none`}
                  disabled={currentStep < step.id}
                >
                  {currentStep > step.id ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (<span className="text-sm font-medium">{step.id}</span>)}
                </button>
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
            className={`btn-secondary ${currentStep === 1 ? 'invisible' : ''}`}
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
                <Link to="/servers" className="btn-secondary">Cancel</Link>
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
