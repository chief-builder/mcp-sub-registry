/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ApiKey = {
    id: string;
    name: string;
    description?: string;
    scopes: Array<'read' | 'publish' | 'admin'>;
    expires_at: string;
    created_at: string;
    updated_at?: string;
    last_used?: string;
    is_active: boolean;
    user: {
        id?: string;
        email?: string;
        username?: string;
    };
};

