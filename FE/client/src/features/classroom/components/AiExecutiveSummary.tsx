// src/features/feedback/components/AiExecutiveSummary.tsx
import { Sparkles } from "lucide-react";

export const AiExecutiveSummary = ({ summary }: { summary: string }) => (
  <div className="rounded-2xl border border-app-line bg-app-card p-8 shadow-whisper">
    <div className="mb-6 flex items-center gap-3">
      <Sparkles className="text-mint" size={22} />
      <h3 className="text-xl font-bold text-ink-heading">AI Executive Summary</h3>
    </div>
    <div className="space-y-4 leading-relaxed text-ink-body">
      <p>{summary}</p>
    </div>
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-app-line bg-app-inset p-4">
        <div className="mb-1 text-[10px] font-bold uppercase text-ink-faint">Tone Analysis</div>
        <div className="font-bold text-mint">Academic / Objective</div>
      </div>
      <div className="rounded-xl border border-app-line bg-app-inset p-4">
        <div className="mb-1 text-[10px] font-bold uppercase text-ink-faint">Argument Strength</div>
        <div className="font-bold text-ink-heading">Strong (74%)</div>
      </div>
      <div className="rounded-xl border border-app-line bg-app-inset p-4">
        <div className="mb-1 text-[10px] font-bold uppercase text-ink-faint">Reading Ease</div>
        <div className="font-bold text-ink-heading">Post-Graduate</div>
      </div>
    </div>
  </div>
);
