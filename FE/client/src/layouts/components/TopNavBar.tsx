import { useState } from "react";
import { Key, Loader2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { NotificationBell } from "../../components/NotificationBell";
import { joinCourseByJoinCode } from "../../features/classroom/services/course.service";

export const TopNavBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseCode, setCourseCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const handleJoin = async () => {
    const raw = courseCode.trim().toUpperCase().replace(/\s+/g, "");
    if (raw.length < 4) {
      setHint("Nhập mã tham gia (6 ký tự) hoặc mã học phần đầy đủ (ít nhất 4 ký tự).");
      return;
    }
    if (raw.length > 64) {
      setHint("Mã quá dài.");
      return;
    }
    setHint(null);
    setJoining(true);
    try {
      await joinCourseByJoinCode(raw);
      setCourseCode("");
      setHint("Tham gia lớp thành công.");
      navigate("/student/lobby", { replace: true, state: { refreshCourses: Date.now() } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không thể tham gia lớp.";
      setHint(msg);
    } finally {
      setJoining(false);
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-8 sticky top-0 z-40 bg-[#0b1326]/80 backdrop-blur-md h-20 border-b border-slate-800/30">
      <div className="flex items-center gap-8">
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

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#171f33] rounded-full px-4 py-1.5 border border-slate-800/20 focus-within:border-[#0566d9] transition-all">
            <Key size={14} className="text-[#c6c6cd] mr-2 shrink-0" />
            <input
              className="bg-transparent border-none focus:ring-0 text-[12px] min-w-[10rem] max-w-[14rem] sm:max-w-[18rem] font-mono tracking-wide text-[#adc6ff] uppercase placeholder:normal-case placeholder:font-body outline-none"
              placeholder="Mã tham gia hoặc mã học phần"
              maxLength={64}
              value={courseCode}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 64);
                setCourseCode(v);
              }}
              onKeyDown={(e) => e.key === "Enter" && !joining && handleJoin()}
              disabled={joining}
            />
            <button
              type="button"
              onClick={handleJoin}
              disabled={joining || courseCode.trim().replace(/\s+/g, "").length < 4}
              className="ml-2 text-xs font-bold text-[#d8e2ff] bg-[#0566d9]/20 px-3 py-1 rounded-full hover:bg-[#0566d9]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[88px] flex justify-center items-center"
            >
              {joining ? <Loader2 size={14} className="animate-spin" /> : "Tham gia"}
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
        {hint && (
          <p className="text-[11px] text-amber-400/90 max-w-xs text-right leading-snug">{hint}</p>
        )}
      </div>
    </header>
  );
};
