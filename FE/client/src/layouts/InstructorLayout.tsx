import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { NotificationBell } from "../components/NotificationBell";

const InstructorLayout = () => {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-claude-sm px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-app-inset text-ink-heading shadow-[inset_3px_0_0_0] shadow-brand"
        : "text-ink-muted hover:bg-app-inset hover:text-ink-heading"
    }`;

  return (
    <div className="flex min-h-screen bg-app text-ink-body">
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-app-line bg-app-card py-6 shadow-whisper">
        <div className="mb-10 px-6">
          <h1 className="font-headline text-xl font-semibold tracking-tight text-ink-heading">Giảng viên</h1>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
            Ban giảng viên
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <NavLink to="/instructor/lobby" className={linkClass}>
            <span className="material-symbols-outlined">newspaper</span>
            Sảnh
          </NavLink>
          <NavLink to="/instructor/courses" className={linkClass}>
            <span className="material-symbols-outlined">school</span>
            Quản lý lớp
          </NavLink>
          <NavLink to="/instructor/grading" className={linkClass}>
            <span className="material-symbols-outlined">analytics</span>
            Chấm bài
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-app-line px-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-app-line bg-app-elevated text-xs font-semibold text-ink-heading">
              {user?.full_name?.charAt(0) || "L"}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-ink-heading">{user?.full_name || "Giảng viên"}</p>
              <p className="truncate text-[10px] text-ink-faint">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-claude-sm py-2 text-sm text-ink-muted transition-colors hover:bg-red-50 hover:text-red-700"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="relative ml-64 flex-1">
        <header className="fixed right-0 top-0 z-40 flex h-16 w-[calc(100%-16rem)] items-center justify-between border-b border-app-line bg-app-card/95 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h2 className="font-headline text-[15px] font-semibold tracking-tight text-ink-heading">
              Không gian làm việc
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 rounded-full border border-app-line bg-app-elevated px-4 py-1.5 text-xs text-ink-muted lg:flex">
              Vai trò: Giảng viên
            </div>
            <NotificationBell />
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-app-line bg-app-elevated text-xs font-semibold text-ink-heading">
              {user?.full_name?.charAt(0) || "L"}
            </div>
          </div>
        </header>

        <div className="px-10 pb-12 pt-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InstructorLayout;
