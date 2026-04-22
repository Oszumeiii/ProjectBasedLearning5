// src/features/feedback/components/DefensePrepCard.tsx
import { School, Mic } from "lucide-react";

export const DefensePrepCard = () => (
  <div className="h-full rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
    <div className="mb-6 flex items-center gap-3">
      <School className="text-mint" size={22} />
      <h3 className="text-xl font-bold text-ink-heading">Defense Prep</h3>
    </div>
    <p className="mb-8 text-xs italic text-ink-muted">
      AI đề xuất các câu hỏi phản biện dựa trên những điểm yếu trong bài nộp của bạn.
    </p>

    <div className="space-y-4">
      {[1, 2, 3].map((q) => (
        <div key={q} className="rounded-xl border border-app-line border-l-4 border-l-mint bg-app-inset p-5">
          <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-ink-faint">
            Question {q}
          </div>
          <p className="text-sm font-semibold text-ink-heading">
            &quot;How does your RAG system handle hallucinations in high-stakes document
            summarization?&quot;
          </p>
        </div>
      ))}
    </div>

    <button
      type="button"
      className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 py-4 font-bold text-brand transition-all hover:bg-brand/5"
    >
      <Mic size={18} /> Start Practice Session
    </button>
  </div>
);
