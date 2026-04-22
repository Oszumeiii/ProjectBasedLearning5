import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import AuthBranding from "../components/AuthBranding";
import AuthFooter from "../components/AuthFooter";
import LoginForm from "../components/LoginForm";
import { login } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import type { LoginFormData, Role } from "../types/auth.types";

const ROLE_HOME: Record<Role, string> = {
  student: "/student/lobby",
  lecturer: "/instructor/lobby",
  manager: "/manager/lobby",
  admin: "/admin/lobby",
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginAction } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login(data);

      if (result.user.role !== data.role) {
        alert("Bạn không có quyền đăng nhập với vai trò này");
        return;
      }

      loginAction(result);
      navigate(ROLE_HOME[result.user.role] || "/login");
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Sai tài khoản hoặc mật khẩu";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-app text-ink-body">
      <AuthHeader />

      <main className="flex flex-1 overflow-hidden">
        <AuthBranding />

        <div className="flex w-full items-center justify-center bg-app-card p-6 md:p-12 lg:w-1/2">
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </main>

      <AuthFooter />
    </div>
  );
};

export default LoginPage;
