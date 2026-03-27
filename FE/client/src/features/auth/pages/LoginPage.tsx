import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import AuthHeader from "../components/AuthHeader";
import AuthBranding from "../components/AuthBranding";
import AuthFooter from "../components/AuthFooter";
import LoginForm from "../components/LoginForm";
import type { LoginFormData } from "../types/auth.types";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authService.login(data);

      // 1. Kiểm tra quyền hạn (Role)
      if (result.user.role !== data.role) {
        alert("Vai trò đăng nhập không khớp với tài khoản này.");
        return;
      }

      // 2. Lưu trữ an toàn (Nên lưu cả Access và Refresh Token)
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      // 3. Điều hướng dựa trên role (Dùng switch case cho sạch)
      switch (result.user.role) {
        case "student":
          navigate("/student/lobby");
          break;
        case "lecturer":
          navigate("/instructor/lobby");
          break;
        case "admin":
          navigate("/admin/lobby");
          break;
        default:
          navigate("/");
      }
    } catch (error: any) {
      // Xử lý lỗi từ Backend trả về
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      console.error("Login error:", message);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#101622] text-[#f1f5f9]">
      <AuthHeader />

      <main className="flex-1 flex overflow-hidden">
        <AuthBranding />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-[#0d1117]">
          {/* Bạn có thể truyền isLoading vào LoginForm để disable nút submit khi đang gọi API */}
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </main>

      <AuthFooter />
    </div>
  );
};

export default LoginPage;
