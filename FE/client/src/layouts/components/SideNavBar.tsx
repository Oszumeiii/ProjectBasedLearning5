import { BookOpen, ClipboardList, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";

export const SideNavBar = () => {
  const { user, logout } = useAuth();

  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-claude-sm p-3 text-sm font-medium transition-all ${
      isActive
        ? "bg-app-inset text-ink-heading shadow-[inset_3px_0_0_0] shadow-brand"
        : "text-ink-muted hover:bg-app-inset hover:text-ink-heading"
    }`;

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-app-line bg-app-card shadow-whisper">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-claude-sm bg-brand shadow-whisper">
            <BookOpen className="text-white" size={22} />
          </div>
          <div>
            <h1 className="font-headline text-base font-semibold leading-tight tracking-tight text-ink-heading">
              Trung tâm nghiên cứu
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-ink-faint">
              Hệ thống RAG thông minh
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-4">
        <NavLink to="lobby" className={itemClass}>
          <span className="material-symbols-outlined text-lg">group</span>
          Nhóm
        </NavLink>
        <NavLink to="library" className={itemClass}>
          <ClipboardList size={18} strokeWidth={2} /> Tài liệu
        </NavLink>
      </nav>

      <div className="space-y-2 border-t border-app-line p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-app-line bg-app-elevated text-xs font-semibold text-ink-heading">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-ink-heading">{user?.full_name || "Sinh viên"}</p>
            <p className="truncate text-[10px] text-ink-faint">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-claude-sm p-3 text-sm font-medium text-ink-muted transition-all hover:bg-red-50 hover:text-red-700"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Đăng xuất
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-claude-sm p-3 text-left text-sm font-medium text-ink-muted transition-all hover:bg-app-inset hover:text-ink-heading"
        >
          <Settings size={18} strokeWidth={2} /> Settings
        </button>
      </div>
    </aside>
  );
};
