/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HealthResponse } from '../models/HealthResponse';
import type { MCPHealthResponse } from '../models/MCPHealthResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class HealthService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * MCP API health check
     * Check the health status of the MCP v0 API endpoints
     * @returns MCPHealthResponse API is healthy
     * @throws ApiError
     */
    public getV0Health(): CancelablePromise<MCPHealthResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/v0.1/health',
        });
    }

    /**
     * Basic health check
     * Basic infrastructure health check for load balancers
     * @returns HealthResponse Service is healthy
     * @throws ApiError
     */
    public getHealth(): CancelablePromise<HealthResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/health',
        });
    }

    /**
     * Prometheus metrics
     * Retrieve Prometheus-compatible metrics for monitoring
     * @returns string Metrics retrieved successfully
     * @throws ApiError
     */
    public getMetrics(): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/metrics',
        });
    }

}
