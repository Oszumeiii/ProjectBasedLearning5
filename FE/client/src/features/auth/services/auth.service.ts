import axios from "axios";
import type { LoginFormData } from "../types/auth.types";

export const login = async (data: LoginFormData) => {
  const response = await axios.post("http://localhost:3000/api/auth/login", {
    identifier: data.identifier,
    password: data.password,
    role: data.role,
  });

  return response.data;
};
