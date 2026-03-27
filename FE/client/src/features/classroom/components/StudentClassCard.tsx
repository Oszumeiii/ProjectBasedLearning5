import { MoreVertical, User, Users, Calendar } from "lucide-react";
import { Course } from "../types";

interface ClassCardProps {
  course: Course;
  onClick?: (id: number) => void;
}

export const ClassCard = ({ course, onClick }: ClassCardProps) => {
  return (
    <div className="group relative p-1 rounded-2xl transition-all duration-300 hover:bg-gradient-to-br hover:from-[#adc6ff]/30 hover:to-[#4fdbc8]/30">
      <div className="h-full bg-[#131b2e] rounded-[calc(1rem-2px)] p-6 flex flex-col border border-slate-800/50">
        <div className="flex justify-between items-start mb-4">
          <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#009182]/20 text-[#4fdbc8] flex items-center gap-1">
            Active
          </div>
          <button className="text-slate-400 hover:text-white">
            <MoreVertical size={18} />
          </button>
        </div>

        <h5 className="font-headline text-lg font-bold text-[#dae2fd] group-hover:text-[#adc6ff] transition-colors line-clamp-2 h-14">
          {course.name}
        </h5>

        <div className="space-y-2 mt-2">
          <p className="text-sm text-[#c6c6cd] flex items-center gap-2">
            <User size={14} /> {course.lecturer_name}
          </p>
          <p className="text-sm text-[#c6c6cd] flex items-center gap-2">
            <Users size={14} /> {course.student_count} Students
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c6c6cd]">Created At</span>
            <span className="font-bold text-[#dae2fd]">
              {new Date(course.created_at).toLocaleDateString()}
            </span>
          </div>
          <button
            onClick={() => onClick?.(course.id)}
            className="w-full mt-2 py-2.5 rounded-lg bg-[#2d3449] text-[#dae2fd] font-bold text-sm hover:bg-[#0566d9] hover:text-white transition-all"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
