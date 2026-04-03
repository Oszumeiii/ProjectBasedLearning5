export type Role = "student" | "lecturer" | "manager" | "admin";

export interface RoleOption {
  value: Role;
  label: string;
  icon: string;
  activeColor: string;
  activeBg: string;
  activeRing: string;
  activeText: string;
}

export interface LoginFormData {
  identifier: string;
  password: string;
  rememberMe: boolean;
  role: Role;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  major: string | null;
  role: Role;
  account_status: string;
  is_active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
