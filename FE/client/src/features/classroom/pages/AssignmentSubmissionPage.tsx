// src/features/classroom/pages/AssignmentSubmissionPage.tsx
import { InstructionCard } from "../components/InstructionCard";
import { SubmissionZone } from "../components/SubmissionZone";
import { Clock, AlertCircle, ChevronLeft } from "lucide-react";

export const AssignmentSubmissionPage = () => {
  const assignmentDetail = {
    title: "Báo cáo Tiến độ Sprint 1 - Thiết kế Database",
    course: "Project Based Learning 5 (PBL5)",
    deadline: "28/03/2026, 23:59",
    status: "Chưa nộp",
    description: `Yêu cầu các nhóm hoàn thiện:
    1. Sơ đồ thực thể mối quan hệ (ERD).
    2. Thiết kế các bảng trên Supabase.
    3. Mô tả các API chính sẽ sử dụng.
    Lưu ý: Nộp file PDF hoặc link GitHub.`,
  };

  return (
    <div className="min-h-screen bg-[#0b1326] animate-in fade-in duration-500 pb-12">
      {/* Header điều hướng ngược lại */}
      <div className="bg-[#131b2e] border-b border-slate-800/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button className="p-2 hover:bg-[#1c253d] rounded-lg text-slate-400 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-[#dae2fd] font-bold">
              {assignmentDetail.title}
            </h2>
            <p className="text-xs text-[#798098]">{assignmentDetail.course}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái (2/3): Thông tin chi tiết bài tập */}
        <div className="lg:col-span-2 space-y-6">
          <InstructionCard description={assignmentDetail.description} />
        </div>

        {/* Cột phải (1/3): Trạng thái nộp bài và Upload */}
        <div className="space-y-6">
          {/* Card trạng thái nhanh */}
          <div className="p-6 rounded-2xl bg-[#1c253d] border border-slate-700/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 text-sm italic">Trạng thái:</span>
              <span className="text-red-400 text-sm font-bold flex items-center gap-1">
                <AlertCircle size={14} /> {assignmentDetail.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[#dae2fd]">
              <Clock className="text-[#adc6ff]" size={20} />
              <div>
                <p className="text-xs text-slate-400">Hạn chót còn lại:</p>
                <p className="text-sm font-bold">2 ngày 10 giờ nữa</p>
              </div>
            </div>
          </div>

          <SubmissionZone />
        </div>
      </div>
    </div>
  );
};
