import { MoreVertical, User, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Course } from "../services/course.service";

interface ClassCardProps {
  course: Course;
}

const courseTypeLabel: Record<string, string> = {
  project: "Đồ án",
  thesis: "Khóa luận",
  research: "Nghiên cứu",
  internship: "Thực tập",
};

const courseTypeStyle: Record<string, string> = {
  project: "bg-blue-500/20 text-blue-400",
  thesis: "bg-amber-500/20 text-amber-400",
  research: "bg-purple-500/20 text-purple-400",
  internship: "bg-green-500/20 text-green-400",
};

const enrollmentBadge: Record<string, { label: string; style: string; canEnter: boolean }> = {
  active: {
    label: "Đang học",
    style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    canEnter: true,
  },
  completed: {
    label: "Đã hoàn thành",
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    canEnter: true,
  },
  failed: {
    label: "Không đạt",
    style: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    canEnter: true,
  },
  pending: {
    label: "Chờ duyệt",
    style: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    canEnter: false,
  },
  rejected: {
    label: "Bị từ chối",
    style: "bg-red-500/10 text-red-400 border-red-500/20",
    canEnter: false,
  },
  dropped: {
    label: "Đã rời lớp",
    style: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    canEnter: false,
  },
};

export const ClassCard = ({ course }: ClassCardProps) => {
  const navigate = useNavigate();
  const enrollmentStatus = (course.enrollment_status || "active").toLowerCase();
  const enrollment =
    enrollmentBadge[enrollmentStatus] || {
      label: enrollmentStatus,
      style: "bg-slate-500/10 text-slate-300 border-slate-500/20",
      canEnter: false,
    };

  return (
    <div className="group relative p-1 rounded-2xl transition-all duration-300 hover:bg-gradient-to-br hover:from-[#adc6ff]/30 hover:to-[#4fdbc8]/30">
      <div className="h-full bg-[#131b2e] rounded-[calc(1rem-2px)] p-6 flex flex-col border border-slate-800/50">
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="flex flex-wrap gap-2">
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${courseTypeStyle[course.course_type] || courseTypeStyle.project}`}
            >
              <BookOpen size={12} />
              {courseTypeLabel[course.course_type] || course.course_type}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-[10px] font-bold border ${enrollment.style}`}
            >
              {enrollment.label}
            </div>
          </div>
          <button className="text-slate-400 hover:text-white">
            <MoreVertical size={18} />
          </button>
        </div>

        <h5 className="font-headline text-lg font-bold text-[#dae2fd] group-hover:text-[#adc6ff] transition-colors line-clamp-2 h-14">
          {course.name}
        </h5>

        <p className="text-sm text-[#c6c6cd] flex items-center gap-2 mt-1">
          <User size={14} /> {course.lecturer_name || "Chưa phân công"}
        </p>

        <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c6c6cd]">Mã lớp</span>
            <span className="font-bold font-mono text-[#adc6ff]">
              {course.code}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c6c6cd]">Học kỳ</span>
            <span className="font-bold text-[#dae2fd]">
              {course.semester} - {course.academic_year}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#c6c6cd]">Sinh viên</span>
            <span className="font-bold text-[#4fdbc8]">
              {course.student_count} SV
            </span>
          </div>
          <button
            onClick={() => {
              if (!enrollment.canEnter) return;
              navigate(`/student/class/${course.id}`);
            }}
            disabled={!enrollment.canEnter}
            className="w-full mt-2 py-2.5 rounded-lg bg-[#2d3449] text-[#dae2fd] font-bold text-sm hover:bg-[#0566d9] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2d3449]"
          >
            {enrollment.canEnter ? "Vào lớp học" : "Chưa thể truy cập"}
          </button>
        </div>
      </div>
    </div>
  );
};
