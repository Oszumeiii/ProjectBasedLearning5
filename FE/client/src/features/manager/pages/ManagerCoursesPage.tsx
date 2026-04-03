import { useEffect, useState } from "react";
import { School, Users, BookOpen } from "lucide-react";
import { listCourses, type Course } from "../../classroom/services/course.service";

export const ManagerCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listCourses();
        setCourses(data);
      } catch (e: unknown) {
        setError("Không tải được danh sách khóa học.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-slate-400">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-8 text-center text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-extrabold text-[#dae2fd] tracking-tight flex items-center gap-2">
          <School className="text-amber-400" size={28} /> Khóa học
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Tổng quan các lớp / khóa học trên hệ thống
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#131b2e] px-8 py-16 text-center text-slate-500">
          Chưa có khóa học nào.
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-800/80 bg-[#131b2e] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400/90">
                  <BookOpen size={12} /> {c.code}
                </div>
                <h3 className="text-lg font-bold text-[#dae2fd] mt-1">{c.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {c.lecturer_name || "—"} · {c.semester} {c.academic_year}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Users size={16} className="text-[#4fdbc8]" />
                  <span className="font-semibold text-[#dae2fd]">{c.student_count}</span>
                  <span className="text-slate-500">sinh viên</span>
                </span>
                <span className="text-xs px-2 py-1 rounded-md bg-slate-800 text-slate-400 capitalize">
                  {c.course_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
