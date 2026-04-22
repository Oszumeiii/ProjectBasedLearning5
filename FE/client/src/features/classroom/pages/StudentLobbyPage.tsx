import { useCallback, useEffect, useState } from "react";
import { ClassCard } from "../components/StudentClassCard";
import { School, LayoutGrid, List } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { getMyCourses, type Course } from "../services/course.service";
import { useLocation } from "react-router-dom";

export const StudentLobbyPage = () => {
  useAuth();
  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tải danh sách lớp");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses, location.key]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center p-8 rounded-xl bg-gradient-to-br from-app-card to-app-elevated relative overflow-hidden border border-app-line shadow-whisper">
          <div className="relative z-10">
            <h3 className="font-headline text-3xl font-extrabold text-ink-heading tracking-tight">
              Chào mừng trở lại, {user?.full_name}
            </h3>
            <p className="text-ink-muted mt-2 max-w-md">
              Bạn đang tham gia {courses.length} lớp học. Hãy kiểm tra tiến độ
              và cập nhật bài tập mới nhất.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-glow rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div> */}

      {/* <div className="p-6 rounded-xl bg-app-card border border-app-line flex flex-col justify-between shadow-whisper">
          <div className="flex justify-between items-start">
            <span className="text-ink-muted font-medium text-sm">
              Số lớp đang học
            </span>
            <span className="text-mint font-bold text-2xl">
              {courses.length}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-ink-muted">{user?.email}</p>
            <p className="text-xs text-ink-muted mt-1">
              Chuyên ngành: {user?.major || "Chưa cập nhật"}
            </p>
          </div>
          <p className="text-[10px] text-ink-muted mt-4 uppercase tracking-widest font-bold">
            {user?.role === "student" ? "Sinh viên" : user?.role}
          </p>
        </div> */}
      {/* </div> */}

      {/* Classes Grid */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h4 className="flex items-center gap-2 font-headline text-xl font-bold text-ink-heading">
            <School className="text-mint" size={24} /> Các lớp đã tham gia
          </h4>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-app-line bg-app-card p-2 text-mint shadow-whisper"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-ink-muted transition-all hover:bg-app-inset"
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            <span className="ml-3 text-ink-muted">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchCourses}
              className="mt-4 rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-hover"
            >
              Thử lại
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined mb-4 block text-5xl text-ink-faint">school</span>
            <p className="text-lg text-ink-muted">Bạn chưa tham gia lớp nào</p>
            <p className="mt-2 text-sm text-ink-faint">
              Nhập mã lớp ở thanh trên để tham gia lớp học
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <ClassCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
