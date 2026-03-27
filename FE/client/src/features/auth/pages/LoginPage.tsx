import AuthHeader from "../components/AuthHeader";
import AuthBranding from "../components/AuthBranding";
import AuthFooter from "../components/AuthFooter";
import LoginForm from "../components/LoginForm";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth.service";

import type { LoginFormData } from "../types/auth.types";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = async (data: LoginFormData) => {
    try {
      const result = await login(data);

      // kiểm tra role
      if (result.user.role !== data.role) {
        alert("Bạn không có quyền đăng nhập với vai trò này");
        return;
      }

      localStorage.setItem("token", result.token);

      if (data.role == "student") navigate("/student/lobby");
      else if (data.role == "instructor") navigate("/instructor/lobby");
      else if (data.role == "admin") navigate("/admin/lobby");
    } catch (error) {
      console.error("Login failed", error);
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#101622", color: "#f1f5f9" }}
    >
      <AuthHeader />

      <main className="flex-1 flex overflow-hidden">
        <AuthBranding />

        <div
          className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12"
          style={{ background: "#0d1117" }}
        >
          <LoginForm onSubmit={handleLogin} />
        </div>
      </main>

      <AuthFooter />
    </div>
  );
};

export default LoginPage;
