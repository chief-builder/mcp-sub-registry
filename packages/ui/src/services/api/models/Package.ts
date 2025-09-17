/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Package = {
    registry: 'npm' | 'pypi' | 'maven' | 'docker' | 'cargo' | 'gem';
    /**
     * Package identifier in the registry
     */
    identifier: string;
    /**
     * Package version
     */
    version: string;
    /**
     * Direct download URL
     */
    url?: string;
};

