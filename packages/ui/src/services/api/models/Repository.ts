/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Repository = {
    type: 'git' | 'mercurial' | 'svn';
    url: string;
    branch?: string;
    tag?: string;
    commit?: string;
};

