import axios from "axios";
import type { LoginFormData } from "../types/auth.types";

// Sửa trong file auth.service.ts (hoặc file gọi axios)
export const login = async (data: LoginFormData) => {
  const response = await axios.post("http://localhost:3000/api/auth/login", {
    email: data.identifier,
    password: data.password,
    role: data.role,
  });

  return response.data;
};
