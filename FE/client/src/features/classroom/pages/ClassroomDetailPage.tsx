import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { classroomService } from "../services/classroom.service";
import { ClassHeader } from "../components/ClassHeader";
import { MaterialItem } from "../components/MaterialItem";
import { AssignmentItem } from "../components/AssignmentItem";
import {
  FolderOpen,
  MessageSquareQuote,
  ListTodo,
  BellRing,
  Loader2,
  Users,
  FileText,
} from "lucide-react";

export const ClassroomDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await classroomService.getCourseDetails(Number(id));
        setCourse(data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Không thể tải thông tin lớp học",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id]);

  // Mock data cho Materials & Assignments (Vì BE hiện tại chưa trả về mảng này trong getCourseById)
  const materials = [
    {
      title: "Slide: Hướng dẫn kết nối React với Backend",
      date: "20/03/2026",
      type: "PDF",
    },
    { title: "Tài liệu đặc tả DB", date: "22/03/2026", type: "DOCX" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p>Đang tải dữ liệu lớp học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex items-center justify-center text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] animate-in fade-in duration-500 pb-12">
      {/* 1. Header lấy từ dữ liệu thực */}
      <ClassHeader
        title={`${course?.name} (${course?.code})`}
        teacher={course?.lecturer_name || "Chưa có giảng viên"}
      />

      <div className="max-w-7xl mx-auto px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: Tài liệu & AI */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Thông tin tổng quan (Thêm mới dựa trên BE) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#1a2333] border border-slate-800 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Sinh viên</p>
                <p className="text-xl font-bold text-white">
                  {course?.student_count}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#1a2333] border border-slate-800 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Báo cáo đã nộp</p>
                <p className="text-xl font-bold text-white">
                  {course?.report_count}
                </p>
              </div>
            </div>
          </div>

          <section>
            <h3 className="flex items-center gap-2 text-[#dae2fd] font-black text-lg mb-4">
              <FolderOpen className="text-[#adc6ff]" size={20} /> Tài liệu bài
              giảng
            </h3>
            <div className="space-y-3">
              {materials.map((m, i) => (
                <MaterialItem key={i} {...m} />
              ))}
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-gradient-to-br from-[#131b2e] to-[#0566d9]/10 border border-[#0566d9]/20 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[#adc6ff] font-bold flex items-center gap-2 mb-2 text-lg">
                  <MessageSquareQuote size={22} /> Trợ lý học tập AI
                </h3>
                <p className="text-sm text-[#c6c6cd] max-w-md">
                  Hệ thống RAG đang sẵn sàng. Bạn có thể hỏi về các tài liệu
                  trong lớp {course?.name}.
                </p>
              </div>
              <button className="px-6 py-2.5 bg-[#0566d9] text-white rounded-lg font-bold text-sm hover:bg-[#004395] transition-all">
                Mở khung Chat
              </button>
            </div>
          </section>
        </div>

        {/* CỘT PHẢI: Thông báo & Deadline */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#222a3d] border border-slate-800/50">
            <h3 className="text-[#dae2fd] font-bold mb-4 flex items-center gap-2">
              <BellRing className="text-[#4fdbc8]" size={18} /> Thông báo
            </h3>
            <p className="text-sm text-slate-400 italic">
              Hiện chưa có thông báo mới từ giảng viên.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#131b2e] border border-slate-800/50">
            <h3 className="text-[#dae2fd] font-bold mb-4 flex items-center gap-2">
              <ListTodo className="text-[#adc6ff]" size={20} /> Bài tập & Đồ án
            </h3>
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Chức năng nộp bài đang được cập nhật...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
