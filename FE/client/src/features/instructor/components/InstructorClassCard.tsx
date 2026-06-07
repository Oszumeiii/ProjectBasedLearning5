import React from "react";
import { useNavigate } from "react-router-dom";

interface InstructorClassCardProps {
  courseId: number;
  code: string;
  name: string;
  category: string;
  reportCount: number;
  totalStudents: number;
  pendingCount: number;
}

export const InstructorClassCard: React.FC<InstructorClassCardProps> = ({
  courseId,
  code,
  name,
  category,
  reportCount,
  totalStudents,
  pendingCount,
}) => {
  const navigate = useNavigate();
  const progress = totalStudents > 0 ? (reportCount / totalStudents) * 100 : 0;

  return (
    <div
      onClick={() => navigate(`/instructor/class/${courseId}`)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-app-line bg-app-card shadow-whisper transition-all duration-300 hover:border-brand/25 hover:shadow-md"
    >
      <div className="relative h-24 bg-gradient-to-r from-brand/15 to-app-inset">
        {pendingCount > 0 && (
          <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-warn-pending/30 bg-warn-pendingBg px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-warn-on">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warn-pending" />
            {pendingCount} Chờ duyệt
          </span>
        )}
      </div>

      <div className="relative z-10 -mt-8 bg-app-card/98 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
              {code} • {category}
            </span>
            <h4 className="mt-1 text-xl font-bold text-ink-heading transition-colors group-hover:text-brand">
              {name}
            </h4>
          </div>
          <span className="material-symbols-outlined rounded-lg bg-brand/10 p-2 text-brand">
            hub
          </span>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Báo cáo đã nộp</span>
            <span className="font-semibold text-ink-heading">
              {reportCount} / {totalStudents} SV
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-app-track">
            <div
              className="h-full rounded-full bg-mint transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-app-line pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(code);
            }}
            className="flex items-center gap-1 font-mono text-[10px] text-ink-muted hover:text-brand"
          >
            MÃ: {code}{" "}
            <span className="material-symbols-outlined text-xs">content_copy</span>
          </button>
          <span className="flex items-center gap-2 rounded-lg bg-app-inset px-4 py-2 text-xs font-semibold text-ink-heading transition-colors group-hover:bg-brand group-hover:text-white">
            Quản lý{" "}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
};
