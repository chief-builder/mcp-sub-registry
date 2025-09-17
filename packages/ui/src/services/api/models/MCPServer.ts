/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Package } from './Package';
import type { RemoteConfig } from './RemoteConfig';
import type { Repository } from './Repository';
import type { ServerStatus } from './ServerStatus';

export type MCPServer = {
    /**
     * Unique server identifier
     */
    id: string;
    /**
     * Server name in reverse DNS format
     */
    name: string;
    /**
     * Human-readable server description
     */
    description: string;
    /**
     * Semantic version
     */
    version: string;
    status: ServerStatus;
    created_at?: string;
    updated_at?: string;
    repository?: Repository;
    packages?: Array<Package>;
    remote?: RemoteConfig;
    /**
     * Additional server metadata
     */
    metadata?: Record<string, any>;
};

