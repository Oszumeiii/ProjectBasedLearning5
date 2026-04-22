import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { InstructorClassCard } from "../components/InstructorClassCard";
import { getMyCourses, type Course } from "../../classroom/services/course.service";
import { listReports } from "../../classroom/services/report.service";
import { useAuth } from "../../auth/context/AuthContext";

interface CourseWithReports extends Course {
  reportCount: number;
  pendingCount: number;
}

export const InstructorLobbyPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseWithReports[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await getMyCourses();
        const enriched = await Promise.all(
          coursesData.map(async (c) => {
            try {
              const data = await listReports({ courseId: c.id, limit: 200 });
              const items = data.items || [];
              return {
                ...c,
                reportCount: items.length,
                pendingCount: items.filter(
                  (r: { status?: string }) =>
                    r.status === "pending" || r.status === "under_review"
                ).length,
              };
            } catch {
              return { ...c, reportCount: 0, pendingCount: 0 };
            }
          })
        );
        setCourses(enriched);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-ink-heading">Lớp học của tôi</h3>
          <p className="mt-2 text-ink-muted">
            Xin chào {user?.full_name}. Quản lý các lớp học và báo cáo sinh viên.
          </p>
        </div>
        <Link
          to="/instructor/courses"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-whisper transition-colors hover:bg-brand-hover"
        >
          <Plus size={18} /> Quản lý lớp học
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
          <span className="ml-3 text-ink-muted">Đang tải...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 text-center text-ink-muted">
          <span className="material-symbols-outlined mb-4 block text-5xl text-ink-faint">school</span>
          <p className="text-lg">Chưa có lớp học nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <InstructorClassCard
              key={course.id}
              courseId={course.id}
              code={course.code}
              name={course.name}
              category={course.course_type.toUpperCase()}
              reportCount={course.reportCount}
              totalStudents={course.student_count}
              pendingCount={course.pendingCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};
