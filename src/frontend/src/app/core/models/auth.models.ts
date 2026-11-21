export type UserRole = 'Customer' | 'SupportAgent' | 'OperationsManager' | 'Administrator';

export interface User {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateRoleRequest {
  role: string;
}

export interface UpdateStatusRequest {
  isActive: boolean;
}
