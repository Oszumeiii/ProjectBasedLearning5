import { AlertTriangle, Info, CheckCircle2, Clock } from "lucide-react";

interface DeficiencyIssue {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
}

interface DeficiencyAnalysisProps {
  plagiarismScore?: number | null;
  issues?: DeficiencyIssue[];
  isProcessed?: boolean;
}

const ICON_MAP = {
  critical: { icon: AlertTriangle, color: "text-red-600", bg: "border-red-200 bg-red-50" },
  warning: { icon: Info, color: "text-amber-600", bg: "border-amber-200 bg-amber-50" },
  info: { icon: CheckCircle2, color: "text-ink-muted", bg: "border-app-line bg-app-inset" },
};

export const DeficiencyAnalysis = ({
  plagiarismScore,
  issues,
  isProcessed = false,
}: DeficiencyAnalysisProps) => {
  if (!isProcessed) {
    return (
      <div className="rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
        <div className="mb-6 flex items-center gap-3">
          <AlertTriangle className="text-ink-faint" size={22} />
          <h3 className="text-xl font-bold text-ink-heading">Deficiency Analysis</h3>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Clock size={18} className="shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">
            Chưa có dữ liệu phân tích. Hệ thống sẽ phân tích khi báo cáo được xử lý xong.
          </p>
        </div>
      </div>
    );
  }

  const criticalCount = issues?.filter((i) => i.severity === "critical").length || 0;

  return (
    <div className="rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-600" size={22} />
          <h3 className="text-xl font-bold text-ink-heading">Deficiency Analysis</h3>
        </div>
        {criticalCount > 0 && (
          <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold text-red-800">
            {criticalCount} CRITICAL ISSUE{criticalCount > 1 ? "S" : ""}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-4">
          {issues && issues.length > 0 ? (
            issues.map((item, i) => {
              const style = ICON_MAP[item.severity];
              return (
                <div key={i} className={`flex items-start gap-4 rounded-xl border p-4 ${style.bg}`}>
                  <style.icon className={style.color} size={18} />
                  <div>
                    <div className="text-sm font-bold text-ink-heading">{item.title}</div>
                    <p className="mt-1 text-xs text-ink-muted">{item.description}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-start gap-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <CheckCircle2 className="text-green-600" size={18} />
              <div>
                <div className="text-sm font-bold text-ink-heading">Không có vấn đề nghiêm trọng</div>
                <p className="mt-1 text-xs text-ink-muted">Báo cáo đạt yêu cầu cơ bản.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-app-line bg-app-inset p-8">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-app-track"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="364.4"
                strokeDashoffset={364.4 - (364.4 * (plagiarismScore ?? 0)) / 100}
                className="text-mint"
              />
            </svg>
            <span className="text-2xl font-black text-ink-heading">{plagiarismScore ?? 0}%</span>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm font-bold text-ink-heading">Plagiarism Gauge</div>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-mint">
              {(plagiarismScore ?? 0) < 20 ? "SAFE: LOW OVERLAP" : (plagiarismScore ?? 0) < 50 ? "MODERATE" : "HIGH RISK"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
