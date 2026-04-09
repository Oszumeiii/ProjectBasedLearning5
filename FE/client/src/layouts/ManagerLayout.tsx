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
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? isAdmin
          ? "bg-violet-600/20 text-violet-300 border-r-2 border-violet-500"
          : "bg-amber-600/20 text-amber-400 border-r-2 border-amber-500"
        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
    }`;

  const showManagerUsers = !isAdmin && access.managerCanViewUsers;
  const showManagerAccess = !isAdmin && access.managerCanViewAccessSettings;
  /** Import CSV + gửi mail: cùng quyền xem người dùng (Admin luôn có). */
  const showManagerImport = showManagerUsers;

  return (
    <div className="flex min-h-screen bg-[#0b1326] text-[#dae2fd]">
      <aside
        className={`h-screen w-64 fixed left-0 top-0 bg-slate-950 flex flex-col py-6 z-50 border-r border-slate-900 ${
          isAdmin ? "border-l-4 border-l-violet-500" : "border-l-4 border-l-amber-500/90"
        }`}
      >
        <div className="px-6 mb-6">
          <h1
            className={`font-bold text-xl tracking-tight font-manrope ${
              isAdmin ? "text-violet-400" : "text-amber-400"
            }`}
          >
            {isAdmin ? "Quản trị hệ thống" : "Quản lý vận hành"}
          </h1>
          <p className="text-[10px] text-slate-500 font-manrope uppercase tracking-widest mt-1">
            {isAdmin ? "Cấp cao — phân quyền & người dùng" : "Theo dõi lớp & báo cáo"}
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
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
              <p className="px-4 pt-6 pb-1 text-[10px] font-bold uppercase tracking-widest text-violet-500/90">
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
              <p className="px-4 pt-6 pb-1 text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
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

        <div className="px-6 pt-6 border-t border-slate-900 mt-auto">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold ${
                isAdmin
                  ? "bg-violet-950 border-violet-500/40 text-violet-300"
                  : "bg-amber-900 border-amber-500/30 text-amber-200"
              }`}
            >
              {user?.full_name?.charAt(0) || "M"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 relative">
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-xl border-b border-slate-900/80">
          <div>
            <h2 className="text-slate-100 font-bold font-manrope tracking-tight">
              {isAdmin ? "Không gian quản trị" : "Không gian quản lý"}
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {isAdmin
                ? "Toàn quyền cấu hình — phân cấp trên Quản lý"
                : "Vận hành hàng ngày — không chỉnh phân quyền (trừ khi được ủy quyền)"}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div
              className={`hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs ${
                isAdmin
                  ? "bg-violet-950/50 border-violet-500/30 text-violet-300"
                  : "bg-amber-950/30 border-amber-500/20 text-amber-400"
              }`}
            >
              {isAdmin ? "Vai trò: Admin" : "Vai trò: Quản lý"}
            </div>
            <NotificationBell />
          </div>
        </header>

        <div className="pt-24 px-10 pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ManagerLayout;
