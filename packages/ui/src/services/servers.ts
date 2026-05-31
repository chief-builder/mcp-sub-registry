// Server Management Service Wrapper (MCP Registry v0.1)
import { ServersService } from './api/services/ServersService';
import { AxiosHttpRequest } from './api/core/AxiosHttpRequest';
import { OpenAPI } from './api/core/OpenAPI';
import type {
  MCPServer,
  PublishServerRequest,
  ServerListResponse,
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
  cursor?: string;
  search?: string;
  version?: string;
  updatedSince?: string;
  includeDeleted?: boolean;
}

export const ServerService = {
  /**
   * Get a cursor-paginated list of servers (latest version of each).
   */
  async getServers(filters: ServerFilters = {}): Promise<ServerListResponse> {
    const serversService = new ServersService(createHttpRequest());
    return serversService.getServers(filters);
  },

  /**
   * Get the latest version of a server by name.
   */
  async getServer(serverName: string): Promise<MCPServer> {
    const serversService = new ServersService(createHttpRequest());
    return serversService.getServerVersion({ serverName });
  },

  /**
   * List all versions of a server, newest first.
   */
  async getServerVersions(serverName: string): Promise<ServerListResponse> {
    const serversService = new ServersService(createHttpRequest());
    return serversService.getServerVersions({ serverName });
  },

  /**
   * Publish a new server version.
   */
  async publishServer(data: PublishServerRequest): Promise<MCPServer> {
    const serversService = new ServersService(createHttpRequest());
    return serversService.publishServer({ requestBody: data });
  }
};

export default ServerService;
