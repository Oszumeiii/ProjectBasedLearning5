import React, { useEffect, useState } from "react";
import { InstructorClassCard } from "../components/InstructorClassCard";
import { listCourses, type Course } from "../../classroom/services/course.service";
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
        const coursesData = await listCourses();
        const enriched = await Promise.all(
          coursesData.map(async (c) => {
            try {
              const data = await listReports({ courseId: c.id, limit: 200 });
              const items = data.items || [];
              return {
                ...c,
                reportCount: items.length,
                pendingCount: items.filter(
                  (r: any) =>
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
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h3 className="text-3xl font-manrope font-extrabold text-[#dae2fd] tracking-tight">
            Lớp học của tôi
          </h3>
          <p className="text-slate-400 mt-2">
            Xin chào {user?.full_name}. Quản lý các lớp học và báo cáo sinh viên.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-slate-400">Đang tải...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">
            school
          </span>
          <p className="text-lg">Chưa có lớp học nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
