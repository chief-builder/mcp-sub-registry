/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { User } from './User';

export type LoginResponse = {
    /**
     * JWT token for authentication
     */
    token: string;
    user: User;
    message?: string;
};

