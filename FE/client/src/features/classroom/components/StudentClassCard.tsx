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
  project: "bg-blue-100 text-blue-800",
  thesis: "bg-amber-100 text-amber-900",
  research: "bg-violet-100 text-violet-900",
  internship: "bg-emerald-100 text-emerald-900",
};

const enrollmentBadge: Record<string, { label: string; style: string; canEnter: boolean }> = {
  active: {
    label: "Đang học",
    style: "border-emerald-200 bg-emerald-50 text-emerald-900",
    canEnter: true,
  },
  completed: {
    label: "Đã hoàn thành",
    style: "border-blue-200 bg-blue-50 text-blue-900",
    canEnter: true,
  },
  failed: {
    label: "Không đạt",
    style: "border-rose-200 bg-rose-50 text-rose-900",
    canEnter: true,
  },
  pending: {
    label: "Chờ duyệt",
    style: "border-amber-200 bg-amber-50 text-amber-900",
    canEnter: false,
  },
  rejected: {
    label: "Bị từ chối",
    style: "border-red-200 bg-red-50 text-red-800",
    canEnter: false,
  },
  dropped: {
    label: "Đã rời lớp",
    style: "border-app-line bg-app-inset text-ink-muted",
    canEnter: false,
  },
};

export const ClassCard = ({ course }: ClassCardProps) => {
  const navigate = useNavigate();
  const enrollmentStatus = (course.enrollment_status || "active").toLowerCase();
  const enrollment = enrollmentBadge[enrollmentStatus] || {
    label: enrollmentStatus,
    style: "border-app-line bg-app-inset text-ink-body",
    canEnter: false,
  };

  return (
    <div className="group relative rounded-2xl p-0.5 transition-all duration-300 hover:bg-gradient-to-br hover:from-brand/15 hover:to-mint-dim">
      <div className="flex h-full flex-col rounded-[calc(1rem-2px)] border border-app-line bg-app-card p-6 shadow-whisper">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${courseTypeStyle[course.course_type] || courseTypeStyle.project}`}
            >
              <BookOpen size={12} />
              {courseTypeLabel[course.course_type] || course.course_type}
            </div>
            <div className={`rounded-full border px-3 py-1 text-[10px] font-bold ${enrollment.style}`}>
              {enrollment.label}
            </div>
          </div>
          <button type="button" className="text-ink-muted hover:text-ink-heading">
            <MoreVertical size={18} />
          </button>
        </div>

        <h5 className="line-clamp-2 h-14 font-headline text-lg font-bold text-ink-heading transition-colors group-hover:text-brand">
          {course.name}
        </h5>

        <p className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
          <User size={14} /> {course.lecturer_name || "Chưa phân công"}
        </p>

        <div className="mt-8 flex flex-col gap-4 border-t border-app-line pt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Mã lớp</span>
            <span className="font-mono font-bold text-brand">{course.code}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Học kỳ</span>
            <span className="font-bold text-ink-heading">
              {course.semester} - {course.academic_year}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-muted">Sinh viên</span>
            <span className="font-bold text-mint">
              {course.student_count} SV
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!enrollment.canEnter) return;
              navigate(`/student/class/${course.id}`);
            }}
            disabled={!enrollment.canEnter}
            className="mt-2 w-full rounded-lg bg-app-inset py-2.5 text-sm font-bold text-ink-heading transition-all hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-app-inset disabled:hover:text-ink-heading"
          >
            {enrollment.canEnter ? "Vào lớp học" : "Chưa thể truy cập"}
          </button>
        </div>
      </div>
    </div>
  );
};
