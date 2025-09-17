/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiKey } from '../models/ApiKey';
import type { ApiKeyListResponse } from '../models/ApiKeyListResponse';
import type { ApiKeyWithSecret } from '../models/ApiKeyWithSecret';
import type { CreateApiKeyRequest } from '../models/CreateApiKeyRequest';
import type { UpdateApiKeyRequest } from '../models/UpdateApiKeyRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class ApiKeysService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Create API key
     * Generate a new API key with specified scopes and expiration
     * @returns ApiKeyWithSecret API key created successfully
     * @throws ApiError
     */
    public postApiV1ApiKeysCreate({
        requestBody,
    }: {
        requestBody: CreateApiKeyRequest,
    }): CancelablePromise<ApiKeyWithSecret> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/api-keys/create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request data`,
                401: `Authentication required`,
                403: `Insufficient permissions`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * List API keys
     * Retrieve a list of API keys for the current user
     * @returns ApiKeyListResponse API keys retrieved successfully
     * @throws ApiError
     */
    public getApiV1ApiKeys({
        limit = 50,
        offset,
        active,
    }: {
        limit?: number,
        offset?: number,
        /**
         * Filter by active status
         */
        active?: boolean,
    }): CancelablePromise<ApiKeyListResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/api-keys',
            query: {
                'limit': limit,
                'offset': offset,
                'active': active,
            },
            errors: {
                401: `Authentication required`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get API key by ID
     * Retrieve details of a specific API key
     * @returns ApiKey API key details retrieved successfully
     * @throws ApiError
     */
    public getApiV1ApiKeys1({
        id,
    }: {
        id: string,
    }): CancelablePromise<ApiKey> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/api-keys/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Authentication required`,
                404: `API key not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Update API key
     * Update API key name, description, or active status
     * @returns ApiKey API key updated successfully
     * @throws ApiError
     */
    public patchApiV1ApiKeys({
        id,
        requestBody,
    }: {
        id: string,
        requestBody: UpdateApiKeyRequest,
    }): CancelablePromise<ApiKey> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/v1/api-keys/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request data`,
                401: `Authentication required`,
                404: `API key not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Delete API key
     * Permanently delete an API key
     * @returns void
     * @throws ApiError
     */
    public deleteApiV1ApiKeys({
        id,
    }: {
        id: string,
    }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/v1/api-keys/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Authentication required`,
                404: `API key not found`,
                500: `Internal server error`,
            },
        });
    }

}
