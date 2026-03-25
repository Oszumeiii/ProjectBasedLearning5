// src/features/classroom/pages/ClassroomDetailPage.tsx
import { ClassHeader } from "../components/ClassHeader";
import { MaterialItem } from "../components/MaterialItem";
import { AssignmentItem } from "../components/AssignmentItem";
import {
  FolderOpen,
  MessageSquareQuote,
  ListTodo,
  BellRing,
} from "lucide-react";

export const ClassroomDetailPage = () => {
  // Dữ liệu mẫu (Sau này bạn sẽ lấy từ API Supabase dựa trên useParams của React Router)
  const courseInfo = {
    title: "Project Based Learning 5 (PBL5)",
    teacher: "ThS. Nguyễn Văn A",
  };

  const materials = [
    {
      title: "Slide: Hướng dẫn kết nối React với Supabase",
      date: "20/03/2026",
      type: "PDF",
    },
    {
      title: "Tài liệu đặc tả hệ thống DUTSTUDY",
      date: "22/03/2026",
      type: "DOCX",
    },
    {
      title: "Video: Triển khai RAG cho hệ thống thư viện số",
      date: "24/03/2026",
      type: "MP4",
    },
  ];

  const assignments = [
    {
      title: "Báo cáo Tiến độ Sprint 1 - Thiết kế Database",
      dueDate: "28/03/2026, 23:59",
      status: "pending" as const,
    },
    {
      title: "Nộp source code giao diện Component UI",
      dueDate: "30/03/2026, 12:00",
      status: "pending" as const,
    },
    {
      title: "Đăng ký đề tài PBL5",
      dueDate: "15/03/2026, 23:59",
      status: "graded" as const,
      score: "Đạt",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b1326] animate-in fade-in duration-500 pb-12">
      {/* 1. Thanh thông tin môn học ở trên cùng */}
      <ClassHeader title={courseInfo.title} teacher={courseInfo.teacher} />

      {/* 2. Nội dung chính chia làm 2 cột */}
      <div className="max-w-7xl mx-auto px-8 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI (Chiếm 2/3 màn hình): Tài liệu và Trợ giảng AI */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Danh sách tài liệu */}
          <section>
            <h3 className="flex items-center gap-2 text-[#dae2fd] font-black text-lg mb-4">
              <FolderOpen className="text-[#adc6ff]" size={20} /> Tài liệu bài
              giảng
            </h3>
            <div className="space-y-3">
              {materials.map((material, index) => (
                <MaterialItem key={index} {...material} />
              ))}
            </div>
          </section>

          {/* Section: Khung Chatbot / RAG System */}
          <section className="p-6 rounded-2xl bg-gradient-to-br from-[#131b2e] to-[#0566d9]/10 border border-[#0566d9]/20 shadow-lg shadow-[#0566d9]/5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[#adc6ff] font-bold flex items-center gap-2 mb-2 text-lg">
                  <MessageSquareQuote size={22} /> Trợ lý học tập AI
                </h3>
                <p className="text-sm text-[#c6c6cd] max-w-md leading-relaxed">
                  Bạn có thắc mắc về tài liệu Supabase hay cách chia Component?
                  Hãy đặt câu hỏi, hệ thống sẽ tự động trích xuất câu trả lời từ
                  tài liệu của môn học.
                </p>
              </div>
              <button className="px-6 py-2.5 bg-[#0566d9] text-white rounded-lg font-bold text-sm hover:bg-[#004395] transition-colors shadow-md">
                Mở khung Chat
              </button>
            </div>
          </section>
        </div>

        {/* CỘT PHẢI (Chiếm 1/3 màn hình): Thông báo và Deadline */}
        <div className="space-y-6">
          {/* Card: Thông báo */}
          <div className="p-6 rounded-xl bg-[#222a3d] border border-slate-800/50">
            <h3 className="text-[#dae2fd] font-bold mb-4 flex items-center gap-2">
              <BellRing className="text-[#4fdbc8]" size={18} />
              Thông báo mới
            </h3>
            <div className="text-sm text-[#c6c6cd] border-l-2 border-[#4fdbc8] pl-4 py-2 bg-[#131b2e]/50 rounded-r-lg">
              <p className="font-bold text-[#dae2fd] mb-1">
                Cập nhật yêu cầu Sprint 1
              </p>
              <p className="text-xs leading-relaxed">
                Các nhóm chú ý hoàn thiện phần phân quyền Role
                (Student/Teacher/Admin) trước buổi duyệt tiến độ tuần tới.
              </p>
            </div>
          </div>

          {/* Card: Bài tập & Đồ án */}
          <div className="p-6 rounded-xl bg-[#131b2e] border border-slate-800/50 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[#dae2fd] font-bold flex items-center gap-2">
                <ListTodo className="text-[#adc6ff]" size={20} />
                Bài tập & Đồ án
              </h3>
              {/* Đếm số lượng bài tập chưa nộp */}
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {assignments.filter((a) => a.status === "pending").length} Cần
                nộp
              </span>
            </div>

            <div className="space-y-3">
              {assignments.map((assignment, index) => (
                <AssignmentItem key={index} {...assignment} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
