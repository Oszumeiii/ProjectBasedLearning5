import { useEffect, useState } from "react";
import { ClassCard } from "../components/StudentClassCard";
import { School, LayoutGrid, List } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { listCourses, type Course } from "../services/course.service";

export const StudentLobbyPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await listCourses();
        setCourses(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Không thể tải danh sách lớp");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center p-8 rounded-xl bg-gradient-to-br from-[#131b2e] to-[#171f33] relative overflow-hidden border border-slate-800/50">
          <div className="relative z-10">
            <h3 className="font-headline text-3xl font-extrabold text-[#dae2fd] tracking-tight">
              Chào mừng trở lại, {user?.full_name}
            </h3>
            <p className="text-[#c6c6cd] mt-2 max-w-md">
              Bạn đang tham gia {courses.length} lớp học. Hãy kiểm tra tiến độ
              và cập nhật bài tập mới nhất.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0566d9]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div> */}

      {/* <div className="p-6 rounded-xl bg-[#222a3d] border border-slate-800/50 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[#c6c6cd] font-medium text-sm">
              Số lớp đang học
            </span>
            <span className="text-[#4fdbc8] font-bold text-2xl">
              {courses.length}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-[#c6c6cd]">{user?.email}</p>
            <p className="text-xs text-[#c6c6cd] mt-1">
              Chuyên ngành: {user?.major || "Chưa cập nhật"}
            </p>
          </div>
          <p className="text-[10px] text-[#c6c6cd] mt-4 uppercase tracking-widest font-bold">
            {user?.role === "student" ? "Sinh viên" : user?.role}
          </p>
        </div> */}
      {/* </div> */}

      {/* Classes Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-headline text-xl font-bold text-[#dae2fd] flex items-center gap-2">
            <School className="text-[#adc6ff]" size={24} /> Các lớp đã tham gia
          </h4>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg bg-[#222a3d] text-[#adc6ff] shadow-inner">
              <LayoutGrid size={20} />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:bg-[#222a3d] transition-all">
              <List size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-slate-400">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Thử lại
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-slate-600 mb-4 block">
              school
            </span>
            <p className="text-slate-400 text-lg">Bạn chưa tham gia lớp nào</p>
            <p className="text-slate-500 text-sm mt-2">
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
