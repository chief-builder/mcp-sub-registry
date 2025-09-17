/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApiKey } from './ApiKey';

export type ApiKeyWithSecret = (ApiKey & {
    /**
     * The actual API key (only returned on creation)
     */
    key: string;
});

