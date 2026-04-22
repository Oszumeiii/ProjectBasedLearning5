// src/features/feedback/components/GradeBanner.tsx
import { Verified, User } from "lucide-react";

interface GradeBannerProps {
  title: string;
  instructorName: string;
  comment: string;
  /** Điểm 0–100; nếu không có thì hiển thị khối “Phản hồi” thay cho điểm số */
  score?: number;
}

export const GradeBanner = ({ title, instructorName, comment, score }: GradeBannerProps) => (
  <section className="relative overflow-hidden rounded-2xl border border-app-line bg-gradient-to-r from-app-card to-app-elevated p-8 shadow-whisper">
    <div className="absolute right-0 top-0 p-4 opacity-[0.07]">
      <Verified size={120} className="text-ink-heading" />
    </div>
    <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
      <div className="space-y-2">
        <span className="rounded-full border border-mint/30 bg-mint-dim px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-teal-900">
          Graded Assessment
        </span>
        <h2 className="text-4xl font-bold tracking-tight text-ink-heading">{title}</h2>
        <p className="max-w-2xl italic text-ink-body">&quot;{comment}&quot;</p>
        <div className="flex items-center gap-4 pt-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-app-line bg-app-inset">
            <User size={16} className="text-ink-muted" />
          </div>
          <span className="text-sm font-semibold text-ink-heading">{instructorName}</span>
        </div>
      </div>

      {score != null ? (
        <div className="flex min-w-[160px] flex-col items-center justify-center rounded-2xl border border-app-line bg-app-card p-6">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-ink-muted">Instructor Score</span>
          <div className="text-6xl font-black text-brand">
            {score}
            <span className="text-2xl text-ink-muted">/100</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-app-track">
            <div className="h-full bg-brand" style={{ width: `${score}%` }} />
          </div>
        </div>
      ) : (
        <div className="flex min-w-[200px] flex-col items-center justify-center rounded-2xl border border-app-line bg-app-card p-6">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-ink-muted">Phản hồi giảng viên</span>
          <div className="mt-2 text-center text-sm font-semibold text-brand">Nhận xét</div>
        </div>
      )}
    </div>
  </section>
);
