/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CreateApiKeyRequest = {
    name: string;
    description?: string;
    scopes?: Array<'read' | 'publish' | 'admin'>;
    expires_in_days?: number;
};

