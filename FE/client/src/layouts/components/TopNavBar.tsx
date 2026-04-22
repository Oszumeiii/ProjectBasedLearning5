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

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-all pb-1 ${
      isActive
        ? "border-b-2 border-brand text-ink-heading"
        : "border-b-2 border-transparent text-ink-muted hover:text-ink-body"
    }`;

  return (
    <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between border-b border-app-line bg-app-card/95 px-8 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/student/lobby" className={tabClass}>
            Tổng quan về lớp học
          </NavLink>

          <NavLink to="/student/library" className={tabClass}>
            Tài liệu tham khảo
          </NavLink>
        </nav>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-app-line bg-app-elevated px-4 py-1.5 transition-all focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/15">
            <Key size={14} className="mr-2 shrink-0 text-ink-faint" />
            <input
              className="min-w-[10rem] max-w-[14rem] border-none bg-transparent font-mono text-xs uppercase tracking-wide text-ink-heading outline-none placeholder:normal-case placeholder:font-sans placeholder:text-ink-faint sm:max-w-[18rem]"
              placeholder="Mã tham gia hoặc mã học phần"
              maxLength={64}
              value={courseCode}
              onChange={(e) => {
                const v = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 64);
                setCourseCode(v);
              }}
              onKeyDown={(e) => e.key === "Enter" && !joining && void handleJoin()}
              disabled={joining}
            />
            <button
              type="button"
              onClick={() => void handleJoin()}
              disabled={joining || courseCode.trim().replace(/\s+/g, "").length < 4}
              className="ml-2 flex min-w-[88px] items-center justify-center rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {joining ? <Loader2 size={14} className="animate-spin" /> : "Tham gia"}
            </button>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <NotificationBell />
            <div className="ml-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-app-line bg-app-elevated text-sm font-semibold text-ink-heading">
                {user?.full_name?.charAt(0) || "U"}
              </div>
              <span className="hidden text-sm text-ink-body lg:inline">{user?.full_name}</span>
            </div>
          </div>
        </div>
        {hint ? (
          <p className="max-w-xs text-right text-[11px] leading-snug text-amber-700">{hint}</p>
        ) : null}
      </div>
    </header>
  );
};
