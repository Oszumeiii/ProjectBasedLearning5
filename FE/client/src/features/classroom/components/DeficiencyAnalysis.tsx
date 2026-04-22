// src/features/feedback/components/DeficiencyAnalysis.tsx
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export const DeficiencyAnalysis = ({
  plagiarismScore,
}: {
  plagiarismScore: number;
}) => (
  <div className="rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-red-600" size={22} />
        <h3 className="text-xl font-bold text-ink-heading">Deficiency Analysis</h3>
      </div>
      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-bold text-red-800">
        3 CRITICAL ISSUES
      </span>
    </div>

    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-4">
        {[
          {
            icon: AlertTriangle,
            color: "text-red-600",
            title: "Missing bibliography entries",
            desc: "4 citations in the text are not present in the reference list.",
            bg: "border-red-200 bg-red-50",
          },
          {
            icon: Info,
            color: "text-ink-muted",
            title: "Chapter 4 too short",
            desc: "Evaluation section is 40% below the recommended length.",
            bg: "border-app-line bg-app-inset",
          },
          {
            icon: CheckCircle2,
            color: "text-ink-muted",
            title: "APA Formatting errors",
            desc: "Inconsistent header styling throughout pages 12-18.",
            bg: "border-app-line bg-app-inset",
          },
        ].map((item, i) => (
          <div key={i} className={`flex items-start gap-4 rounded-xl border p-4 ${item.bg}`}>
            <item.icon className={item.color} size={18} />
            <div>
              <div className="text-sm font-bold text-ink-heading">{item.title}</div>
              <p className="mt-1 text-xs text-ink-muted">{item.desc}</p>
            </div>
          </div>
        ))}
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
              strokeDashoffset={364.4 - (364.4 * plagiarismScore) / 100}
              className="text-mint"
            />
          </svg>
          <span className="text-2xl font-black text-ink-heading">{plagiarismScore}%</span>
        </div>
        <div className="mt-4 text-center">
          <div className="text-sm font-bold text-ink-heading">Plagiarism Gauge</div>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-mint">SAFE: LOW OVERLAP</p>
        </div>
      </div>
    </div>
  </div>
);
