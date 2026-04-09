// src/features/feedback/components/DefensePrepCard.tsx
import { School, Mic } from "lucide-react";

export const DefensePrepCard = () => (
  <div className="bg-[#171f33]/40 backdrop-blur-md rounded-2xl p-8 border border-[#adc6ff]/10 h-full">
    <div className="flex items-center gap-3 mb-6">
      <School className="text-[#adc6ff]" size={22} />
      <h3 className="font-bold text-xl text-[#dae2fd]">Defense Prep</h3>
    </div>
    <p className="text-xs text-[#798098] mb-8 italic">
      AI đề xuất các câu hỏi phản biện dựa trên những điểm yếu trong bài nộp của
      bạn.
    </p>

    <div className="space-y-4">
      {[1, 2, 3].map((q) => (
        <div
          key={q}
          className="p-5 bg-[#222a3d] rounded-xl border-l-4 border-[#adc6ff]"
        >
          <div className="text-[10px] text-[#adc6ff] font-black uppercase tracking-widest mb-2">
            Question {q}
          </div>
          <p className="text-sm font-semibold text-[#dae2fd]">
            "How does your RAG system handle hallucinations in high-stakes
            document summarization?"
          </p>
        </div>
      ))}
    </div>

    <button className="w-full mt-10 py-4 border border-[#adc6ff]/30 text-[#adc6ff] font-bold rounded-xl hover:bg-[#adc6ff]/10 transition-all flex items-center justify-center gap-2 shadow-lg">
      <Mic size={18} /> Start Practice Session
    </button>
  </div>
);
