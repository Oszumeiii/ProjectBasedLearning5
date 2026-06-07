import { School, Mic, Clock } from "lucide-react";

interface DefensePrepProps {
  questions?: string[];
  isProcessed?: boolean;
}

export const DefensePrepCard = ({ questions, isProcessed = false }: DefensePrepProps) => (
  <div className="h-full rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
    <div className="mb-6 flex items-center gap-3">
      <School className="text-mint" size={22} />
      <h3 className="text-xl font-bold text-ink-heading">Defense Prep</h3>
    </div>
    <p className="mb-8 text-xs italic text-ink-muted">
      AI đề xuất các câu hỏi phản biện dựa trên những điểm yếu trong bài nộp của bạn.
    </p>

    {isProcessed && questions && questions.length > 0 ? (
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={idx} className="rounded-xl border border-app-line border-l-4 border-l-mint bg-app-inset p-5">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-ink-faint">
              Question {idx + 1}
            </div>
            <p className="text-sm font-semibold text-ink-heading">
              &quot;{q}&quot;
            </p>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Clock size={18} className="shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          Câu hỏi phản biện sẽ được AI tạo sau khi báo cáo được phân tích xong.
        </p>
      </div>
    )}

    <button
      type="button"
      disabled={!isProcessed}
      className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl border border-brand/30 py-4 font-bold text-brand transition-all hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Mic size={18} /> Start Practice Session
    </button>
  </div>
);
