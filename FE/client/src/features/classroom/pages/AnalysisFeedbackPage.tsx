// src/features/feedback/pages/AnalysisFeedbackPage.tsx
import { GradeBanner } from "../components/GradeBanner";
import { AiExecutiveSummary } from "../components/AiExecutiveSummary";
import { DeficiencyAnalysis } from "../components/DeficiencyAnalysis";
import { DefensePrepCard } from "../components/DefensePrepCard";

export const AnalysisFeedbackPage = () => {
  const data = {
    title: "Thesis Proposal Analysis",
    instructor: "Dr. Julian Vance",
    score: 88,
    comment:
      "Một bản tóm tắt toàn diện về kiến trúc thần kinh. Chiều sâu kỹ thuật tốt nhưng cần tinh chỉnh phần phương pháp nghiên cứu.",
    summary: `Bản thảo "Advanced RAG Architectures for Legal Compliance" thể hiện trình độ kỹ thuật cao trong việc tối ưu hóa cơ sở dữ liệu vector. Sinh viên đã xác định đúng các hạn chế của việc truy xuất KNN cơ bản và đề xuất cơ chế hybrid reranking mới...`,
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0b1326] no-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. Phần điểm số và nhận xét từ giảng viên */}
        <GradeBanner
          title={data.title}
          instructorName={data.instructor}
          score={data.score}
          comment={data.comment}
        />

        {/* 2. Grid phân tích chi tiết */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cột trái: Tóm tắt AI & Lỗi */}
          <div className="lg:col-span-8 space-y-8">
            <AiExecutiveSummary summary={data.summary} />
            <DeficiencyAnalysis plagiarismScore={6} />
          </div>

          {/* Cột phải: Phản biện AI */}
          <div className="lg:col-span-4">
            <DefensePrepCard />
          </div>
        </div>

        {/* 3. Footer: Độ tin cậy & Nguồn trích dẫn */}
        <footer className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#798098] uppercase font-bold tracking-widest">
              Analysis Confidence
            </span>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-2 w-32 bg-[#171f33] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4fdbc8] to-[#adc6ff]"
                  style={{ width: "94%" }}
                ></div>
              </div>
              <span className="text-xs font-bold text-[#4fdbc8]">94%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#798098]">Citations verified:</span>
            <div className="flex gap-2">
              {["IEEE-2024", "ACM-DL", "ArXiv"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#001c18] text-[#4fdbc8] text-[10px] font-bold rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
