export type Role = "student" | "lecturer" | "admin";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  major?: string | null;
  account_status: string;
  is_active: boolean;
}

export interface LoginFormData {
  identifier: string;
  password: string;
  role: Role;
  rememberMe: boolean; // Đã thêm để hết lỗi TS2339
}

export interface RoleOption {
  value: Role; // Dùng 'value' thay vì 'id' để khớp với RoleSelector
  label: string;
  icon: string;
  activeColor: string;
  activeBg: string;
  activeRing: string;
  activeText: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  message?: string;
}
