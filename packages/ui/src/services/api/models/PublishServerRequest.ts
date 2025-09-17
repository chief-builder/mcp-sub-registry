/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Package } from './Package';
import type { RemoteConfig } from './RemoteConfig';
import type { Repository } from './Repository';
import type { ServerStatus } from './ServerStatus';

export type PublishServerRequest = {
    /**
     * Server name in reverse DNS format
     */
    name: string;
    description: string;
    /**
     * Semantic version
     */
    version: string;
    status: ServerStatus;
    repository?: Repository;
    packages?: Array<Package>;
    remote?: RemoteConfig;
    metadata?: Record<string, any>;
};

