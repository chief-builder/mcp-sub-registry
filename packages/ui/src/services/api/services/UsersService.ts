/* MCP Registry admin users service (hand-maintained to match /api/v1/users) */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';
import type { UserListResponse } from '../models/UserListResponse';
import type { CreateUserRequest } from '../models/CreateUserRequest';
import type { UpdateUserRequest } from '../models/UpdateUserRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class UsersService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    public getUsers({
        limit = 50,
        offset,
        search,
        role,
        isActive,
    }: {
        limit?: number,
        offset?: number,
        search?: string,
        role?: string,
        isActive?: boolean,
    }): CancelablePromise<UserListResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/users',
            query: {
                'limit': limit,
                'offset': offset,
                'search': search,
                'role': role,
                'is_active': isActive,
            },
            errors: { 401: `Authentication required`, 403: `Insufficient permissions`, 500: `Internal server error` },
        });
    }

    public getUser({ id }: { id: string }): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/users/{id}',
            path: { 'id': id },
            errors: { 401: `Authentication required`, 404: `User not found`, 500: `Internal server error` },
        });
    }

    public createUser({ requestBody }: { requestBody: CreateUserRequest }): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: { 400: `Invalid request data`, 401: `Authentication required`, 403: `Insufficient permissions`, 409: `Email or username already exists`, 500: `Internal server error` },
        });
    }

    public updateUser({ id, requestBody }: { id: string, requestBody: UpdateUserRequest }): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/v1/users/{id}',
            path: { 'id': id },
            body: requestBody,
            mediaType: 'application/json',
            errors: { 400: `Invalid request data`, 401: `Authentication required`, 404: `User not found`, 409: `Conflict`, 500: `Internal server error` },
        });
    }

    public deleteUser({ id }: { id: string }): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/v1/users/{id}',
            path: { 'id': id },
            errors: { 401: `Authentication required`, 404: `User not found`, 409: `Conflict`, 500: `Internal server error` },
        });
    }

}
