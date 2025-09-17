// Server Management Service Wrapper
import { ServersService } from './api/services/ServersService';
import { AxiosHttpRequest } from './api/core/AxiosHttpRequest';
import { OpenAPI } from './api/core/OpenAPI';
import type { 
  MCPServer, 
  PublishServerRequest, 
  ServerListResponse,
  ServerStatus
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

export interface ServerFilters {
  limit?: number;
  offset?: number;
  status?: ServerStatus;
  search?: string;
}

export const ServerService = {
  /**
   * Get list of servers with optional filtering
   */
  async getServers(filters: ServerFilters = {}): Promise<ServerListResponse> {
    const serversService = new ServersService(createHttpRequest());
    return serversService.getV0Servers(filters);
  },

  /**
   * Get server by ID
   */
  async getServer(id: string): Promise<MCPServer> {
    const serversService = new ServersService(createHttpRequest());
    return serversService.getV0Servers1({ id });
  },

  /**
   * Publish new server
   */
  async publishServer(data: PublishServerRequest): Promise<MCPServer> {
    const serversService = new ServersService(createHttpRequest());
    return serversService.postV0Publish({ requestBody: data });
  }
};

export default ServerService;