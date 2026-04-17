import { useState, FormEvent } from "react";
import type { LoginFormData, Role } from "../types/auth.types";
import RoleSelector from "./RoleSelector";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
}

const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
    rememberMe: false,
    role: "student" as Role,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold mb-2">Chào mừng trở lại</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Vui lòng chọn vai trò và đăng nhập để tiếp tục
        </p>
      </div>

      {/* Role Selector */}
      <RoleSelector
        selectedRole={formData.role}
        onChange={(role: Role) =>
          setFormData((prev: LoginFormData) => ({ ...prev, role }))
        }
      />

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Identifier */}
        <div>
          <label
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            htmlFor="identifier"
          >
            Email hoặc Mã số
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-xl">
                alternate_email
              </span>
            </div>
            <input
              className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-primary focus:border-primary text-sm transition-all"
              id="identifier"
              placeholder="Nhập email hoặc mã số của bạn"
              type="text"
              value={formData.identifier}
              onChange={(e) =>
                setFormData((prev: LoginFormData) => ({
                  ...prev,
                  identifier: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            htmlFor="password"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-xl">
                lock
              </span>
            </div>
            <input
              className="block w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-primary focus:border-primary text-sm transition-all"
              id="password"
              placeholder="Nhập mật khẩu"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData((prev: LoginFormData) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
            />
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900"
              id="remember-me"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) =>
                setFormData((prev: LoginFormData) => ({
                  ...prev,
                  rememberMe: e.target.checked,
                }))
              }
            />
            <label
              className="ml-2 block text-sm text-slate-600 dark:text-slate-400"
              htmlFor="remember-me"
            >
              Ghi nhớ đăng nhập
            </label>
          </div>
          <div className="text-sm">
            <button type="button" className="font-medium text-primary hover:underline">
              Quên mật khẩu?
            </button>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}
          </button>
        </div>
      </form>

      {/* Bottom links */}
      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Bạn chưa có tài khoản?{" "}
          <button
            type="button"
            className="font-bold text-slate-900 dark:text-white hover:underline"
          >
            Liên hệ quản trị viên
          </button>
        </p>
      </div>

      {/* Powered by badge */}
      <div className="mt-12 flex justify-center opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-sm">memory</span>
          <span className="text-[10px] uppercase font-bold tracking-widest">
            Powered by RAG AI Technology
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
