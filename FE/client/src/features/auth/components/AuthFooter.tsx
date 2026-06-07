const AuthFooter = () => {
  return (
    <footer className="border-t border-app-line bg-app-card px-6 py-6 text-center lg:text-left">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-xs text-ink-muted">© 2024 Hệ thống Quản lý NCKH Thông minh. All rights reserved.</p>
        <div className="flex gap-6">
          <button type="button" className="text-xs text-ink-muted transition-colors hover:text-brand">
            Chính sách bảo mật
          </button>
          <button type="button" className="text-xs text-ink-muted transition-colors hover:text-brand">
            Điều khoản sử dụng
          </button>
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;
