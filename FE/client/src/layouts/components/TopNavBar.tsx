import { Key } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { NotificationBell } from "../../components/NotificationBell";

export const TopNavBar = () => {
  const { user } = useAuth();

  return (
    <header className="flex justify-between items-center w-full px-8 sticky top-0 z-40 bg-[#0b1326]/80 backdrop-blur-md h-20 border-b border-slate-800/30">
      <div className="flex items-center gap-8">
        {/* <h2 className="font-headline font-black text-xl text-[#dae2fd]">
          Trang sinh viên
        </h2> */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/student/lobby"
            className={({ isActive }) =>
              `font-manrope font-bold text-sm transition-all pb-1 ${
                isActive
                  ? "text-[#adc6ff] border-b-2 border-[#0566d9]"
                  : "text-slate-400 hover:text-[#adc6ff]"
              }`
            }
          >
            Tổng quan về lớp học
          </NavLink>

          <NavLink
            to="/student/library"
            className={({ isActive }) =>
              `font-manrope font-bold text-sm transition-all pb-1 ${
                isActive
                  ? "text-[#adc6ff] border-b-2 border-[#0566d9]"
                  : "text-slate-400 hover:text-[#adc6ff]"
              }`
            }
          >
            Tài liệu tham khảo
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-[#171f33] rounded-full px-4 py-1.5 border border-slate-800/20 focus-within:border-[#0566d9] transition-all">
          <Key size={14} className="text-[#c6c6cd] mr-2" />
          <input
            className="bg-transparent border-none focus:ring-0 text-[12px] w-32 font-mono tracking-widest text-[#adc6ff] uppercase placeholder:normal-case placeholder:font-body"
            placeholder="Nhập mã lớp học"
            maxLength={6}
          />
          <button className="ml-2 text-xs font-bold text-[#d8e2ff] bg-[#0566d9]/20 px-3 py-1 rounded-full hover:bg-[#0566d9]/40 transition-colors">
            Tham gia
          </button>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <NotificationBell />
          <div className="flex items-center gap-2 ml-2">
            <div className="w-10 h-10 rounded-full border-2 border-[#0566d9]/30 bg-indigo-900 flex items-center justify-center text-sm font-bold text-indigo-300">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <span className="text-sm text-slate-300 hidden lg:inline">
              {user?.full_name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
