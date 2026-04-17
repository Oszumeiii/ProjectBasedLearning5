import { BookOpen, ClipboardList, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

export const SideNavBar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col h-screen w-64 sticky top-0 bg-[#131b2e] border-r border-slate-800/50 shadow-2xl">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0566d9] flex items-center justify-center shadow-lg shadow-[#0566d9]/20">
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-headline text-[#adc6ff] font-bold tracking-tighter text-xl leading-tight text-[16px]">
              Trung tâm nghiên cứu
            </h1>
            <p className="text-[10px] text-[#798098] font-medium uppercase tracking-widest">
              Hệ thống RAG thông minh
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavLink
          to="lobby"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 text-sm font-semibold rounded-lg transition-all ${
              isActive
                ? "bg-[#0566d9]/10 text-[#adc6ff] border-r-2 border-[#0566d9]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`
          }
        >
          <span className="material-symbols-outlined text-lg">group</span>
          Nhóm
        </NavLink>
        <NavLink
          to="library"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 text-sm font-semibold transition-all rounded-lg ${
              isActive
                ? "bg-[#0566d9]/10 text-[#adc6ff] border-r-2 border-[#0566d9]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            }`
          }
        >
          <ClipboardList size={18} /> Tài liệu
        </NavLink>
      </nav>

      <div className="p-4 space-y-2 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-indigo-900 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-slate-100 truncate">
              {user?.full_name || "Sinh viên"}
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all rounded-lg"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Đăng xuất
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 p-3 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all rounded-lg text-left"
        >
          <Settings size={18} /> Settings
        </button>
      </div>
    </aside>
  );
};
