import React from "react";
import { Outlet, Link } from "react-router-dom";
import { NavLink } from "react-router-dom";

const InstructorLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0b1326] text-[#dae2fd]">
      {/* SideNavBar */}
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
          <Link
            to="/instructor/lobby"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-600/20 text-indigo-400 border-r-2 border-indigo-500 font-medium text-sm"
          >
            <span className="material-symbols-outlined">newspaper</span>
            <NavLink to={"lobby"}>Sảnh</NavLink>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors text-sm">
            <span className="material-symbols-outlined">analytics</span>
            <NavLink to={"grading"}>Chấm bài</NavLink>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors text-sm">
            <span className="material-symbols-outlined">settings</span>
            <span>RAG Settings</span>
          </button>
        </nav>

        <div className="px-6 pt-6 border-t border-slate-900 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-900 border border-indigo-500/30 flex items-center justify-center text-xs">
              JV
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-100 truncate">
                Dr. Julian Voss
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Senior Instructor
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 relative">
        {/* TopNavBar */}
        <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-100 font-bold font-manrope tracking-tight">
              Không gian làm việc
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-[#171f33] px-4 py-1.5 rounded-full border border-slate-800 text-xs">
              <span className="text-indigo-400">Vai trò:Giảng viên</span>
            </div>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-white">
              notifications
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"></div>
          </div>
        </header>

        {/* Nơi render các trang con (Lobby, v.v.) */}
        <div className="pt-24 px-10 pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default InstructorLayout;
