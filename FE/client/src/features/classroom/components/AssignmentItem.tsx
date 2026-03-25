// src/features/classroom/components/AssignmentItem.tsx
import {
  ClipboardList,
  Clock,
  CheckCircle,
  ChevronRight,
  Award,
} from "lucide-react";

interface AssignmentProps {
  title: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  score?: string; // Tùy chọn: Chỉ hiển thị khi status là 'graded'
}

export const AssignmentItem = ({
  title,
  dueDate,
  status,
  score,
}: AssignmentProps) => {
  // Cấu hình giao diện theo từng trạng thái
  const statusConfig = {
    pending: {
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      icon: <Clock size={14} />,
      text: "Chưa nộp",
    },
    submitted: {
      color: "text-[#adc6ff]",
      bg: "bg-[#0566d9]/10 border-[#0566d9]/20",
      icon: <CheckCircle size={14} />,
      text: "Đã nộp",
    },
    graded: {
      color: "text-[#4fdbc8]",
      bg: "bg-[#009182]/20 border-[#009182]/30",
      icon: <Award size={14} />,
      text: `Điểm: ${score}`,
    },
  };

  const current = statusConfig[status];

  return (
    <div className="group flex items-center justify-between p-4 bg-[#171f33] rounded-xl border border-slate-800/50 hover:bg-[#222a3d] hover:border-[#adc6ff]/30 transition-all cursor-pointer">
      <div className="flex items-start gap-4">
        {/* Icon bài tập */}
        <div
          className={`mt-1 w-10 h-10 rounded-lg flex items-center justify-center ${current.bg} ${current.color}`}
        >
          <ClipboardList size={20} />
        </div>

        {/* Thông tin */}
        <div>
          <h4 className="text-[#dae2fd] font-bold text-sm group-hover:text-[#adc6ff] transition-colors">
            {title}
          </h4>
          <p className="text-[12px] text-[#798098] mt-1 flex items-center gap-1.5">
            Hạn nộp:{" "}
            <span className="font-semibold text-[#c6c6cd]">{dueDate}</span>
          </p>

          {/* Badge Trạng thái hiển thị trên Mobile hoặc làm điểm nhấn */}
          <div
            className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${current.bg} ${current.color}`}
          >
            {current.icon} {current.text}
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex items-center">
        <button className="w-8 h-8 rounded-full bg-transparent group-hover:bg-[#0566d9]/20 flex items-center justify-center text-slate-500 group-hover:text-[#adc6ff] transition-all">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
