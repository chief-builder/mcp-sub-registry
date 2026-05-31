/* MCP Registry admin settings service (hand-maintained to match /api/v1/settings) */
/* tslint:disable */
/* eslint-disable */
import type { AppSettings, SettingsResponse } from '../models/AppSettings';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class SettingsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    public getSettings(): CancelablePromise<SettingsResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/v1/settings',
            errors: { 401: `Authentication required`, 403: `Insufficient permissions`, 500: `Internal server error` },
        });
    }

    public updateSettings({ requestBody }: { requestBody: Partial<AppSettings> }): CancelablePromise<SettingsResponse> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/v1/settings',
            body: requestBody,
            mediaType: 'application/json',
            errors: { 400: `Invalid request data`, 401: `Authentication required`, 403: `Insufficient permissions`, 500: `Internal server error` },
        });
    }

}
