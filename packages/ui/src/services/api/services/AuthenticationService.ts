/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginResponse } from '../models/LoginResponse';
import type { User } from '../models/User';
import type { UserLoginRequest } from '../models/UserLoginRequest';
import type { UserRegisterRequest } from '../models/UserRegisterRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AuthenticationService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Register admin user
     * Register a new admin user (restricted endpoint)
     * @returns User User registered successfully
     * @throws ApiError
     */
    public postApiV1AuthRegister({
        requestBody,
        xAdminKey,
    }: {
        requestBody: UserRegisterRequest,
        /**
         * Admin setup key for user registration
         */
        xAdminKey?: string,
    }): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/auth/register',
            headers: {
                'x-admin-key': xAdminKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request data or user already exists`,
                403: `Registration disabled or invalid admin key`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * User login
     * Authenticate user and receive JWT token
     * @returns LoginResponse Login successful
     * @throws ApiError
     */
    public postApiV1AuthLogin({
        requestBody,
    }: {
        requestBody: UserLoginRequest,
    }): CancelablePromise<LoginResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid request data`,
                401: `Invalid credentials`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get current user
     * Retrieve current authenticated user information
     * @returns User User information retrieved successfully
     * @throws ApiError
     */
    public getApiV1AuthMe(): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/auth/me',
            errors: {
                401: `Invalid or missing token`,
                500: `Internal server error`,
            },
        });
    }

}
