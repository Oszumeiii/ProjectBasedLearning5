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
      className="group bg-[#131b2e] rounded-xl overflow-hidden relative border border-transparent hover:border-indigo-500/20 transition-all duration-300 shadow-lg cursor-pointer"
    >
      <div className="h-24 bg-gradient-to-r from-indigo-900/40 to-slate-900 relative">
        {pendingCount > 0 && (
          <span className="absolute top-4 right-4 bg-red-900/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-red-200 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            {pendingCount} Chờ duyệt
          </span>
        )}
      </div>

      <div className="p-6 -mt-8 relative z-10 bg-[#131b2e]/95 backdrop-blur">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 font-manrope tracking-widest uppercase">
              {code} • {category}
            </span>
            <h4 className="text-xl font-manrope font-bold text-[#dae2fd] mt-1 group-hover:text-indigo-300 transition-colors">
              {name}
            </h4>
          </div>
          <span className="material-symbols-outlined text-indigo-400 bg-[#2d3449] p-2 rounded-lg">
            hub
          </span>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Báo cáo đã nộp</span>
            <span className="font-semibold text-slate-200">
              {reportCount} / {totalStudents} SV
            </span>
          </div>
          <div className="w-full bg-[#2d3449] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#4fdbc8] h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(code);
            }}
            className="text-[10px] font-mono text-slate-400 hover:text-indigo-400 flex items-center gap-1"
          >
            MÃ: {code}{" "}
            <span className="material-symbols-outlined text-xs">
              content_copy
            </span>
          </button>
          <span className="bg-[#222a3d] text-[#dae2fd] px-4 py-2 rounded-lg text-xs font-semibold group-hover:bg-indigo-600 transition-colors flex items-center gap-2">
            Quản lý{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
