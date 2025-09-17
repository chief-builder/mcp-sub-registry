// API Key Management Service Wrapper
import { ApiKeysService } from './api/services/ApiKeysService';
import { AxiosHttpRequest } from './api/core/AxiosHttpRequest';
import { OpenAPI } from './api/core/OpenAPI';
import type { 
  ApiKeyWithSecret,
  CreateApiKeyRequest,
  ApiKeyListResponse
} from './api/models';

// Create httpRequest dynamically to get latest token
const createHttpRequest = () => new AxiosHttpRequest({
  BASE: OpenAPI.BASE,
  VERSION: OpenAPI.VERSION,
  WITH_CREDENTIALS: OpenAPI.WITH_CREDENTIALS,
  CREDENTIALS: OpenAPI.CREDENTIALS,
  TOKEN: OpenAPI.TOKEN,
  USERNAME: OpenAPI.USERNAME,
  PASSWORD: OpenAPI.PASSWORD,
  HEADERS: OpenAPI.HEADERS,
  ENCODE_PATH: OpenAPI.ENCODE_PATH
});

export interface ApiKeyFilters {
  limit?: number;
  offset?: number;
  active?: boolean;
}

export const ApiKeyService = {
  /**
   * Create new API key
   */
  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyWithSecret> {
    const apiKeysService = new ApiKeysService(createHttpRequest());
    return apiKeysService.postApiV1ApiKeysCreate({ requestBody: data });
  },

  /**
   * Get list of API keys
   */
  async getApiKeys(filters: ApiKeyFilters = {}): Promise<ApiKeyListResponse> {
    const apiKeysService = new ApiKeysService(createHttpRequest());
    return apiKeysService.getApiV1ApiKeys(filters);
  },

  /**
   * Delete API key
   */
  async deleteApiKey(id: string): Promise<void> {
    const apiKeysService = new ApiKeysService(createHttpRequest());
    return apiKeysService.deleteApiV1ApiKeys({ id } as any);
  }
};

export default ApiKeyService;