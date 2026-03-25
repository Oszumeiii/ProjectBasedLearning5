// src/features/classroom/components/ClassCard.tsx
import { MoreVertical, User, CheckCircle, History, Star } from "lucide-react";

interface ClassProps {
  title: string;
  teacher: string;
  status: "pending" | "submitted" | "graded";
  deadline: string;
  progress: number;
}

export const ClassCard = ({
  title,
  teacher,
  status,
  deadline,
  progress,
}: ClassProps) => {
  const statusStyles = {
    pending: "bg-red-500/20 text-red-400",
    submitted: "bg-blue-500/20 text-blue-400",
    graded: "bg-[#009182]/20 text-[#4fdbc8]",
  };

  return (
    <div className="group relative p-1 rounded-2xl transition-all duration-300 hover:bg-gradient-to-br hover:from-[#adc6ff]/30 hover:to-[#4fdbc8]/30">
      <div className="h-full bg-[#131b2e] rounded-[calc(1rem-2px)] p-6 flex flex-col border border-slate-800/50">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${statusStyles[status]}`}
          >
            {status === "pending" ? (
              <History size={12} />
            ) : status === "submitted" ? (
              <CheckCircle size={12} />
            ) : (
              <Star size={12} />
            )}
            {status === "pending"
              ? "Not Submitted"
              : status === "submitted"
                ? "Submitted"
                : "Graded: A+"}
          </div>
          <button className="text-slate-400 hover:text-white">
            <MoreVertical size={18} />
          </button>
        </div>

        <h5 className="font-headline text-lg font-bold text-[#dae2fd] group-hover:text-[#adc6ff] transition-colors line-clamp-2 h-14">
          {title}
        </h5>

        <p className="text-sm text-[#c6c6cd] flex items-center gap-2 mt-1">
          <User size={14} /> {teacher}
        </p>

        <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c6c6cd]">Next Milestone</span>
            <span
              className={`font-bold ${status === "pending" ? "text-red-400" : "text-[#dae2fd]"}`}
            >
              {deadline}
            </span>
          </div>
          <div className="w-full h-1 bg-[#171f33] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${status === "pending" ? "bg-red-500" : "bg-[#adc6ff]"}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button className="w-full mt-2 py-2.5 rounded-lg bg-[#2d3449] text-[#dae2fd] font-bold text-sm hover:bg-[#0566d9] hover:text-white transition-all">
            Open Course
          </button>
        </div>
      </div>
    </div>
  );
};
