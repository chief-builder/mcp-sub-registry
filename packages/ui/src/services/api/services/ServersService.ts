/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MCPServer } from '../models/MCPServer';
import type { PublishServerRequest } from '../models/PublishServerRequest';
import type { ServerListResponse } from '../models/ServerListResponse';
import type { ServerStatus } from '../models/ServerStatus';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ServersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * List MCP servers
     * Retrieve a paginated list of MCP servers with optional filtering
     * @returns ServerListResponse List of servers retrieved successfully
     * @throws ApiError
     */
    public getV0Servers({
        limit = 50,
        offset,
        status,
        search,
    }: {
        /**
         * Maximum number of servers to return
         */
        limit?: number,
        /**
         * Number of servers to skip for pagination
         */
        offset?: number,
        /**
         * Filter servers by status
         */
        status?: ServerStatus,
        /**
         * Search servers by name or description
         */
        search?: string,
    }): CancelablePromise<ServerListResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v0/servers',
            query: {
                'limit': limit,
                'offset': offset,
                'status': status,
                'search': search,
            },
            errors: {
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get server by ID
     * Retrieve detailed information about a specific MCP server
     * @returns MCPServer Server details retrieved successfully
     * @throws ApiError
     */
    public getV0Servers1({
        id,
    }: {
        /**
         * Server unique identifier
         */
        id: string,
    }): CancelablePromise<MCPServer> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v0/servers/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Server not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Publish MCP server
     * Register a new MCP server in the registry
     * @returns MCPServer Server published successfully
     * @throws ApiError
     */
    public postV0Publish({
        requestBody,
    }: {
        requestBody: PublishServerRequest,
    }): CancelablePromise<MCPServer> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/v0/publish',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request data`,
                401: `Authentication required`,
                403: `Insufficient permissions`,
                409: `Server name already exists`,
                429: `Rate limit exceeded`,
                500: `Internal server error`,
            },
        });
    }

}
