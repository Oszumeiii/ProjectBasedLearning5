// src/features/materials/components/AcademicLibraryContent.tsx
import { MaterialCard } from "../components/MaterialCard";
import { FolderOpen, BarChart3, ShieldCheck } from "lucide-react";

export const AcademicLibraryPage = () => {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-[#0b1326]">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h2 className="text-4xl font-black text-[#dae2fd] tracking-tight mb-2">
            Academic Materials
          </h2>
          <p className="text-[#c6c6cd] text-lg max-w-2xl">
            Truy cập toàn bộ nguồn tài liệu, bài giảng và các bài nghiên cứu
            được hệ thống RAG lập chỉ mục.
          </p>
        </header>

        {/* Lưới tài liệu (Bento Grid) */}
        <div className="grid grid-cols-12 gap-6">
          <MaterialCard
            isFeatured
            title="CS504: Advanced Machine Learning Principles.pdf"
            description="Phân tích chi tiết về kiến trúc thần kinh, chiến lược tối ưu hóa và yêu cầu dự án cuối kỳ cho học kỳ Thu 2026."
            size="2.4 MB"
            type="PDF"
            tags={["Được trích dẫn trong 12 ghi chú", "Cập nhật 2 giờ trước"]}
          />
          <MaterialCard
            title="Lecture 04: Transformer Architectures"
            description="Ghi chú tóm tắt về cơ chế self-attention và positional encoding."
            size="1.1 MB"
            type="DOCX"
          />
          <MaterialCard
            title="Grading Rubric V2.1"
            description="Tiêu chí đánh giá chi tiết cho bài báo cáo nghiên cứu cuối kỳ."
            size="840 KB"
            type="PDF"
          />
        </div>

        {/* Section: Coverage Analytics (Bảng phân tích) */}
        <div className="mt-12 p-8 bg-gradient-to-br from-[#171f33] to-[#131b2e] rounded-2xl border border-[#adc6ff]/10 relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[#4fdbc8]/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#798098] mb-2">
                Độ phủ kiến thức
              </div>
              <div className="text-3xl font-black text-[#dae2fd]">84%</div>
              <p className="text-[11px] text-[#c6c6cd] mt-1 text-pretty">
                Các khái niệm trong Syllabus đã được ánh xạ vào ngữ cảnh chat.
              </p>
              <div className="mt-4 h-1.5 w-full bg-[#2d3449] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4fdbc8] to-[#adc6ff]"
                  style={{ width: "84%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#798098] mb-2">
                Tổng tham chiếu
              </div>
              <div className="text-3xl font-black text-[#dae2fd]">2,410</div>
              <p className="text-[11px] text-[#c6c6cd] mt-1">
                Token đã được lập chỉ mục qua 14 tài liệu học thuật.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#798098] mb-2">
                Độ tin cậy AI
              </div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-black text-[#4fdbc8]">Cao</div>
                <ShieldCheck className="text-[#4fdbc8]" size={24} />
              </div>
              <p className="text-[11px] text-[#c6c6cd] mt-1">
                Dựa trên chất lượng truy xuất ngữ nghĩa gần đây.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
