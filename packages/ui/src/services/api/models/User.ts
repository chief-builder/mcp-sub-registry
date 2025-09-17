/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type User = {
    id: string;
    email: string;
    username: string;
    roles: Array<'admin' | 'publisher' | 'reader'>;
    is_active: boolean;
    created_at: string;
};

