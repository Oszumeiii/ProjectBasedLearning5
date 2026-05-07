import { Sparkles, Clock } from "lucide-react";

interface AiSummaryProps {
  summary: string;
  toneAnalysis?: string;
  argumentStrength?: string;
  readingEase?: string;
  isProcessed?: boolean;
}

export const AiExecutiveSummary = ({
  summary,
  toneAnalysis,
  argumentStrength,
  readingEase,
  isProcessed = false,
}: AiSummaryProps) => (
  <div className="rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
    <div className="mb-6 flex items-center gap-3">
      <Sparkles className="text-mint" size={22} />
      <h3 className="text-xl font-bold text-ink-heading">AI Executive Summary</h3>
    </div>
    <div className="space-y-4 leading-relaxed text-ink-body">
      <p>{summary}</p>
    </div>
    {isProcessed ? (
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-app-line bg-app-inset p-4">
          <div className="mb-1 text-[10px] font-bold uppercase text-ink-faint">Tone Analysis</div>
          <div className="font-bold text-mint">{toneAnalysis || "N/A"}</div>
        </div>
        <div className="rounded-xl border border-app-line bg-app-inset p-4">
          <div className="mb-1 text-[10px] font-bold uppercase text-ink-faint">Argument Strength</div>
          <div className="font-bold text-ink-heading">{argumentStrength || "N/A"}</div>
        </div>
        <div className="rounded-xl border border-app-line bg-app-inset p-4">
          <div className="mb-1 text-[10px] font-bold uppercase text-ink-faint">Reading Ease</div>
          <div className="font-bold text-ink-heading">{readingEase || "N/A"}</div>
        </div>
      </div>
    ) : (
      <div className="mt-8 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Clock size={18} className="shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          AI đang xử lý báo cáo. Các chỉ số phân tích sẽ hiển thị sau khi hoàn tất.
        </p>
      </div>
    )}
  </div>
);
