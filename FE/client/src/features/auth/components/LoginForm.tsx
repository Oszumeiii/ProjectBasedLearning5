import { useState, FormEvent } from "react";
import type { LoginFormData, Role } from "../types/auth.types";
import RoleSelector from "./RoleSelector";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
}

const fieldClass =
  "block w-full rounded-claude border border-app-line bg-white py-3 pl-10 pr-4 text-sm text-ink-heading placeholder:text-ink-faint shadow-whisper transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

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
      <div className="mb-10 text-center lg:text-left">
        <h2 className="mb-2 font-headline text-3xl font-semibold text-ink-heading">Chào mừng trở lại</h2>
        <p className="text-ink-muted">Vui lòng chọn vai trò và đăng nhập để tiếp tục</p>
      </div>

      <RoleSelector
        selectedRole={formData.role}
        onChange={(role: Role) => setFormData((prev: LoginFormData) => ({ ...prev, role }))}
      />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-ink-muted" htmlFor="identifier">
            Email hoặc Mã số
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-symbols-outlined text-xl text-ink-faint">alternate_email</span>
            </div>
            <input
              className={fieldClass}
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

        <div>
          <label className="mb-1.5 block text-xs font-medium tracking-wide text-ink-muted" htmlFor="password">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-symbols-outlined text-xl text-ink-faint">lock</span>
            </div>
            <input
              className={`${fieldClass} pr-10`}
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
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-faint hover:text-ink-muted"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              className="h-4 w-4 rounded border-app-line text-brand focus:ring-brand/30"
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
            <label className="ml-2 block text-sm text-ink-muted" htmlFor="remember-me">
              Ghi nhớ đăng nhập
            </label>
          </div>
          <div className="text-sm">
            <button type="button" className="font-medium text-brand hover:underline">
              Quên mật khẩu?
            </button>
          </div>
        </div>

        <div>
          <button
            className="flex w-full justify-center rounded-claude border border-transparent bg-brand py-3.5 px-4 text-base font-semibold text-white shadow-whisper transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/35 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập hệ thống"}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-app-line pt-8 text-center">
        <p className="text-sm text-ink-muted">
          Bạn chưa có tài khoản?{" "}
          <button type="button" className="font-semibold text-ink-heading hover:underline">
            Liên hệ quản trị viên
          </button>
        </p>
      </div>

      <div className="mt-12 flex justify-center opacity-80 transition-opacity hover:opacity-100">
        <div className="flex items-center gap-2 rounded-claude-sm border border-app-line bg-app-elevated px-3 py-1.5 shadow-whisper">
          <span className="material-symbols-outlined text-sm text-ink-faint">memory</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-ink-muted">
            Powered by RAG AI Technology
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
