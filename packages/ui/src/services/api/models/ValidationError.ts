/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ValidationError = {
    /**
     * Validation error message
     */
    error: string;
    /**
     * Error code (typically VALIDATION_ERROR)
     */
    code: string;
    details?: Array<{
        field?: string;
        message?: string;
    }>;
};

