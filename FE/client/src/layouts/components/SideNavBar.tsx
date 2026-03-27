// src/layouts/components/SideNavBar.tsx
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Settings,
  HelpCircle,
  Plus,
  Group,
  User,
  Link,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export const SideNavBar = () => (
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
        to={"lobby"}
        className="flex items-center gap-3 p-3 text-sm font-semibold rounded-lg bg-[#0566d9]/10 text-[#adc6ff] border-r-2 border-[#0566d9]"
      >
        <User size={18} /> <span>Nhóm</span>
      </NavLink>
      <NavLink
        to={"schedule"}
        className="flex items-center gap-3 p-3 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
      >
        <Calendar size={18} /> <span>Lịch</span>
      </NavLink>
      <NavLink
        to={"assignment"}
        className="flex items-center gap-3 p-3 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
      >
        <ClipboardList size={18} /> <span>Bài tập</span>
      </NavLink>
    </nav>

    <div className="p-4 space-y-2 border-t border-slate-800/50">
      {/* <button className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-tr from-[#adc6ff] to-[#0566d9] text-[#001a42] font-bold rounded-xl shadow-lg active:scale-95 transition-all">
        <Plus size={16} /> New Research
      </button> */}
      <a
        href="#"
        className="flex items-center gap-3 p-3 text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
      >
        <Settings size={18} /> <span>Settings</span>
      </a>
    </div>
  </aside>
);
