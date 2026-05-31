/* MCP Registry v0.1 servers service (hand-maintained to match /v0.1 API) */
/* tslint:disable */
/* eslint-disable */
import type { MCPServer } from '../models/MCPServer';
import type { PublishServerRequest } from '../models/PublishServerRequest';
import type { ServerListResponse } from '../models/ServerListResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ServersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * List MCP servers (latest version of each), cursor-paginated.
     */
    public getServers({
        cursor,
        limit = 50,
        search,
        version,
        updatedSince,
        includeDeleted,
    }: {
        cursor?: string,
        limit?: number,
        search?: string,
        version?: string,
        updatedSince?: string,
        includeDeleted?: boolean,
    }): CancelablePromise<ServerListResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v0.1/servers',
            query: {
                'cursor': cursor,
                'limit': limit,
                'search': search,
                'version': version,
                'updated_since': updatedSince,
                'include_deleted': includeDeleted,
            },
            errors: {
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get the latest (or a specific) version of a server by name.
     */
    public getServerVersion({
        serverName,
        version = 'latest',
    }: {
        serverName: string,
        version?: string,
    }): CancelablePromise<MCPServer> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v0.1/servers/{serverName}/versions/{version}',
            path: {
                'serverName': serverName,
                'version': version,
            },
            errors: {
                404: `Server not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * List all versions of a server, newest first.
     */
    public getServerVersions({
        serverName,
    }: {
        serverName: string,
    }): CancelablePromise<ServerListResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v0.1/servers/{serverName}/versions',
            path: {
                'serverName': serverName,
            },
            errors: {
                404: `Server not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Publish a new server version.
     */
    public publishServer({
        requestBody,
    }: {
        requestBody: PublishServerRequest,
    }): CancelablePromise<MCPServer> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v0.1/publish',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request data`,
                401: `Authentication required`,
                403: `Insufficient permissions`,
                409: `Server version already exists`,
                429: `Rate limit exceeded`,
                500: `Internal server error`,
            },
        });
    }

}
