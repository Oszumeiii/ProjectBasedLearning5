import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import { NotificationBell } from "../components/NotificationBell";

const InstructorLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#0b1326] text-[#dae2fd]">
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-950 flex flex-col py-6 z-50 border-r border-slate-900">
        <div className="px-6 mb-10">
          <h1 className="text-indigo-400 font-bold text-xl tracking-tight font-manrope">
            Giảng viên
          </h1>
          <p className="text-[10px] text-slate-500 font-manrope uppercase tracking-widest mt-1">
            Ban giảng viên
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavLink
            to="/instructor/lobby"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`
            }
          >
            <span className="material-symbols-outlined">newspaper</span>
            Sảnh
          </NavLink>
          <NavLink
            to="/instructor/courses"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`
            }
          >
            <span className="material-symbols-outlined">school</span>
            Quản lý lớp
          </NavLink>
          <NavLink
            to="/instructor/grading"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`
            }
          >
            <span className="material-symbols-outlined">analytics</span>
            Chấm bài
          </NavLink>
          <NavLink
            to="/instructor/schedule"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`
            }
          >
            <span className="material-symbols-outlined">calendar_month</span>
            Lịch
          </NavLink>
        </nav>

        <div className="px-6 pt-6 border-t border-slate-900 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-900 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
              {user?.full_name?.charAt(0) || "L"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-slate-100 truncate">
                {user?.full_name || "Giảng viên"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email}
              </p>
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
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-100 font-bold font-manrope tracking-tight">
              Không gian làm việc
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-[#171f33] px-4 py-1.5 rounded-full border border-slate-800 text-xs">
              <span className="text-indigo-400">Vai trò: Giảng viên</span>
            </div>
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
              {user?.full_name?.charAt(0) || "L"}
            </div>
          </div>
        </header>

        <div className="pt-24 px-10 pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InstructorLayout;
