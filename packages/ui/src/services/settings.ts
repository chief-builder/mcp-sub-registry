// Settings Service Wrapper (admin)
import { SettingsService as GeneratedSettingsService } from './api/services/SettingsService';
import { AxiosHttpRequest } from './api/core/AxiosHttpRequest';
import { OpenAPI } from './api/core/OpenAPI';
import type { AppSettings, SettingsResponse } from './api/models';

const createHttpRequest = () => new AxiosHttpRequest({
  BASE: OpenAPI.BASE,
  VERSION: OpenAPI.VERSION,
  WITH_CREDENTIALS: OpenAPI.WITH_CREDENTIALS,
  CREDENTIALS: OpenAPI.CREDENTIALS,
  TOKEN: OpenAPI.TOKEN,
  USERNAME: OpenAPI.USERNAME,
  PASSWORD: OpenAPI.PASSWORD,
  HEADERS: OpenAPI.HEADERS,
  ENCODE_PATH: OpenAPI.ENCODE_PATH,
});

export const SettingsService = {
  async getSettings(): Promise<SettingsResponse> {
    return new GeneratedSettingsService(createHttpRequest()).getSettings();
  },
  async updateSettings(data: Partial<AppSettings>): Promise<SettingsResponse> {
    return new GeneratedSettingsService(createHttpRequest()).updateSettings({ requestBody: data });
  },
};

export default SettingsService;
