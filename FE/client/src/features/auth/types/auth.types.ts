export type Role = "student" | "instructor" | "admin";

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
  name: string;
  email: string;
  major: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}
