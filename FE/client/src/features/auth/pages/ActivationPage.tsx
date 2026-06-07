import { FormEvent, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthHeader from "../components/AuthHeader";
import AuthBranding from "../components/AuthBranding";
import AuthFooter from "../components/AuthFooter";
import { activateAccount } from "../services/auth.service";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth.types";

const ROLE_HOME: Record<Role, string> = {
  student: "/student/lobby",
  lecturer: "/instructor/lobby",
  manager: "/manager/lobby",
  admin: "/admin/lobby",
};

const ActivationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginAction } = useAuth();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Liên kết kích hoạt không hợp lệ hoặc đã bị thiếu token.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await activateAccount(token, password);
      loginAction(result);
      navigate(ROLE_HOME[result.user.role] || "/login", { replace: true });
    } catch (err: any) {
      const message = err.response?.data?.message || "Kích hoạt tài khoản thất bại.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#101622", color: "#f1f5f9" }}>
      <AuthHeader />

      <main className="flex-1 flex overflow-hidden">
        <AuthBranding />

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12" style={{ background: "#0d1117" }}>
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-2">Kích hoạt tài khoản</h2>
              <p className="text-slate-500">Đặt mật khẩu mới để hoàn tất kích hoạt tài khoản của bạn</p>
            </div>

            {!token && (
              <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                Liên kết kích hoạt không hợp lệ. Vui lòng liên hệ quản trị để gửi lại email kích hoạt.
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="password">
                  Mật khẩu mới
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 8 ký tự"
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-primary focus:border-primary text-sm transition-all"
                  disabled={!token || isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="confirmPassword">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-primary focus:border-primary text-sm transition-all"
                  disabled={!token || isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={!token || isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang kích hoạt..." : "Kích hoạt tài khoản"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Quay lại đăng nhập
              </button>
            </div>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
};

export default ActivationPage;
