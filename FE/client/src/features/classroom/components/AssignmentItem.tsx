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
}

export const AssignmentItem = ({ title, dueDate, status }: AssignmentProps) => {
  const statusConfig = {
    pending: {
      color: "text-red-700",
      bg: "border-red-200 bg-red-50",
      icon: <Clock size={14} />,
      text: "Chưa nộp",
    },
    submitted: {
      color: "text-brand",
      bg: "border-violet-200 bg-violet-50",
      icon: <CheckCircle size={14} />,
      text: "Đã nộp",
    },
    graded: {
      color: "text-teal-800",
      bg: "border-teal-200 bg-teal-50",
      icon: <Award size={14} />,
      text: "Đã có nhận xét",
    },
  };

  const current = statusConfig[status];

  return (
    <div className="group flex cursor-pointer items-center justify-between rounded-xl border border-app-line bg-app-card p-4 transition-all hover:border-brand/20 hover:bg-app-elevated">
      <div className="flex items-start gap-4">
        <div
          className={`mt-1 flex h-10 w-10 items-center justify-center rounded-lg border ${current.bg} ${current.color}`}
        >
          <ClipboardList size={20} />
        </div>

        <div>
          <h4 className="text-sm font-bold text-ink-heading transition-colors group-hover:text-brand">
            {title}
          </h4>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-muted">
            Hạn nộp: <span className="font-semibold text-ink-body">{dueDate}</span>
          </p>

          <div
            className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${current.bg} ${current.color}`}
          >
            {current.icon} {current.text}
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-ink-muted transition-all group-hover:bg-brand/10 group-hover:text-brand"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
