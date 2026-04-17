import axiosInstance from "../../../services/axios";
import type { LoginFormData, AuthResponse } from "../types/auth.types";

export const login = async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/login", {
    email: data.identifier,
    password: data.password,
  });
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const logoutApi = async (refreshToken: string) => {
  const response = await axiosInstance.post("/auth/logout", { refreshToken });
  return response.data;
};

export const refreshToken = async (token: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/refresh", {
    refreshToken: token,
  });
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const response = await axiosInstance.post("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

export const activateAccount = async (
  token: string,
  password: string
): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/activate", {
    token,
    password,
  });
  return response.data;
};

export const resetPassword = async (token: string, password: string) => {
  const response = await axiosInstance.post("/auth/reset-password", {
    token,
    password,
  });
  return response.data;
};
