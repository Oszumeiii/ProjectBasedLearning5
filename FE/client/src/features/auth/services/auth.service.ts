import axios from "axios";
import type { LoginFormData, AuthResponse } from "../types/auth.types";

const API_URL = "http://localhost:3000/api/auth";

// Tạo instance axios để cấu hình chung (Timeout, Headers...)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post("/login", {
      email: data.identifier,
      password: data.password,
      // role: data.role, // BE của bạn thường check role dựa trên email trong DB
    });
    return response.data;
  },

  // Code thêm các chức năng khác dễ dàng ở đây
  logout: () => {
    const refreshToken = localStorage.getItem("refreshToken");
    localStorage.clear();
    return api.post("/logout", { refreshToken });
  },

  refreshToken: async (token: string) => {
    const response = await api.post("/refresh", { refreshToken: token });
    return response.data;
  },

  getMe: async () => {
    // Cần setup Interceptor để truyền Authorization Header
    const response = await api.get("/me");
    return response.data;
  },
};
