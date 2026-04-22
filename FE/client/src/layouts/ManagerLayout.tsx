import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { useAccessControl } from "../context/AccessControlContext";
import { NotificationBell } from "../components/NotificationBell";

const ManagerLayout = () => {
  const { user, logout } = useAuth();
  const { access } = useAccessControl();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-claude-sm px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-app-inset text-ink-heading shadow-[inset_3px_0_0_0] shadow-brand"
        : "text-ink-muted hover:bg-app-inset hover:text-ink-heading"
    }`;

  const showManagerUsers = !isAdmin && access.managerCanViewUsers;
  const showManagerAccess = !isAdmin && access.managerCanViewAccessSettings;
  const showManagerImport = showManagerUsers;

  return (
    <div className="flex min-h-screen bg-app text-ink-body">
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-app-line bg-app-card py-6 shadow-whisper ${
          isAdmin ? "border-l-4 border-l-brand" : "border-l-4 border-l-mint"
        }`}
      >
        <div className="mb-6 px-6">
          <h1 className="font-headline text-xl font-semibold tracking-tight text-ink-heading">
            {isAdmin ? "Quản trị hệ thống" : "Quản lý vận hành"}
          </h1>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
            {isAdmin ? "Cấp cao — phân quyền & người dùng" : "Theo dõi lớp & báo cáo"}
          </p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          <p className="px-4 pb-1 pt-2 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
            Vận hành
          </p>
          <NavLink to="lobby" className={navClass} end>
            <span className="material-symbols-outlined text-lg">dashboard</span>
            Tổng quan
          </NavLink>
          <NavLink to="courses" className={navClass}>
            <span className="material-symbols-outlined text-lg">school</span>
            Khóa học
          </NavLink>
          <NavLink to="reports" className={navClass}>
            <span className="material-symbols-outlined text-lg">description</span>
            Báo cáo
          </NavLink>

          {isAdmin && (
            <>
              <p className="px-4 pb-1 pt-6 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
                Hệ thống &amp; bảo mật
              </p>
              <NavLink to="import-students" className={navClass}>
                <span className="material-symbols-outlined text-lg">upload_file</span>
                Import sinh viên (CSV)
              </NavLink>
              <NavLink to="users" className={navClass}>
                <span className="material-symbols-outlined text-lg">group</span>
                Người dùng
              </NavLink>
              <NavLink to="access" className={navClass}>
                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                Phân quyền truy cập
              </NavLink>
            </>
          )}

          {!isAdmin && (showManagerUsers || showManagerAccess) && (
            <>
              <p className="px-4 pb-1 pt-6 text-[10px] font-medium uppercase tracking-widest text-ink-faint">
                Được Admin ủy quyền
              </p>
              {showManagerUsers && (
                <NavLink to="users" className={navClass}>
                  <span className="material-symbols-outlined text-lg">group</span>
                  Người dùng
                </NavLink>
              )}
              {showManagerImport && (
                <NavLink to="import-students" className={navClass}>
                  <span className="material-symbols-outlined text-lg">upload_file</span>
                  Import sinh viên (CSV)
                </NavLink>
              )}
              {showManagerAccess && (
                <NavLink to="access" className={navClass}>
                  <span className="material-symbols-outlined text-lg">
                    admin_panel_settings
                  </span>
                  Phân quyền (xem)
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="mt-auto border-t border-app-line px-6 pt-6">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold ${
                isAdmin
                  ? "border-app-line bg-app-elevated text-ink-heading"
                  : "border-app-line bg-app-elevated text-ink-heading"
              }`}
            >
              {user?.full_name?.charAt(0) || "M"}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-ink-heading">{user?.full_name || "User"}</p>
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
          <div>
            <h2 className="font-headline text-[15px] font-semibold tracking-tight text-ink-heading">
              {isAdmin ? "Không gian quản trị" : "Không gian quản lý"}
            </h2>
            <p className="mt-0.5 text-[10px] text-ink-faint">
              {isAdmin
                ? "Toàn quyền cấu hình — phân cấp trên Quản lý"
                : "Vận hành hàng ngày — không chỉnh phân quyền (trừ khi được ủy quyền)"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div
              className={`hidden items-center gap-2 rounded-full border px-4 py-1.5 text-xs lg:flex ${
                isAdmin
                  ? "border-app-line bg-app-elevated text-ink-muted"
                  : "border-app-line bg-app-elevated text-ink-muted"
              }`}
            >
              {isAdmin ? "Vai trò: Admin" : "Vai trò: Quản lý"}
            </div>
            <NotificationBell />
          </div>
        </header>

        <div className="px-10 pb-12 pt-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;
