// Authentication Service Wrapper
import { AuthenticationService } from './api/services/AuthenticationService';
import { AxiosHttpRequest } from './api/core/AxiosHttpRequest';
import { OpenAPI } from './api/core/OpenAPI';
import type { 
  LoginResponse, 
  User, 
  UserLoginRequest, 
  UserRegisterRequest 
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

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  adminKey?: string;
}

export const AuthService = {
  /**
   * Login user and get JWT token
   */
  async login(data: LoginData): Promise<LoginResponse> {
    const authService = new AuthenticationService(createHttpRequest());
    return authService.postApiV1AuthLogin({
      requestBody: data as UserLoginRequest
    });
  },

  /**
   * Register admin user (requires admin key)
   */
  async register(data: RegisterData): Promise<User> {
    const { adminKey, ...userData } = data;
    const authService = new AuthenticationService(createHttpRequest());
    return authService.postApiV1AuthRegister({
      requestBody: userData as UserRegisterRequest,
      xAdminKey: adminKey
    });
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const authService = new AuthenticationService(createHttpRequest());
    return authService.getApiV1AuthMe();
  }
};

export default AuthService;