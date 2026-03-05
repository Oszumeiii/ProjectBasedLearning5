import AuthHeader from "../components/AuthHeader";
import AuthBranding from "../components/AuthBranding";
import AuthFooter from "../components/AuthFooter";
import LoginForm from "../components/LoginForm";
import type { LoginFormData } from "../types/auth.types";

const LoginPage = () => {
  const handleLogin = (data: LoginFormData) => {
    console.log("Login submitted:", data);
    // TODO: gọi authService.login(data)
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#101622", color: "#f1f5f9" }}
    >
      <AuthHeader />

      <main className="flex-1 flex overflow-hidden">
        {/* Left branding */}
        <AuthBranding />

        {/* Right login panel */}
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
