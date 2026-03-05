const AuthFooter = () => {
  return (
    <footer className="py-6 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark text-center lg:text-left">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500">
          © 2024 Hệ thống Quản lý NCKH Thông minh. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a
            className="text-xs text-slate-500 hover:text-primary transition-colors"
            href="#"
          >
            Chính sách bảo mật
          </a>
          <a
            className="text-xs text-slate-500 hover:text-primary transition-colors"
            href="#"
          >
            Điều khoản sử dụng
          </a>
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;
