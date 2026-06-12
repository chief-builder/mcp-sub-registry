// User Management Service Wrapper (admin)
import { UsersService } from './api/services/UsersService';
import { AxiosHttpRequest } from './api/core/AxiosHttpRequest';
import { OpenAPI } from './api/core/OpenAPI';
import type { User, UserListResponse, CreateUserRequest, UpdateUserRequest } from './api/models';

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

export interface UserFilters {
  limit?: number;
  offset?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export const UserService = {
  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    return new UsersService(createHttpRequest()).getUsers(filters);
  },
  async getUser(id: string): Promise<User> {
    return new UsersService(createHttpRequest()).getUser({ id });
  },
  async createUser(data: CreateUserRequest): Promise<User> {
    return new UsersService(createHttpRequest()).createUser({ requestBody: data });
  },
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return new UsersService(createHttpRequest()).updateUser({ id, requestBody: data });
  },
  async deleteUser(id: string): Promise<void> {
    return new UsersService(createHttpRequest()).deleteUser({ id });
  },
};

export default UserService;
