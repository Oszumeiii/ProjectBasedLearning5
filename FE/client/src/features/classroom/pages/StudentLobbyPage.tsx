import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Thêm import này
import { School, LayoutGrid, List, Loader2, AlertCircle } from "lucide-react";

// Import các thành phần nội bộ từ Feature Classroom
import { ClassCard } from "../components/StudentClassCard";
import { classroomService } from "../services/classroom.service";
import { Course } from "../types";

export const StudentLobbyPage = () => {
  const navigate = useNavigate(); // 2. Khởi tạo hook điều hướng

  // 1. Quản lý trạng thái danh sách lớp và các trạng thái UI
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Hàm xử lý khi nhấn vào View Details
  const handleViewDetails = (id: number) => {
    // Chuyển hướng tới trang chi tiết (đảm bảo Route này đã được định nghĩa trong App.tsx)
    navigate(`/student/class/${id}`);
  };

  // 2. Hàm kích hoạt gọi API từ Service
  const loadStudentCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await classroomService.getMyEnrollments();

      // Kiểm tra cấu trúc response để tránh lỗi runtime
      const items = response.items || [];
      setCourses(items);
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu lớp học:", err);
      setError("Không thể tải danh sách lớp học. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Hook useEffect để tự động chạy khi component mount
  useEffect(() => {
    loadStudentCourses();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* SECTION 1: WELCOME & OVERALL STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col justify-center p-8 rounded-xl bg-gradient-to-br from-[#131b2e] to-[#171f33] relative overflow-hidden border border-slate-800/50">
          <div className="relative z-10">
            <h3 className="font-headline text-3xl font-extrabold text-[#dae2fd] tracking-tight">
              Chào mừng trở lại!
            </h3>
            <p className="text-[#c6c6cd] mt-2 max-w-md">
              Bạn đang tham gia <strong>{courses.length}</strong> lớp học phần.
              Hãy kiểm tra các mốc thời gian quan trọng để hoàn thành bài tập
              đúng hạn.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0566d9]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        </div>

        <div className="p-6 rounded-xl bg-[#222a3d] border border-slate-800/50 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[#c6c6cd] font-medium text-sm">
              Tiến độ hoàn thành
            </span>
            <span className="text-[#4fdbc8] font-bold">84%</span>
          </div>
          <div className="mt-4 h-2 w-full bg-[#171f33] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#adc6ff] to-[#4fdbc8] w-[84%]"></div>
          </div>
          <p className="text-[10px] text-[#c6c6cd] mt-4 uppercase tracking-widest font-bold">
            Mục tiêu: Hoàn thành 2 bài tập tuần này
          </p>
        </div>
      </div>

      {/* SECTION 2: COURSE LIST CONTROL */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-headline text-xl font-bold text-[#dae2fd] flex items-center gap-2">
            <School className="text-[#adc6ff]" size={24} /> Các lớp học phần của
            tôi
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

        {/* XỬ LÝ CÁC TRẠNG THÁI HIỂN THỊ */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="animate-pulse">Đang đồng bộ dữ liệu lớp học...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-red-500/5 rounded-xl border border-red-500/20">
            <AlertCircle className="text-red-400 mb-2" size={32} />
            <p className="text-red-200">{error}</p>
            <button
              onClick={loadStudentCourses}
              className="mt-4 text-sm text-red-400 underline hover:text-red-300"
            >
              Thử lại ngay
            </button>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <ClassCard
                key={course.id}
                course={course}
                onClick={handleViewDetails} // 4. Truyền hàm onClick vào đây
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-[#131b2e] rounded-2xl border border-dashed border-slate-800">
            <School className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500">
              Bạn chưa đăng ký tham gia lớp học nào.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
